'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { n5Vocab } from '@/data/n5-vocab';

const POS_LABELS: Record<string, string> = {
  noun: 'Noun', 'verb-ichidan': 'Verb (ichidan)', 'verb-godan': 'Verb (godan)',
  'i-adjective': 'i-Adjective', 'na-adjective': 'na-Adjective', adverb: 'Adverb',
  expression: 'Expression', particle: 'Particle', counter: 'Counter', pronoun: 'Pronoun',
};

export default function LevelVocabDetailPage() {
  const { level, id } = useParams<{ level: string; id: string }>();
  const vocab = n5Vocab.find((v) => v.id === id);

  if (!vocab) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500">Word not found.</p>
        <Link href={`/learn/${level}/vocab`} className="mt-4 inline-block text-emerald-600 hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <Link href={`/learn/${level}/vocab`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">&larr; Back to {level.toUpperCase()} Vocab</Link>
      <div className="text-center">
        <div className="text-6xl py-4">{vocab.word}</div>
        {vocab.word !== vocab.reading && <div className="text-xl text-zinc-400 mt-1">{vocab.reading}</div>}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">{vocab.meanings.join(', ')}</h1>
      </div>
      <div className="flex items-center justify-center gap-3">
        <span className="px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{POS_LABELS[vocab.partOfSpeech] ?? vocab.partOfSpeech}</span>
        <span className="px-3 py-1 rounded-full text-sm bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">JLPT N{vocab.jlptLevel}</span>
      </div>
      <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Example</div>
        <div className="text-lg">{vocab.exampleJa}</div>
        <div className="text-sm text-zinc-500 mt-2">{vocab.exampleEn}</div>
      </div>
    </div>
  );
}
