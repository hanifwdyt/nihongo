'use client';

import { useState, useCallback } from 'react';
import { n5Kanji, type KanjiEntry } from '@/data/n5-kanji';
import { shuffle } from '@/lib/quiz';
import CompanionFeedback from '@/components/companion/CompanionFeedback';
import Link from 'next/link';

interface QuizItem {
  kanji: KanjiEntry;
  options: string[];
  correct: string;
}

function generateKanjiQuiz(count = 20): QuizItem[] {
  const selected = shuffle(n5Kanji).slice(0, count);
  const allMeanings = [...new Set(n5Kanji.flatMap((k) => k.meanings))];

  return selected.map((kanji) => {
    const correct = kanji.meanings[0];
    const wrong = shuffle(allMeanings.filter((m) => !kanji.meanings.includes(m))).slice(0, 3);
    return {
      kanji,
      options: shuffle([correct, ...wrong]),
      correct,
    };
  });
}

export default function KanjiQuiz() {
  const [quiz, setQuiz] = useState(() => generateKanjiQuiz());
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [missed, setMissed] = useState<{ kanji: string; correct: string; picked: string }[]>([]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const q = quiz[current];
    const isCorrect = q.kanji.meanings.includes(option);
    if (isCorrect) setScore((s) => s + 1);
    else setMissed((m) => [...m, { kanji: q.kanji.character, correct: q.correct, picked: option }]);

    setTimeout(() => {
      setSelected(null);
      if (current + 1 >= quiz.length) {
        setFinished(true);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 500);
  };

  const retry = useCallback(() => {
    setQuiz(generateKanjiQuiz());
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setMissed([]);
  }, []);

  if (finished) {
    const pct = score / quiz.length;
    const emoji = pct >= 0.8 ? '🟢' : pct >= 0.6 ? '🟡' : '🔴';
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-6xl">{emoji}</div>
        <div className="text-center">
          <div className="text-4xl font-bold">{score} / {quiz.length}</div>
          <p className="mt-2 text-zinc-500">
            {pct >= 0.8 ? 'Great job!' : pct >= 0.6 ? 'Good progress!' : 'Keep practicing!'}
          </p>
        </div>
        <CompanionFeedback
          score={score}
          total={quiz.length}
          quizType="Kanji"
          missedSummary={missed.slice(0, 5).map((m) => `${m.kanji}→${m.correct}`).join(', ')}
        />
        {missed.length > 0 && (
          <div className="w-full max-w-sm">
            <h3 className="text-sm font-medium text-zinc-500 mb-3">Missed ({missed.length})</h3>
            <div className="space-y-2">
              {missed.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-2xl">{m.kanji}</span>
                  <div className="text-right text-sm">
                    <div className="text-emerald-600">{m.correct}</div>
                    <div className="text-red-400 line-through">{m.picked}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={retry} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">Retry</button>
          <Link href="/learn/n5/kanji" className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Back to Kanji</Link>
        </div>
      </div>
    );
  }

  const q = quiz[current];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm text-sm text-zinc-500">
        <span>Kanji Quiz</span>
        <span>{current + 1} / {quiz.length}</span>
      </div>
      <div className="w-full max-w-sm bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
        <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / quiz.length) * 100}%` }} />
      </div>
      <div className="text-8xl py-8">{q.kanji.character}</div>
      <div className="text-sm text-zinc-400">Choose the meaning</div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {q.options.map((opt) => {
          let style = 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500';
          if (selected) {
            if (q.kanji.meanings.includes(opt)) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
            else if (opt === selected) style = 'border-red-500 bg-red-50 dark:bg-red-950';
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={!!selected}
              className={`px-4 py-3 rounded-xl border text-center text-sm font-medium transition-colors ${style}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
