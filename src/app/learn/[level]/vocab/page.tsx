'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { n5Vocab } from '@/data/n5-vocab';
import { useCompanionStore } from '@/store/companion';

const POS_LABELS: Record<string, string> = {
  noun: 'Noun', 'verb-ichidan': 'Verb (ichidan)', 'verb-godan': 'Verb (godan)',
  'i-adjective': 'i-Adj', 'na-adjective': 'na-Adj', adverb: 'Adverb',
  expression: 'Expression', particle: 'Particle', counter: 'Counter', pronoun: 'Pronoun',
};

export default function LevelVocabPage() {
  const { level } = useParams<{ level: string }>();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('all');
  const { pageFilter, clearPageFilter } = useCompanionStore();
  const vocab = level === 'n5' ? n5Vocab : [];
  const posOptions = ['all', ...new Set(vocab.map((v) => v.partOfSpeech))];

  const filtered = vocab.filter((v) => {
    if (pageFilter?.type === 'vocab' && pageFilter.customItems) {
      if (!pageFilter.customItems.includes(v.id)) return false;
    }
    if (posFilter !== 'all' && v.partOfSpeech !== posFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return v.word.includes(q) || v.reading.includes(q) || v.meanings.some((m) => m.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/learn/${level}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">&larr; Back to {level.toUpperCase()}</Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{level.toUpperCase()} Vocabulary</h1>
          <p className="text-sm text-zinc-500">{vocab.length} words</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/learn/${level}/vocab/quiz`} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Quiz</Link>
          <Link href={`/learn/${level}/study`} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Flashcards</Link>
        </div>
      </div>
      {pageFilter?.type === 'vocab' && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <span className="text-sm text-emerald-700 dark:text-emerald-400">
            Filtered by your buddy: <strong>{pageFilter.label}</strong> ({filtered.length} results)
          </span>
          <button onClick={clearPageFilter} className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800">
            Clear filter
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm">
          {posOptions.map((pos) => (<option key={pos} value={pos}>{pos === 'all' ? 'All types' : POS_LABELS[pos] ?? pos}</option>))}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((v) => (
          <Link key={v.id} href={`/learn/${level}/vocab/${v.id}`} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl font-medium">{v.word}</span>
              {v.word !== v.reading && <span className="text-sm text-zinc-400">{v.reading}</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{v.meanings[0]}</span>
              <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{POS_LABELS[v.partOfSpeech] ?? v.partOfSpeech}</span>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-zinc-400 py-8">No vocabulary found.</p>}
    </div>
  );
}
