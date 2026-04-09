export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { getDb, ensureMigrated } from '@/lib/db';
import { users, srsCards, quizResults, streaks, buddyMessages } from '@/lib/db/schema';
import { eq, desc, and, lte, sql } from 'drizzle-orm';
import { getAI, BUDDY_MODEL } from '@/lib/ai/client';
import { buildSenseiPrompt } from '@/lib/ai/persona';
import { toolDefinitions, executeToolCall } from '@/lib/ai/tools';
import { getMemories } from '@/lib/ai/memory';
import type OpenAI from 'openai';

const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGE_LENGTH = 2000;

// Simple in-memory rate limiter
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = (await request.json()) as { message: string };
  if (!message?.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: 'Message too long' }, { status: 400 });
  }

  const userId = session.userId;

  if (!checkRateLimit(userId)) {
    return Response.json({ error: 'Too many messages. Please wait a moment.' }, { status: 429 });
  }

  await ensureMigrated();
  const db = getDb();

  // Load user profile
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Load stats in parallel
  const now = new Date().toISOString();

  const [kanjiCards, vocabCards, [dueCards], [streak], recentQuizzes, memoriesData, historyRows] =
    await Promise.all([
      db.select({ id: srsCards.id, reps: srsCards.reps }).from(srsCards)
        .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'kanji'))),
      db.select({ id: srsCards.id, reps: srsCards.reps }).from(srsCards)
        .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'vocab'))),
      db.select({ count: sql<number>`count(*)` }).from(srsCards)
        .where(and(eq(srsCards.userId, userId), lte(srsCards.due, now))),
      db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
      db.select().from(quizResults).where(eq(quizResults.userId, userId))
        .orderBy(desc(quizResults.completedAt)).limit(5),
      getMemories(userId),
      db.select().from(buddyMessages).where(eq(buddyMessages.userId, userId))
        .orderBy(desc(buddyMessages.createdAt)).limit(20),
    ]);

  const history = historyRows.reverse();

  // Build system prompt
  const systemPrompt = buildSenseiPrompt(
    {
      name: user.displayName ?? user.name,
      currentLevel: user.currentLevel,
      createdAt: user.createdAt,
    },
    {
      kanjiReviewed: kanjiCards.filter((c) => (c.reps ?? 0) > 0).length,
      kanjiTotal: kanjiCards.length,
      vocabReviewed: vocabCards.filter((c) => (c.reps ?? 0) > 0).length,
      vocabTotal: vocabCards.length,
      streak: streak?.currentStreak ?? 0,
      dueCards: dueCards?.count ?? 0,
    },
    memoriesData.map((m) => ({ category: m.category, content: m.content })),
    recentQuizzes.map((q) => ({
      quizType: q.quizType,
      jlptLevel: q.jlptLevel,
      score: q.score,
      total: q.total,
      completedAt: q.completedAt,
    })),
  );

  // Build messages array
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(
      (m) =>
        ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }) satisfies OpenAI.Chat.Completions.ChatCompletionMessageParam,
    ),
    { role: 'user', content: message },
  ];

  // Process tool call rounds (non-streamed) first
  let pageFilter: Record<string, unknown> | null = null;
  let rounds = 0;

  try {
    // Do tool call rounds non-streamed
    while (rounds < MAX_TOOL_ROUNDS) {
      const response = await getAI().chat.completions.create({
        model: BUDDY_MODEL,
        messages,
        tools: toolDefinitions,
        max_tokens: 1024,
      });

      const choice = response.choices[0];
      if (!choice.message.tool_calls?.length) {
        // No tool calls — break out to stream the final response
        break;
      }

      // Add assistant message with tool calls
      messages.push(choice.message);

      // Execute each tool call
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== 'function') continue;
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeToolCall(
          toolCall.function.name,
          args,
          userId,
        );

        // Check for pageFilter in tool result
        try {
          const parsed = JSON.parse(result);
          if (parsed.pageFilter) {
            pageFilter = parsed.pageFilter;
          }
        } catch {}

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      rounds++;
    }

    // Save user message now (before streaming starts)
    await db.insert(buddyMessages)
      .values({ userId, role: 'user', content: message });

    // Stream the final response
    const stream = await getAI().chat.completions.create({
      model: BUDDY_MODEL,
      messages,
      tools: toolDefinitions,
      max_tokens: 1024,
      stream: true,
    });

    let fullContent = '';
    const encoder = new TextEncoder();

    // Track save promise so we can ensure it completes
    let saveResolve: () => void;
    const savePromise = new Promise<void>((resolve) => { saveResolve = resolve; });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send pageFilter first if exists
          if (pageFilter) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'pageFilter', data: pageFilter })}\n\n`),
            );
          }

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.tool_calls) continue;

            const text = delta?.content;
            if (text) {
              fullContent += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', data: text })}\n\n`),
              );
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err instanceof Error ? err.message : err);
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', data: 'Stream interrupted' })}\n\n`),
            );
            controller.close();
          } catch { /* controller already closed */ }
        } finally {
          // Always save assistant message, even if client disconnected
          const finalContent = fullContent || 'Gomen ne~ Sensei lagi error. Coba lagi ya!';
          try {
            await db.insert(buddyMessages)
              .values({ userId, role: 'assistant', content: finalContent });
          } catch (saveErr) {
            console.error('Failed to save assistant message:', saveErr instanceof Error ? saveErr.message : saveErr);
          }
          saveResolve!();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI API error:', error instanceof Error ? error.message : error);
    return Response.json(
      { error: 'Failed to get response from Sensei' },
      { status: 500 },
    );
  }
}
