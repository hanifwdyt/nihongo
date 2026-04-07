import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { buddyMemory } from '@/lib/db/schema';

export async function getMemories(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(buddyMemory)
    .where(eq(buddyMemory.userId, userId));
}

export async function saveMemory(
  userId: number,
  category: string,
  content: string,
  source?: string,
) {
  const db = getDb();
  const [result] = await db
    .insert(buddyMemory)
    .values({
      userId,
      category,
      content,
      source: source ?? 'buddy_chat',
    })
    .returning();
  return result;
}

export async function updateMemory(id: number, content: string) {
  const db = getDb();
  const [result] = await db
    .update(buddyMemory)
    .set({ content, updatedAt: new Date().toISOString() })
    .where(eq(buddyMemory.id, id))
    .returning();
  return result;
}

export async function deleteMemory(id: number) {
  const db = getDb();
  const [result] = await db
    .delete(buddyMemory)
    .where(eq(buddyMemory.id, id))
    .returning();
  return result;
}
