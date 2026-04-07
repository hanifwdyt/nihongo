'use client';

import { useState, useEffect, useCallback } from 'react';
import { type QuizResult, generateMultipleChoice, getFeedback } from '@/lib/quiz';
import type { KanaEntry } from '@/data/kana';
import QuizResultView from './QuizResult';

interface Props {
  pool: KanaEntry[];
  timerSeconds: number;
  onRetry: () => void;
  title: string;
  questionCount?: number;
}

export default function MultipleChoice({ pool, timerSeconds, onRetry, title, questionCount = 30 }: Props) {
  const [quiz, setQuiz] = useState(() => generateMultipleChoice(pool, questionCount));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const endQuiz = useCallback(() => setFinished(true), []);

  useEffect(() => {
    if (finished || timeLeft <= 0) {
      if (timeLeft <= 0) endQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished, endQuiz]);

  const handleSelect = (option: string) => {
    if (selected || finished) return;

    const q = quiz[current];
    const correct = option === q.question.romaji;

    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, { question: q.question, userAnswer: option, correct }]);
    setSelected(option);

    setTimeout(() => {
      setSelected(null);
      if (current + 1 >= quiz.length) {
        endQuiz();
      } else {
        setCurrent((c) => c + 1);
      }
    }, 500);
  };

  if (finished) {
    return (
      <QuizResultView
        score={score}
        total={results.length}
        results={results}
        onRetry={onRetry}
      />
    );
  }

  const q = quiz[current];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((current + 1) / quiz.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between w-full text-sm text-zinc-500 dark:text-zinc-400">
        <span>{title}</span>
        <span className={timeLeft <= 30 ? 'text-red-500 font-bold animate-pulse' : ''}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {current + 1} / {quiz.length}
      </div>

      <div className="text-8xl py-8 select-none text-zinc-900 dark:text-zinc-100">
        {q.question.kana}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {q.options.map((option) => {
          let style = 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500';
          if (selected) {
            if (option === q.question.romaji) {
              style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
            } else if (option === selected) {
              style = 'border-red-500 bg-red-50 dark:bg-red-950';
            }
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
              className={`px-4 py-3 rounded-xl border text-center font-medium transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
