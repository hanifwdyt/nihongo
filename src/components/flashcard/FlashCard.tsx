'use client';

import { useState } from 'react';

interface Props {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({ front, back, flipped, onFlip }: Props) {
  return (
    <div
      className="w-full max-w-sm mx-auto cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full min-h-[280px] transition-transform duration-500 transform-style-3d ${
          flipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
          <p className="mt-4 text-xs text-zinc-400">Tap to reveal</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
