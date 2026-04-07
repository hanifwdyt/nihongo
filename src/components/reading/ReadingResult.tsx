'use client';

import Link from 'next/link';
import { getCPMFeedback } from '@/lib/reading';
import CompanionFeedback from '@/components/companion/CompanionFeedback';

interface Props {
  score: number;
  totalQuestions: number;
  cpm: number;
  charCount: number;
  timeSeconds: number;
  level: string;
  passageTitle: string;
  onRetry: () => void;
}

export default function ReadingResult({
  score,
  totalQuestions,
  cpm,
  charCount,
  timeSeconds,
  level,
  passageTitle,
  onRetry,
}: Props) {
  const pct = totalQuestions > 0 ? score / totalQuestions : 0;
  const emoji = pct >= 0.8 ? '🟢' : pct >= 0.5 ? '🟡' : '🔴';
  const cpmFeedback = getCPMFeedback(cpm);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="text-5xl">{emoji}</div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Reading Complete!</h2>
        <p className="mt-1 text-zinc-500">{passageTitle}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-2xl font-bold text-emerald-600">{cpm}</div>
          <div className="text-xs text-zinc-500 mt-1">chars/min</div>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {score}/{totalQuestions}
          </div>
          <div className="text-xs text-zinc-500 mt-1">correct</div>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {Math.floor(timeSeconds / 60)}:{(timeSeconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-zinc-500 mt-1">time</div>
        </div>
      </div>

      <p className="text-sm text-zinc-500 text-center">{cpmFeedback.message}</p>

      <CompanionFeedback
        score={score}
        total={totalQuestions}
        quizType="Reading"
        missedSummary={`Read ${charCount} chars at ${cpm} CPM`}
      />

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Read Again
        </button>
        <Link
          href={`/learn/${level}/reading`}
          className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          More Passages
        </Link>
      </div>
    </div>
  );
}
