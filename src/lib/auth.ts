import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb, ensureMigrated } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
export const JWT_SECRET = new TextEncoder().encode(jwtSecret || 'dev-secret-change-me');
const COOKIE_NAME = 'nihongo-session';

const BCRYPT_ROUNDS = 12;

// Detect legacy SHA-256 hashes (exactly 64 hex chars)
function isLegacySha256(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}

async function legacySha256(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function registerUser(email: string, password: string, name: string) {
  await ensureMigrated();
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await db.insert(users).values({
    email,
    passwordHash: hash,
    name,
  }).returning();

  return result;
}

export async function verifyCredentials(email: string, password: string) {
  await ensureMigrated();
  const db = getDb();
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (found.length === 0) return null;

  const user = found[0];
  let valid = false;

  if (isLegacySha256(user.passwordHash)) {
    // Legacy SHA-256: verify and upgrade to bcrypt
    const sha256Hash = await legacySha256(password);
    if (sha256Hash !== user.passwordHash) return null;
    valid = true;

    // Upgrade hash to bcrypt
    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
  } else {
    // bcrypt verification
    valid = await bcrypt.compare(password, user.passwordHash);
  }

  return valid ? user : null;
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

  await ensureMigrated();
  const db = getDb();
  const found = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return found[0] ?? null;
}

export { COOKIE_NAME };
