'use client';

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { n5Reading } from '@/data/reading/n5-reading';
import FuriganaText from '@/components/reading/FuriganaText';
import ReadingQuiz from '@/components/reading/ReadingQuiz';
import ReadingResult from '@/components/reading/ReadingResult';
import { calculateCPM, getCharCount } from '@/lib/reading';

type Phase = 'reading' | 'quiz' | 'result';

export default function ReadingPassagePage() {
  const { level, id } = useParams<{ level: string; id: string }>();
  const passage = (level === 'n5' ? n5Reading : []).find((p) => p.id === id);

  const [showFurigana, setShowFurigana] = useState(true);
  const [phase, setPhase] = useState<Phase>('reading');
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    const totalMs = Date.now() - startTimeRef.current;
    const totalSeconds = Math.floor(totalMs / 1000);
    setElapsed(totalSeconds);
    if (passage) {
      const chars = getCharCount(passage.segments);
      setCpm(calculateCPM(chars, totalMs));
    }
  }, [passage]);

  const handleDoneReading = () => {
    stopTimer();
    if (passage && passage.questions.length > 0) {
      setPhase('quiz');
    } else {
      setPhase('result');
    }
  };

  const handleQuizComplete = (score: number, _total: number) => {
    setQuizScore(score);
    setPhase('result');
  };

  const handleRetry = () => {
    setPhase('reading');
    setTimerActive(false);
    setElapsed(0);
    setCpm(0);
    setQuizScore(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!passage) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500">Passage not found.</p>
        <Link href={`/learn/${level}/reading`} className="mt-4 inline-block text-emerald-600 hover:underline">
          Back to Reading
        </Link>
      </div>
    );
  }

  const charCount = getCharCount(passage.segments);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  if (phase === 'result') {
    return (
      <div className="py-8">
        <ReadingResult
          score={quizScore}
          totalQuestions={passage.questions.length}
          cpm={cpm}
          charCount={charCount}
          timeSeconds={elapsed}
          level={level}
          passageTitle={passage.title}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <div className="max-w-lg mx-auto py-8">
        <ReadingQuiz questions={passage.questions} onComplete={handleQuizComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/learn/${level}/reading`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back
        </Link>
        <div className="flex items-center gap-3">
          {/* Timer */}
          {timerActive && (
            <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          )}
          {/* Furigana toggle */}
          <button
            onClick={() => setShowFurigana((s) => !s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFurigana
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            {showFurigana ? 'ふりがな ON' : 'ふりがな OFF'}
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          <ruby>
            {passage.title}
            <rt className="text-sm text-zinc-400">{passage.titleReading}</rt>
          </ruby>
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
          <span>{charCount} characters</span>
          <span>~{passage.estimatedMinutes} min</span>
        </div>
      </div>

      {/* Reading area */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <FuriganaText segments={passage.segments} showFurigana={showFurigana} />
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        {!timerActive ? (
          <button
            onClick={startTimer}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Start Reading Timer
          </button>
        ) : (
          <button
            onClick={handleDoneReading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Done Reading →
          </button>
        )}
      </div>
    </div>
  );
}
