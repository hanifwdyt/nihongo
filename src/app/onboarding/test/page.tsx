'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generatePlacementTest, calculateLevel, type PlacementQuestion } from '@/lib/placement';

export default function PlacementTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionIndex: number; selectedAnswer: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adaptiveEnd, setAdaptiveEnd] = useState<number | null>(null);

  useEffect(() => {
    const test = generatePlacementTest();
    setQuestions(test);
  }, []);

  const totalQuestions = adaptiveEnd ?? questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;

  const submitResults = useCallback(async (
    allAnswers: { questionIndex: number; selectedAnswer: string }[],
    allQuestions: PlacementQuestion[],
  ) => {
    setSubmitting(true);
    const result = calculateLevel(allAnswers, allQuestions);

    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: result.level,
          scores: result.scores,
          totalQuestions: result.totalQuestions,
          totalCorrect: result.totalCorrect,
        }),
      });
      if (res.ok) {
        router.push('/onboarding/result');
      }
    } catch {
      setSubmitting(false);
    }
  }, [router]);

  function handleSelect(option: string) {
    if (showFeedback || submitting) return;
    setSelected(option);
    setShowFeedback(true);

    const newAnswers = [...answers, { questionIndex: currentIndex, selectedAnswer: option }];
    setAnswers(newAnswers);

    // Adaptive logic: after N5 questions (index 0-4), check if we should continue
    setTimeout(() => {
      const nextIndex = currentIndex + 1;

      // After finishing N5 block (5 questions)
      if (nextIndex === 5) {
        const n5Correct = newAnswers.filter((a) => {
          const q = questions[a.questionIndex];
          return q?.level === 'n5' && a.selectedAnswer === q.correctAnswer;
        }).length;
        // If < 80% on N5, stop early
        if (n5Correct < 4) {
          submitResults(newAnswers, questions);
          return;
        }
      }

      // After finishing N4 block (10 questions)
      if (nextIndex === 10) {
        const n4Correct = newAnswers.filter((a) => {
          const q = questions[a.questionIndex];
          return q?.level === 'n4' && a.selectedAnswer === q.correctAnswer;
        }).length;
        // If < 60% on N4, stop
        if (n4Correct < 3) {
          submitResults(newAnswers, questions);
          return;
        }
      }

      // All done
      if (nextIndex >= questions.length) {
        submitResults(newAnswers, questions);
        return;
      }

      // Update adaptive end based on progress
      if (nextIndex === 5) {
        setAdaptiveEnd(10); // Proceeding to N4
      } else if (nextIndex === 10) {
        setAdaptiveEnd(15); // Proceeding to N3
      }

      setCurrentIndex(nextIndex);
      setSelected(null);
      setShowFeedback(false);
    }, 800);
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-500 dark:text-zinc-400">Preparing test...</div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        <p className="text-zinc-600 dark:text-zinc-400">Calculating your level...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const isCorrect = selected === currentQ.correctAnswer;
  const levelLabel = currentQ.level.toUpperCase();

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {levelLabel}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
          {currentQ.type}
        </p>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {currentQ.question}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {currentQ.options.map((option) => {
          let className =
            'w-full px-5 py-4 rounded-xl border-2 text-left font-medium text-lg transition-all ';

          if (showFeedback) {
            if (option === currentQ.correctAnswer) {
              className +=
                'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
            } else if (option === selected && !isCorrect) {
              className +=
                'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300';
            } else {
              className +=
                'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500';
            }
          } else {
            className +=
              'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer';
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={className}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
