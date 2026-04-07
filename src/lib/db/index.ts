import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { migrate } from './migrate';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/nihongo';

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _migrated = false;

export function getDb() {
  if (!_db) {
    _pool = new Pool({ connectionString: DATABASE_URL });
    _db = drizzle(_pool, { schema });
  }
  if (!_migrated) {
    _migrated = true;
    migrate(_pool!).catch(console.error);
  }
  return _db;
}

export type DB = ReturnType<typeof getDb>;
