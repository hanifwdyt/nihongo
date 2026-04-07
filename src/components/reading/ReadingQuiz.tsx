'use client';

import { useState } from 'react';
import type { ReadingQuestion } from '@/data/reading/n5-reading';

interface Props {
  questions: ReadingQuestion[];
  onComplete: (score: number, total: number) => void;
}

export default function ReadingQuiz({ questions, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[current];

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowExplanation(true);
    if (index === q.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (current + 1 >= questions.length) {
      const finalScore = score + (selected === q.correctIndex ? 0 : 0); // already counted
      onComplete(score, questions.length);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>Comprehension Check</span>
        <span>
          {current + 1} / {questions.length}
        </span>
      </div>

      <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4 leading-relaxed">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let style = 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-500';
            if (selected !== null) {
              if (i === q.correctIndex) {
                style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
              } else if (i === selected) {
                style = 'border-red-500 bg-red-50 dark:bg-red-950/30';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
            {q.explanation}
          </div>
        )}

        {selected !== null && (
          <button
            onClick={handleNext}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
