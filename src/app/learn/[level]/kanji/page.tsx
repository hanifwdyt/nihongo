'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { n5Kanji } from '@/data/n5-kanji';
import { useCompanionStore } from '@/store/companion';

export default function LevelKanjiPage() {
  const { level } = useParams<{ level: string }>();
  const [search, setSearch] = useState('');
  const { pageFilter, clearPageFilter } = useCompanionStore();

  const kanji = level === 'n5' ? n5Kanji : [];

  const filtered = kanji.filter((k) => {
    // Apply companion filter if active
    if (pageFilter?.type === 'kanji' && pageFilter.customItems) {
      if (!pageFilter.customItems.includes(k.character)) return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      k.character.includes(q) ||
      k.meanings.some((m) => m.toLowerCase().includes(q)) ||
      k.onyomi.some((r) => r.includes(q)) ||
      k.kunyomi.some((r) => r.includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/learn/${level}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            &larr; Back to {level.toUpperCase()} Hub
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {level.toUpperCase()} Kanji
          </h1>
          <p className="text-sm text-zinc-500">{kanji.length} characters</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/learn/${level}/kanji/quiz`} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Quiz</Link>
          <Link href={`/learn/${level}/study`} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Flashcards</Link>
        </div>
      </div>

      {pageFilter?.type === 'kanji' && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            Filtered by your buddy: <strong>{pageFilter.label}</strong> ({filtered.length} results)
          </span>
          <button
            onClick={clearPageFilter}
            className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800"
          >
            Clear filter
          </button>
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search kanji, meaning, or reading..."
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {filtered.map((k) => (
          <Link
            key={k.character}
            href={`/learn/${level}/kanji/${encodeURIComponent(k.character)}`}
            className="flex flex-col items-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
          >
            <span className="text-3xl">{k.character}</span>
            <span className="text-xs text-zinc-500 mt-1 truncate w-full text-center">{k.meanings[0]}</span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-zinc-400 py-8">No kanji found.</p>}
    </div>
  );
}
