import Link from 'next/link';

const features = {
  free: [
    'Hiragana & Katakana quiz (all levels)',
    'N5 Kanji browser (107 characters)',
    'N5 Vocabulary browser (200 words)',
    'N5 Reading passages with furigana',
    'Multiple choice & type answer quizzes',
    'AI study buddy (Sensei)',
  ],
  pro: [
    'Everything in Free',
    'Full N5 vocabulary (800+ words)',
    'N4, N3, N2, N1 content (coming soon)',
    'SRS flashcards with spaced repetition',
    'Progress tracking & daily streaks',
    'Advanced reading passages',
    'Priority AI responses',
  ],
};

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center gap-10 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Simple Pricing
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Start free, upgrade when you&apos;re ready to go deeper.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Free */}
        <div className="flex flex-col p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Free</h2>
          <div className="mt-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Rp 0</span>
            <span className="text-zinc-500 dark:text-zinc-400"> /bulan</span>
          </div>
          <ul className="mt-6 flex flex-col gap-3 flex-1">
            {features.free.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/kana"
            className="mt-6 w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-center font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Pro */}
        <div className="flex flex-col p-6 rounded-2xl border-2 border-emerald-500 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium">
            Recommended
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Pro</h2>
          <div className="mt-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Rp 29.000</span>
            <span className="text-zinc-500 dark:text-zinc-400"> /bulan</span>
          </div>
          <ul className="mt-6 flex flex-col gap-3 flex-1">
            {features.pro.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            disabled
            className="mt-6 w-full py-3 rounded-xl bg-emerald-600 text-white font-medium opacity-60 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
