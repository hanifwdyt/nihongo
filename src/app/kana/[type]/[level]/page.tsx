'use client';

import { useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getPool, getAdditions, TIMER_SECONDS, LEVEL_NAMES, type KanaType } from '@/data/kana';
import { generateQuiz } from '@/lib/quiz';
import QuizEngine from '@/components/quiz/QuizEngine';
import MultipleChoice from '@/components/quiz/MultipleChoice';
import Link from 'next/link';

type QuizMode = 'select' | 'type' | 'choice';

export default function KanaQuizPage() {
  const params = useParams<{ type: string; level: string }>();
  const [mode, setMode] = useState<QuizMode>('select');
  const [quizKey, setQuizKey] = useState(0);

  const type = params.type as KanaType;
  const level = parseInt(params.level, 10);

  if (!['hiragana', 'katakana'].includes(type) || level < 1 || level > 5) {
    notFound();
  }

  const pool = getPool(type, level);
  const additions = getAdditions(type, level);
  const timer = TIMER_SECONDS[level - 1];
  const title = `${type === 'hiragana' ? 'Hiragana' : 'Katakana'} Level ${level} — ${LEVEL_NAMES[level - 1]}`;

  const handleRetry = useCallback(() => {
    setQuizKey((k) => k + 1);
    setMode('select');
  }, []);

  if (mode === 'select') {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <Link href="/kana" className="self-start text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          &larr; Back to Kana
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {pool.length} characters &middot; {Math.floor(timer / 60)} minutes
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {additions.map((k, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-lg rounded-lg bg-zinc-100 dark:bg-zinc-800"
            >
              {k.kana}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setMode('type')}
            className="w-full px-6 py-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Type Answer (50 questions)
          </button>
          <button
            onClick={() => setMode('choice')}
            className="w-full px-6 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Multiple Choice (30 questions)
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'type') {
    const questions = generateQuiz(pool, 50);
    return (
      <div className="py-8">
        <QuizEngine
          key={quizKey}
          questions={questions}
          timerSeconds={timer}
          onRetry={handleRetry}
          title={title}
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      <MultipleChoice
        key={quizKey}
        pool={pool}
        timerSeconds={timer}
        onRetry={handleRetry}
        title={title}
        questionCount={30}
      />
    </div>
  );
}
