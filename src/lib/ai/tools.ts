import { eq, desc, and, lte, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { srsCards, quizResults, buddyMemory, streaks } from '@/lib/db/schema';
import { getMemories, saveMemory } from '@/lib/ai/memory';
import { n5Kanji } from '@/data/n5-kanji';
import { n5Vocab } from '@/data/n5-vocab';
import type OpenAI from 'openai';

export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_user_progress',
      description:
        'Get the current learning progress and stats for the user, including kanji/vocab reviewed, streak, and due cards.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_memory',
      description:
        'Save something you learned about the user — their strengths, weaknesses, preferences, goals, or interesting facts. Use this proactively!',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['strength', 'weakness', 'preference', 'fact', 'goal', 'note'],
            description: 'The category of the memory.',
          },
          content: {
            type: 'string',
            description: 'What you want to remember about the user.',
          },
        },
        required: ['category', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_memories',
      description: 'Recall all stored memories about the user.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'quiz_user',
      description:
        'Generate a quick quiz question for the user. Can be kanji meaning, kanji reading, or vocab meaning.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['kanji_meaning', 'kanji_reading', 'vocab_meaning'],
            description: 'The type of quiz question to generate.',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'filter_content',
      description:
        'Filter/customize what content is shown on the kanji or vocab page. Use when user asks to see specific types of kanji/vocab (e.g. "show me number kanji", "only food vocab", "kanji with 1 stroke").',
      parameters: {
        type: 'object',
        properties: {
          contentType: {
            type: 'string',
            enum: ['kanji', 'vocab'],
            description: 'Whether to filter kanji or vocabulary.',
          },
          query: {
            type: 'string',
            description: 'Search/filter query describing what user wants (e.g. "numbers", "food", "time").',
          },
          items: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific item IDs/characters to show. For kanji: characters like ["一","二","三"]. For vocab: ids like ["mizu","taberu"].',
          },
          label: {
            type: 'string',
            description: 'Human-readable label for the filter (e.g. "Number Kanji", "Food Vocabulary").',
          },
        },
        required: ['contentType', 'label'],
      },
    },
  },
];

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  userId: number,
): Promise<string> {
  switch (toolName) {
    case 'get_user_progress':
      return JSON.stringify(getUserProgress(userId));
    case 'save_memory':
      return JSON.stringify(
        executeSaveMemory(userId, args.category as string, args.content as string),
      );
    case 'get_memories':
      return JSON.stringify(executeGetMemories(userId));
    case 'quiz_user':
      return JSON.stringify(generateQuiz(args.type as string));
    case 'filter_content':
      return JSON.stringify(filterContent(args));
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

function getUserProgress(userId: number) {
  const db = getDb();
  const now = new Date().toISOString();

  const kanjiCards = db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'kanji')))
    .all();

  const vocabCards = db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.contentType, 'vocab')))
    .all();

  const dueCards = db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), lte(srsCards.due, now)))
    .get();

  const streak = db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .get();

  const recentQuizzes = db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.completedAt))
    .limit(5)
    .all();

  return {
    kanji: {
      reviewed: kanjiCards.filter((c) => (c.reps ?? 0) > 0).length,
      total: kanjiCards.length,
    },
    vocab: {
      reviewed: vocabCards.filter((c) => (c.reps ?? 0) > 0).length,
      total: vocabCards.length,
    },
    streak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    dueCards: dueCards?.count ?? 0,
    recentQuizzes: recentQuizzes.map((q) => ({
      type: q.quizType,
      level: q.jlptLevel,
      score: `${q.score}/${q.total}`,
      date: q.completedAt,
    })),
  };
}

function executeSaveMemory(userId: number, category: string, content: string) {
  const memory = saveMemory(userId, category, content, 'buddy_chat');
  return { saved: true, id: memory.id, category, content };
}

function executeGetMemories(userId: number) {
  const memories = getMemories(userId);
  return memories.map((m) => ({
    id: m.id,
    category: m.category,
    content: m.content,
    createdAt: m.createdAt,
  }));
}

function generateQuiz(type: string) {
  switch (type) {
    case 'kanji_meaning': {
      const kanji = n5Kanji[Math.floor(Math.random() * n5Kanji.length)];
      return {
        type: 'kanji_meaning',
        question: `Apa arti dari kanji **${kanji.character}**?`,
        answer: kanji.meanings.join(', '),
        hint: `On'yomi: ${kanji.onyomi.join(', ')} | Kun'yomi: ${kanji.kunyomi.join(', ')}`,
        examples: kanji.examples.slice(0, 2).map((e) => `${e.word} (${e.reading}) = ${e.meaning}`),
      };
    }
    case 'kanji_reading': {
      const kanji = n5Kanji[Math.floor(Math.random() * n5Kanji.length)];
      return {
        type: 'kanji_reading',
        question: `Bagaimana cara baca kanji **${kanji.character}** (${kanji.meanings.join(', ')})?`,
        answer: `On'yomi: ${kanji.onyomi.join(', ')} | Kun'yomi: ${kanji.kunyomi.join(', ')}`,
        hint: `Artinya: ${kanji.meanings.join(', ')}`,
        examples: kanji.examples.slice(0, 2).map((e) => `${e.word} (${e.reading}) = ${e.meaning}`),
      };
    }
    case 'vocab_meaning': {
      const vocab = n5Vocab[Math.floor(Math.random() * n5Vocab.length)];
      return {
        type: 'vocab_meaning',
        question: `Apa arti dari **${vocab.word}** (${vocab.reading})?`,
        answer: vocab.meanings.join(', '),
        hint: `Part of speech: ${vocab.partOfSpeech}`,
        example: `${vocab.exampleJa} = ${vocab.exampleEn}`,
      };
    }
    default:
      return { error: 'Unknown quiz type' };
  }
}

function filterContent(args: Record<string, unknown>) {
  const contentType = args.contentType as string;
  const query = (args.query as string) ?? '';
  const items = (args.items as string[]) ?? [];
  const label = (args.label as string) ?? 'Custom Filter';

  // If specific items provided, validate them
  if (items.length > 0) {
    if (contentType === 'kanji') {
      const valid = items.filter((c) => n5Kanji.some((k) => k.character === c));
      return {
        applied: true,
        contentType,
        label,
        items: valid,
        count: valid.length,
        pageFilter: { type: contentType, customItems: valid, label },
      };
    } else {
      const valid = items.filter((id) => n5Vocab.some((v) => v.id === id));
      return {
        applied: true,
        contentType,
        label,
        items: valid,
        count: valid.length,
        pageFilter: { type: contentType, customItems: valid, label },
      };
    }
  }

  // Search by query in meanings/categories
  if (query && contentType === 'kanji') {
    const q = query.toLowerCase();
    const matched = n5Kanji.filter((k) =>
      k.meanings.some((m) => m.toLowerCase().includes(q)) ||
      k.character.includes(q),
    );
    return {
      applied: true,
      contentType,
      label,
      items: matched.map((k) => k.character),
      count: matched.length,
      pageFilter: { type: contentType, customItems: matched.map((k) => k.character), query, label },
    };
  }

  if (query && contentType === 'vocab') {
    const q = query.toLowerCase();
    const matched = n5Vocab.filter((v) =>
      v.meanings.some((m) => m.toLowerCase().includes(q)) ||
      v.word.includes(q) ||
      v.partOfSpeech.includes(q),
    );
    return {
      applied: true,
      contentType,
      label,
      items: matched.map((v) => v.id),
      count: matched.length,
      pageFilter: { type: contentType, customItems: matched.map((v) => v.id), query, label },
    };
  }

  return { applied: false, error: 'No filter criteria provided' };
}
