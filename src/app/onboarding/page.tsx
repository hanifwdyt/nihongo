'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
          if (data.onboardingDone) {
            router.push('/dashboard');
            return;
          }
          setName(data.name || data.displayName || '');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  async function handleBeginner() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'n5',
          totalQuestions: 0,
          totalCorrect: 0,
        }),
      });
      if (res.ok) {
        router.push('/onboarding/result');
      }
    } catch {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-zinc-500 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <span className="text-5xl mb-4 block">{'\u{1F38C}'}</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Welcome to Nihongo, {name}!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          Let&apos;s find out your Japanese level!
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={handleBeginner}
          disabled={submitting}
          className="w-full px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Setting up...' : 'Complete beginner'}
        </button>
        <p className="text-xs text-zinc-400 -mt-2">
          I&apos;ve never studied Japanese before
        </p>

        <button
          onClick={() => router.push('/onboarding/test')}
          className="w-full px-6 py-4 rounded-xl border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
        >
          I know some basics
        </button>
        <p className="text-xs text-zinc-400 -mt-2">
          I know hiragana/katakana and some words
        </p>

        <button
          onClick={() => router.push('/onboarding/test')}
          className="w-full px-6 py-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-semibold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Intermediate or above
        </button>
        <p className="text-xs text-zinc-400 -mt-2">
          I can read kanji and hold conversations
        </p>
      </div>
    </div>
  );
}
