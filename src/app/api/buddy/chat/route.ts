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

  // Call AI with tool loop
  let response: OpenAI.Chat.Completions.ChatCompletion;
  let rounds = 0;

  try {
    response = await getAI().chat.completions.create({
      model: BUDDY_MODEL,
      messages,
      tools: toolDefinitions,
      max_tokens: 1024,
    });

    // Handle tool calls in a loop
    while (rounds < MAX_TOOL_ROUNDS) {
      const choice = response.choices[0];
      if (!choice.message.tool_calls?.length) {
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

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Call again with tool results
      response = await getAI().chat.completions.create({
        model: BUDDY_MODEL,
        messages,
        tools: toolDefinitions,
        max_tokens: 1024,
      });

      rounds++;
    }
  } catch (error) {
    console.error('AI API error:', error instanceof Error ? error.message : error);
    return Response.json(
      { error: 'Failed to get response from Sensei' },
      { status: 500 },
    );
  }

  const assistantMessage =
    response.choices[0]?.message?.content ?? 'Gomen ne~ Sensei lagi error. Coba lagi ya!';

  // Save user message
  await db.insert(buddyMessages)
    .values({ userId, role: 'user', content: message });

  // Save assistant message
  await db.insert(buddyMessages)
    .values({ userId, role: 'assistant', content: assistantMessage });

  // Check if any tool call returned a pageFilter
  let pageFilter = null;
  for (const msg of messages) {
    if ('role' in msg && msg.role === 'tool' && typeof msg.content === 'string') {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.pageFilter) {
          pageFilter = parsed.pageFilter;
        }
      } catch {}
    }
  }

  return Response.json({ response: assistantMessage, pageFilter });
}
