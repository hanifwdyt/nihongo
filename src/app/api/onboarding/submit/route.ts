import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users, placementResults, buddyMessages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { level, scores, totalQuestions, totalCorrect } = body;

    if (!level) {
      return Response.json({ error: 'Level is required' }, { status: 400 });
    }

    const db = getDb();

    // Save placement result
    await db.insert(placementResults)
      .values({
        userId: session.userId,
        assignedLevel: level,
        scoreN5: scores?.n5 ?? 0,
        scoreN4: scores?.n4 ?? 0,
        scoreN3: scores?.n3 ?? 0,
        totalQuestions: totalQuestions ?? 0,
        totalCorrect: totalCorrect ?? 0,
      });

    // Update user level and mark onboarding done
    await db.update(users)
      .set({
        currentLevel: level,
        onboardingDone: 1,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, session.userId));

    // Insert Sensei greeting message
    await db.insert(buddyMessages)
      .values({
        userId: session.userId,
        role: 'assistant',
        content:
          'Hajimemashite! Watashi wa Sensei desu~ \u3053\u308C\u304B\u3089\u4E00\u7DD2\u306B\u9811\u5F35\u308D\u3046\u306D\uFF01 (Nice to meet you! Let\'s do our best together!) \u{1F31F}',
      });

    return Response.json({ success: true, level });
  } catch (err) {
    console.error('Onboarding submit error:', err);
    return Response.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
