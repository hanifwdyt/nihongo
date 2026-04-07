import type Database from 'better-sqlite3';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    current_level TEXT NOT NULL DEFAULT 'n5',
    onboarding_done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS placement_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_level TEXT NOT NULL,
    score_n5 INTEGER DEFAULT 0,
    score_n4 INTEGER DEFAULT 0,
    score_n3 INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    total_correct INTEGER NOT NULL,
    taken_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS srs_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    jlpt_level TEXT NOT NULL,
    state INTEGER DEFAULT 0,
    due TEXT NOT NULL,
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 0,
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,
    last_review TEXT,
    UNIQUE(user_id, content_type, content_id)
  )`,
  `CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    quiz_type TEXT NOT NULL,
    jlpt_level TEXT,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    missed_items TEXT,
    completed_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS buddy_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS buddy_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    items_reviewed INTEGER DEFAULT 0,
    items_learned INTEGER DEFAULT 0,
    quiz_taken INTEGER DEFAULT 0,
    minutes_active INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
  )`,
];

export function migrate(db: Database.Database) {
  for (const sql of MIGRATIONS) {
    db.exec(sql);
  }
}
