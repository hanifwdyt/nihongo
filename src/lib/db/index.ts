import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from './migrate';

const dbPath = process.env.DATABASE_PATH || './data/nihongo.db';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('busy_timeout = 5000');
    sqlite.pragma('foreign_keys = ON');
    _db = drizzle(sqlite, { schema });
    migrate(sqlite);
  }
  return _db;
}

export type DB = ReturnType<typeof getDb>;
