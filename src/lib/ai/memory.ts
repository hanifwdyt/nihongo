import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { buddyMemory } from '@/lib/db/schema';

export function getMemories(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(buddyMemory)
    .where(eq(buddyMemory.userId, userId))
    .all();
}

export function saveMemory(
  userId: number,
  category: string,
  content: string,
  source?: string,
) {
  const db = getDb();
  const results = db
    .insert(buddyMemory)
    .values({
      userId,
      category,
      content,
      source: source ?? 'buddy_chat',
    })
    .returning()
    .all();
  return results[0];
}

export function updateMemory(id: number, content: string) {
  const db = getDb();
  return db
    .update(buddyMemory)
    .set({ content, updatedAt: new Date().toISOString() })
    .where(eq(buddyMemory.id, id))
    .returning()
    .get();
}

export function deleteMemory(id: number) {
  const db = getDb();
  return db
    .delete(buddyMemory)
    .where(eq(buddyMemory.id, id))
    .returning()
    .get();
}
