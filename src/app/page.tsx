import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 py-16">
      {/* Hero */}
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          <span className="text-emerald-600">日本語</span> Nihongo
        </h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          Master Japanese from Kana to JLPT N1. Practice with quizzes, flashcards, AI companion, and reading exercises.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link
          href="/kana"
          className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
        >
          <span className="text-4xl">あ</span>
          <div className="text-center">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Kana</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Hiragana &amp; Katakana
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-medium">Free — No signup needed</span>
        </Link>

        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <span className="text-4xl">漢</span>
          <div className="text-center">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Kanji &amp; Vocab</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              N5 — N1 Content
            </div>
          </div>
          <span className="text-xs text-zinc-400">Sign up to access</span>
        </div>

        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <span className="text-4xl">友</span>
          <div className="text-center">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">AI Buddy</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Personal study companion
            </div>
          </div>
          <span className="text-xs text-zinc-400">Sign up to access</span>
        </div>
      </div>

      {/* JLPT levels */}
      <div className="flex flex-wrap justify-center gap-2">
        {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
          <span
            key={level}
            className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            JLPT {level}
          </span>
        ))}
      </div>
    </div>
  );
}
