'use client';

import { type QuizResult, getFeedback } from '@/lib/quiz';
import CompanionFeedback from '@/components/companion/CompanionFeedback';
import Link from 'next/link';

interface Props {
  score: number;
  total: number;
  results: QuizResult[];
  onRetry: () => void;
}

const LEVEL_EMOJI = { red: '🔴', yellow: '🟡', green: '🟢' } as const;

export default function QuizResultView({ score, total, results, onRetry }: Props) {
  const { level, message } = getFeedback(score, total);
  const missed = results.filter((r) => !r.correct);
  const missedSummary = missed.slice(0, 5).map((r) => `${r.question.kana}→${r.question.romaji}`).join(', ');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="text-6xl">{LEVEL_EMOJI[level]}</div>

      <div className="text-center">
        <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {score} / {total}
        </div>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">{message}</p>
      </div>

      <CompanionFeedback
        score={score}
        total={total}
        quizType="Kana"
        missedSummary={missedSummary}
      />

      {missed.length > 0 && (
        <div className="w-full">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Missed ({missed.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {missed.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                <span className="text-xl">{r.question.kana}</span>
                <div className="text-right text-sm">
                  <div className="text-emerald-600">{r.question.romaji}</div>
                  <div className="text-red-400 line-through">{r.userAnswer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Retry
        </button>
        <Link
          href="/kana"
          className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Back to Kana
        </Link>
      </div>

      {/* Signup CTA for non-logged-in users */}
      <div className="w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Want to track your progress and unlock kanji, vocab, and AI tutor?
        </p>
        <Link
          href="/register"
          className="inline-block mt-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Sign up free
        </Link>
      </div>
    </div>
  );
}
