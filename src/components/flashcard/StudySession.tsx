'use client';

import { useState, useCallback } from 'react';
import FlashCard from './FlashCard';
import { reviewCard, Rating, type Grade } from '@/lib/srs';
import Link from 'next/link';

interface StudyItem {
  id: string;
  front: React.ReactNode;
  back: React.ReactNode;
}

interface Props {
  contentType: 'kanji' | 'vocab';
  items: StudyItem[];
  title: string;
  backHref: string;
}

const RATING_BUTTONS: { grade: Grade; label: string; color: string; shortcut: string }[] = [
  { grade: Rating.Again, label: 'Again', color: 'bg-red-500 hover:bg-red-600', shortcut: '1' },
  { grade: Rating.Hard, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', shortcut: '2' },
  { grade: Rating.Good, label: 'Good', color: 'bg-emerald-500 hover:bg-emerald-600', shortcut: '3' },
  { grade: Rating.Easy, label: 'Easy', color: 'bg-blue-500 hover:bg-blue-600', shortcut: '4' },
];

export default function StudySession({ contentType, items, title, backHref }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const handleRate = useCallback(
    (grade: Grade) => {
      const item = items[current];
      reviewCard(contentType, item.id, grade);
      setReviewed((r) => r + 1);
      setFlipped(false);

      if (current + 1 < items.length) {
        setCurrent((c) => c + 1);
      } else {
        setCurrent(items.length); // trigger finished state
      }
    },
    [contentType, current, items],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="text-5xl">🎉</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">All caught up!</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">No cards due for review right now.</p>
        </div>
        <Link
          href={backHref}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Back
        </Link>
      </div>
    );
  }

  if (current >= items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="text-5xl">✅</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Session Complete</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Reviewed {reviewed} cards.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCurrent(0);
              setReviewed(0);
              setFlipped(false);
            }}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Study More
          </button>
          <Link
            href={backHref}
            className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Done
          </Link>
        </div>
      </div>
    );
  }

  const item = items[current];
  const progress = ((current + 1) / items.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        <span>{title}</span>
        <span>{current + 1} / {items.length}</span>
      </div>

      <div className="w-full max-w-sm bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <FlashCard
        front={item.front}
        back={item.back}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {flipped && (
        <div className="flex gap-2 w-full max-w-sm">
          {RATING_BUTTONS.map(({ grade, label, color, shortcut }) => (
            <button
              key={label}
              onClick={() => handleRate(grade)}
              className={`flex-1 py-3 rounded-xl text-white font-medium text-sm transition-colors ${color}`}
            >
              <span className="block">{label}</span>
              <span className="block text-xs opacity-70">{shortcut}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
