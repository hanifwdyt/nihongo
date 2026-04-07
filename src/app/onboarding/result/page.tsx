'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingResultPage() {
  const router = useRouter();
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setLevel(data.currentLevel || 'n5');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-500 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  const levelDisplay = level.toUpperCase().replace('N', 'N');
  const levelNumber = level.replace('n', '');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <span className="text-5xl mb-4 block">{'\u{1F389}'}</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Your recommended level: JLPT {levelDisplay}!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md mx-auto">
          {level === 'n5'
            ? "Perfect starting point! We'll build your Japanese from the ground up."
            : level === 'n4'
              ? "Great foundation! You know the basics. Let's build on that."
              : "Impressive! You've got solid fundamentals. Let's level up together."}
        </p>
      </div>

      {/* Sensei intro */}
      <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-8 max-w-md w-full">
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">{'\u{1F9D1}\u{200D}\u{1F3EB}'}</span>
          <div className="text-left">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Sensei</p>
            <p className="text-emerald-700 dark:text-emerald-400 text-sm leading-relaxed">
              Hajimemashite! Watashi wa Sensei desu~{' '}
              <span className="font-medium">{'\u{3053}\u{308C}\u{304B}\u{3089}\u{4E00}\u{7DD2}\u{306B}\u{9811}\u{5F35}\u{308D}\u{3046}\u{306D}\u{FF01}'}</span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-1 italic">
              (Nice to meet you! I&apos;m Sensei~ Let&apos;s do our best together from now on!)
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors"
      >
        Start Learning
      </button>
    </div>
  );
}
