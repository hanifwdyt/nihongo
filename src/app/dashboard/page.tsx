import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { srsCards, quizResults, streaks } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { n5Kanji } from '@/data/n5-kanji';
import { n5Vocab } from '@/data/n5-vocab';
import Link from 'next/link';

const LEVELS = [
  { id: 'n5', label: 'N5', name: 'Beginner', totalKanji: n5Kanji.length, totalVocab: n5Vocab.length },
  { id: 'n4', label: 'N4', name: 'Elementary', totalKanji: 0, totalVocab: 0 },
  { id: 'n3', label: 'N3', name: 'Intermediate', totalKanji: 0, totalVocab: 0 },
  { id: 'n2', label: 'N2', name: 'Upper Intermediate', totalKanji: 0, totalVocab: 0 },
  { id: 'n1', label: 'N1', name: 'Advanced', totalKanji: 0, totalVocab: 0 },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!user.onboardingDone) redirect('/onboarding');

  const db = getDb();

  // Fetch streak
  const streakData = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, user.id))
    .limit(1);
  const currentStreak = streakData[0]?.currentStreak ?? 0;
  const longestStreak = streakData[0]?.longestStreak ?? 0;

  // Fetch SRS card counts for current level
  const kanjiLearned = await db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(
      and(
        eq(srsCards.userId, user.id),
        eq(srsCards.contentType, 'kanji'),
        eq(srsCards.jlptLevel, user.currentLevel),
      ),
    );

  const vocabLearned = await db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(
      and(
        eq(srsCards.userId, user.id),
        eq(srsCards.contentType, 'vocab'),
        eq(srsCards.jlptLevel, user.currentLevel),
      ),
    );

  // Due cards
  const now = new Date().toISOString();
  const dueCards = await db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(
      and(
        eq(srsCards.userId, user.id),
        sql`${srsCards.due} <= ${now}`,
      ),
    );

  // Quiz average
  const quizAvg = await db
    .select({
      avg: sql<number>`ROUND(AVG(CAST(${quizResults.score} AS FLOAT) / ${quizResults.total} * 100))`,
    })
    .from(quizResults)
    .where(
      and(
        eq(quizResults.userId, user.id),
        eq(quizResults.jlptLevel, user.currentLevel),
      ),
    );

  const kanjiCount = Number(kanjiLearned[0]?.count ?? 0);
  const vocabCount = Number(vocabLearned[0]?.count ?? 0);
  const dueCount = Number(dueCards[0]?.count ?? 0);
  const avgScore = quizAvg[0]?.avg ?? null;

  const currentLevelData = LEVELS.find((l) => l.id === user.currentLevel) ?? LEVELS[0];
  const displayName = user.displayName || user.name;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome back, {displayName}! {'\u{1F38C}'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Keep up the great work on your Japanese journey.
          </p>
        </div>
      </div>

      {/* Streak widget */}
      <div className="flex gap-4">
        <div className="flex-1 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border border-orange-200 dark:border-orange-800 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{'\u{1F525}'}</span>
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Current streak</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border border-purple-200 dark:border-purple-800 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{'\u{1F3C6}'}</span>
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {longestStreak} day{longestStreak !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Best streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Due cards reminder */}
      {dueCount > 0 && (
        <Link
          href={`/learn/${user.currentLevel}/study`}
          className="block bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{'\u{1F4DA}'}</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                You have {dueCount} card{dueCount !== 1 ? 's' : ''} due for review!
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Tap here to start reviewing
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Current level section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                {currentLevelData.label}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {currentLevelData.name}
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Your current level
            </p>
          </div>
          <Link
            href={`/learn/${user.currentLevel}`}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            Continue Learning
          </Link>
        </div>

        {/* Progress bars */}
        <div className="space-y-4">
          <ProgressBar
            label="Kanji"
            current={kanjiCount}
            total={currentLevelData.totalKanji}
            color="emerald"
          />
          <ProgressBar
            label="Vocabulary"
            current={vocabCount}
            total={currentLevelData.totalVocab}
            color="sky"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Quiz average
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {avgScore !== null ? `${avgScore}%` : 'No quizzes yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Other levels */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Other Levels
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LEVELS.filter((l) => l.id !== user.currentLevel).map((level) => {
            const isLocked = levelToNumber(level.id) < levelToNumber(user.currentLevel);
            return (
              <div
                key={level.id}
                className={`rounded-xl border p-4 text-center ${
                  isLocked
                    ? 'border-zinc-200 dark:border-zinc-800 opacity-50'
                    : 'border-zinc-200 dark:border-zinc-800 opacity-40'
                }`}
              >
                <span className="text-lg">{isLocked ? '\u{1F513}' : '\u{1F512}'}</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{level.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{level.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat with Sensei */}
      <Link
        href="/buddy"
        className="block bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{'\u{1F9D1}\u{200D}\u{1F3EB}'}</span>
          <div>
            <p className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">
              Chat with Sensei
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Practice conversation, ask questions, or get grammar help
            </p>
          </div>
          <span className="ml-auto text-emerald-400 dark:text-emerald-600 text-xl">{'\u{2192}'}</span>
        </div>
      </Link>
    </div>
  );
}

function ProgressBar({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: 'emerald' | 'sky';
}) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const bgColor = color === 'emerald' ? 'bg-emerald-600' : 'bg-sky-600';
  const trackColor = 'bg-zinc-200 dark:bg-zinc-700';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {current}/{total}
        </span>
      </div>
      <div className={`w-full h-2 ${trackColor} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${bgColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function levelToNumber(level: string): number {
  const num = parseInt(level.replace('n', ''));
  // N5 = 5 (easiest), N1 = 1 (hardest), lower number = harder
  return num;
}
