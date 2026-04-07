import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || '';

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _migrated = false;

function getPool(): Pool {
  if (!_pool) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _pool = new Pool({ connectionString: DATABASE_URL });
  }
  return _pool;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  if (!_migrated) {
    _migrated = true;
    // Run migrations async, don't block
    import('./migrate').then(({ migrate }) => migrate(getPool())).catch(console.error);
  }
  return _db;
}

export type DB = ReturnType<typeof getDb>;
