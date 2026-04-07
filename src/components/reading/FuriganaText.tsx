'use client';

import type { FuriganaSegment } from '@/data/reading/n5-reading';

interface Props {
  segments: FuriganaSegment[];
  showFurigana: boolean;
  className?: string;
}

export default function FuriganaText({ segments, showFurigana, className }: Props) {
  return (
    <p className={`leading-[2.5] text-xl ${className ?? ''}`}>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i} className="group">
            {seg.text}
            <rp>(</rp>
            <rt
              className={`text-[0.55em] font-normal transition-opacity duration-200 ${
                showFurigana
                  ? 'text-zinc-500 dark:text-zinc-500 opacity-100'
                  : 'opacity-0'
              }`}
            >
              {seg.reading}
            </rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}
