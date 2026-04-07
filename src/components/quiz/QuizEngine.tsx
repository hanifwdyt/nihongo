'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Question, type QuizResult, checkAnswer } from '@/lib/quiz';
import QuizResultView from './QuizResult';

interface Props {
  questions: Question[];
  timerSeconds: number;
  onRetry: () => void;
  title: string;
}

export default function QuizEngine({ questions, timerSeconds, onRetry, title }: Props) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const endQuiz = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    if (finished || timeLeft <= 0) {
      if (timeLeft <= 0) endQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished, endQuiz]);

  useEffect(() => {
    if (!feedback) inputRef.current?.focus();
  }, [current, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback || finished) return;

    const q = questions[current];
    const correct = checkAnswer(input, q.romaji);

    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, { question: q, userAnswer: input, correct }]);
    setFeedback({ correct, answer: q.romaji });

    setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (current + 1 >= questions.length) {
        endQuiz();
      } else {
        setCurrent((c) => c + 1);
      }
    }, 600);
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

  const q = questions[current];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((current + 1) / questions.length) * 100;

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
        {current + 1} / {questions.length}
      </div>

      <div
        className={`text-8xl py-8 select-none transition-colors duration-200 ${
          feedback
            ? feedback.correct
              ? 'text-emerald-500'
              : 'text-red-500'
            : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {q.kana}
      </div>

      {feedback && !feedback.correct && (
        <div className="text-sm text-red-400">
          Correct: <span className="font-bold">{feedback.answer}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-xs">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type romaji..."
          autoComplete="off"
          autoCapitalize="off"
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
        >
          Go
        </button>
      </form>
    </div>
  );
}
