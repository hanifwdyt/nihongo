export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users, srsCards, quizResults, streaks, buddyMessages } from '@/lib/db/schema';
import { eq, desc, and, lte, sql } from 'drizzle-orm';
import { getAI, BUDDY_MODEL } from '@/lib/ai/client';
import { buildSenseiPrompt } from '@/lib/ai/persona';
import { toolDefinitions, executeToolCall } from '@/lib/ai/tools';
import { getMemories } from '@/lib/ai/memory';
import type OpenAI from 'openai';

const MAX_TOOL_ROUNDS = 5;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = (await request.json()) as { message: string };
  if (!message?.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const db = getDb();
  const userId = session.userId;

  // Load user profile
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Load stats
  const now = new Date().toISOString();

  const kanjiCards = await db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'kanji')));

  const vocabCards = await db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'vocab')));

  const [dueCards] = await db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), lte(srsCards.due, now)));

  const [streak] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  const recentQuizzes = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.completedAt))
    .limit(5);

  // Load memories
  const memories = await getMemories(userId);

  // Load last 20 messages for context
  const historyRows = await db
    .select()
    .from(buddyMessages)
    .where(eq(buddyMessages.userId, userId))
    .orderBy(desc(buddyMessages.createdAt))
    .limit(20);
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
    memories.map((m) => ({ category: m.category, content: m.content })),
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

            // If the model decides to call tools during streaming, collect and skip
            // (unlikely after tool rounds, but handle gracefully)
            if (delta?.tool_calls) continue;

            const text = delta?.content;
            if (text) {
              fullContent += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', data: text })}\n\n`),
              );
            }
          }

          // Send done event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();

          // Save assistant message after stream completes
          const finalContent = fullContent || 'Gomen ne~ Sensei lagi error. Coba lagi ya!';
          await db.insert(buddyMessages)
            .values({ userId, role: 'assistant', content: finalContent });
        } catch (err) {
          console.error('Stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', data: 'Stream interrupted' })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
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
