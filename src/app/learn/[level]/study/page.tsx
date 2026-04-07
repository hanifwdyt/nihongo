'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { n5Kanji } from '@/data/n5-kanji';
import { n5Vocab } from '@/data/n5-vocab';
import { getDueCards } from '@/lib/srs';
import StudySession from '@/components/flashcard/StudySession';

export default function LevelStudyPage() {
  const { level } = useParams<{ level: string }>();

  const items = useMemo(() => {
    if (level !== 'n5') return [];

    const kanjiIds = n5Kanji.map((k) => k.character);
    const vocabIds = n5Vocab.map((v) => v.id);
    const dueKanji = getDueCards('kanji', kanjiIds);
    const dueVocab = getDueCards('vocab', vocabIds);

    const kanjiItems = dueKanji.map((id) => {
      const k = n5Kanji.find((x) => x.character === id);
      if (!k) return null;
      return {
        id: `kanji-${k.character}`,
        contentType: 'kanji' as const,
        contentId: k.character,
        front: (
          <div className="text-center">
            <div className="text-7xl mb-2">{k.character}</div>
            <div className="text-sm text-zinc-400">What does this kanji mean?</div>
          </div>
        ),
        back: (
          <div className="text-center space-y-2">
            <div className="text-4xl">{k.character}</div>
            <div className="text-lg font-semibold">{k.meanings.join(', ')}</div>
            <div className="text-sm text-zinc-500">
              {k.onyomi.length > 0 && <div>On: {k.onyomi.join(', ')}</div>}
              {k.kunyomi.length > 0 && <div>Kun: {k.kunyomi.join(', ')}</div>}
            </div>
          </div>
        ),
      };
    }).filter(Boolean);

    const vocabItems = dueVocab.slice(0, 5).map((id) => {
      const v = n5Vocab.find((x) => x.id === id);
      if (!v) return null;
      return {
        id: `vocab-${v.id}`,
        contentType: 'vocab' as const,
        contentId: v.id,
        front: (
          <div className="text-center">
            <div className="text-5xl mb-2">{v.word}</div>
            {v.word !== v.reading && <div className="text-lg text-zinc-400">{v.reading}</div>}
            <div className="text-sm text-zinc-400 mt-2">What does this mean?</div>
          </div>
        ),
        back: (
          <div className="text-center space-y-2">
            <div className="text-3xl">{v.word}</div>
            <div className="text-lg font-semibold">{v.meanings.join(', ')}</div>
          </div>
        ),
      };
    }).filter(Boolean);

    return [...kanjiItems, ...vocabItems] as { id: string; front: React.ReactNode; back: React.ReactNode }[];
  }, [level]);

  return (
    <div className="py-8">
      <Link href={`/learn/${level}`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 inline-block">
        &larr; Back to {level.toUpperCase()}
      </Link>
      <StudySession
        contentType="kanji"
        items={items}
        title={`${level.toUpperCase()} Review`}
        backHref={`/learn/${level}`}
      />
    </div>
  );
}
