'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { n5Kanji } from '@/data/n5-kanji';

export default function LevelKanjiDetailPage() {
  const { level, character } = useParams<{ level: string; character: string }>();
  const char = decodeURIComponent(character);
  const kanji = n5Kanji.find((k) => k.character === char);

  if (!kanji) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500">Kanji not found.</p>
        <Link href={`/learn/${level}/kanji`} className="mt-4 inline-block text-emerald-600 hover:underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <Link href={`/learn/${level}/kanji`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to {level.toUpperCase()} Kanji List
      </Link>
      <div className="text-center">
        <div className="text-9xl py-4">{kanji.character}</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{kanji.meanings.join(', ')}</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">On&apos;yomi</div>
          <div className="text-lg font-medium">{kanji.onyomi.length > 0 ? kanji.onyomi.join('、') : '—'}</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Kun&apos;yomi</div>
          <div className="text-lg font-medium">{kanji.kunyomi.length > 0 ? kanji.kunyomi.join('、') : '—'}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span>Strokes: <strong className="text-zinc-900 dark:text-zinc-100">{kanji.strokeCount}</strong></span>
        <span>JLPT: <strong className="text-emerald-600">N{kanji.jlptLevel}</strong></span>
      </div>
      {kanji.examples.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-3">Example Words</h2>
          <div className="space-y-2">
            {kanji.examples.map((ex, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-lg font-medium">{ex.word}</span>
                  <span className="text-sm text-zinc-400 ml-2">({ex.reading})</span>
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{ex.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
