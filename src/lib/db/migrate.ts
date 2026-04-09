import type { Pool } from 'pg';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    current_level TEXT NOT NULL DEFAULT 'n5',
    onboarding_done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    updated_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )`,
  `CREATE TABLE IF NOT EXISTS placement_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_level TEXT NOT NULL,
    score_n5 INTEGER DEFAULT 0,
    score_n4 INTEGER DEFAULT 0,
    score_n3 INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    total_correct INTEGER NOT NULL,
    taken_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )`,
  `CREATE TABLE IF NOT EXISTS srs_cards (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    quiz_type TEXT NOT NULL,
    jlpt_level TEXT,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    missed_items TEXT,
    completed_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )`,
  `CREATE TABLE IF NOT EXISTS streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS buddy_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )`,
  `CREATE TABLE IF NOT EXISTS buddy_memory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    created_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    updated_at TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )`,
  `CREATE TABLE IF NOT EXISTS daily_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    items_reviewed INTEGER DEFAULT 0,
    items_learned INTEGER DEFAULT 0,
    quiz_taken INTEGER DEFAULT 0,
    minutes_active INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
  )`,
  // Indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_srs_user_due ON srs_cards(user_id, due)`,
  `CREATE INDEX IF NOT EXISTS idx_srs_user_type ON srs_cards(user_id, content_type)`,
  `CREATE INDEX IF NOT EXISTS idx_buddy_msg_user ON buddy_messages(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_buddy_mem_user ON buddy_memory(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_results(user_id)`,
];

export async function migrate(pool: Pool) {
  const client = await pool.connect();
  try {
    for (const sql of MIGRATIONS) {
      await client.query(sql);
    }
  } finally {
    client.release();
  }
}
