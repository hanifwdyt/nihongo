import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { buddyMessages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const messages = db
    .select({
      id: buddyMessages.id,
      role: buddyMessages.role,
      content: buddyMessages.content,
      createdAt: buddyMessages.createdAt,
    })
    .from(buddyMessages)
    .where(eq(buddyMessages.userId, session.userId))
    .orderBy(desc(buddyMessages.createdAt))
    .limit(50)
    .all()
    .reverse();

  return Response.json({ messages });
}
