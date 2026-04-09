import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || '';

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _migrationPromise: Promise<void> | null = null;

function getPool(): Pool {
  if (!_pool) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _pool = new Pool({
      connectionString: DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }
  return _pool;
}

function ensureMigrated(): Promise<void> {
  if (!_migrationPromise) {
    _migrationPromise = import('./migrate')
      .then(({ migrate }) => migrate(getPool()))
      .catch((err) => {
        // Reset so next call retries
        _migrationPromise = null;
        console.error('Migration failed:', err);
        throw err;
      });
  }
  return _migrationPromise;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
    // Start migration (non-blocking for module init, but callers should await ensureMigrated)
    ensureMigrated();
  }
  return _db;
}

/** Await this before making DB queries to ensure tables exist */
export { ensureMigrated };

export type DB = ReturnType<typeof getDb>;
