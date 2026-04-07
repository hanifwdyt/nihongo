import { pgTable, serial, text, integer, real, uniqueIndex, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  currentLevel: text('current_level').notNull().default('n5'),
  onboardingDone: integer('onboarding_done').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const placementResults = pgTable('placement_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  assignedLevel: text('assigned_level').notNull(),
  scoreN5: integer('score_n5').default(0),
  scoreN4: integer('score_n4').default(0),
  scoreN3: integer('score_n3').default(0),
  totalQuestions: integer('total_questions').notNull(),
  totalCorrect: integer('total_correct').notNull(),
  takenAt: text('taken_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const srsCards = pgTable('srs_cards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  contentType: text('content_type').notNull(),
  contentId: text('content_id').notNull(),
  jlptLevel: text('jlpt_level').notNull(),
  state: integer('state').default(0),
  due: text('due').notNull(),
  stability: real('stability').default(0),
  difficulty: real('difficulty').default(0),
  reps: integer('reps').default(0),
  lapses: integer('lapses').default(0),
  lastReview: text('last_review'),
}, (table) => [
  uniqueIndex('srs_cards_unique').on(table.userId, table.contentType, table.contentId),
]);

export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  quizType: text('quiz_type').notNull(),
  jlptLevel: text('jlpt_level'),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  missedItems: text('missed_items'),
  completedAt: text('completed_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const streaks = pgTable('streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActiveDate: text('last_active_date'),
});

export const buddyMessages = pgTable('buddy_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const buddyMemory = pgTable('buddy_memory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  category: text('category').notNull(),
  content: text('content').notNull(),
  source: text('source'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const dailyActivity = pgTable('daily_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  itemsReviewed: integer('items_reviewed').default(0),
  itemsLearned: integer('items_learned').default(0),
  quizTaken: integer('quiz_taken').default(0),
  minutesActive: integer('minutes_active').default(0),
}, (table) => [
  uniqueIndex('daily_activity_unique').on(table.userId, table.date),
]);
