'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { n5Reading } from '@/data/reading/n5-reading';

const CATEGORY_LABELS: Record<string, string> = {
  'daily-life': 'Daily Life',
  story: 'Story',
  email: 'Email',
  description: 'Description',
  letter: 'Letter',
  culture: 'Culture',
};

export default function ReadingListPage() {
  const { level } = useParams<{ level: string }>();
  const passages = level === 'n5' ? n5Reading : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/learn/${level}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back to {level.toUpperCase()}
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
          {level.toUpperCase()} Reading Practice
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {passages.length} passages &middot; Read with furigana &middot; Test comprehension
        </p>
      </div>

      <div className="space-y-3">
        {passages.map((p) => (
          <Link
            key={p.id}
            href={`/learn/${level}/reading/${p.id}`}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {p.title}
                </span>
                <span className="text-sm text-zinc-400">({p.titleReading})</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </span>
                <span>~{p.estimatedMinutes} min</span>
                <span>{p.questions.length} questions</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < p.difficulty
                      ? 'bg-emerald-500'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>

      {passages.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-zinc-500">Reading passages for this level coming soon!</p>
        </div>
      )}
    </div>
  );
}
