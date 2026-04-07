import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me',
);
const COOKIE_NAME = 'nihongo-session';

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function registerUser(email: string, password: string, name: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const hash = await hashPassword(password);
  const [result] = await db.insert(users).values({
    email,
    passwordHash: hash,
    name,
  }).returning();

  return result;
}

export async function verifyCredentials(email: string, password: string) {
  const db = getDb();
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (found.length === 0) return null;

  const hash = await hashPassword(password);
  if (hash !== found[0].passwordHash) return null;

  return found[0];
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as number };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ userId: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const db = getDb();
  const found = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return found[0] ?? null;
}

export { COOKIE_NAME };
