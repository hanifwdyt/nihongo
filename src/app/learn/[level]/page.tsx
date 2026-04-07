import Link from 'next/link';

const LEVEL_INFO: Record<string, { label: string; kanji: number; vocab: number }> = {
  n5: { label: 'N5 — Beginner', kanji: 107, vocab: 200 },
  n4: { label: 'N4 — Elementary', kanji: 300, vocab: 1500 },
  n3: { label: 'N3 — Intermediate', kanji: 650, vocab: 3750 },
  n2: { label: 'N2 — Advanced', kanji: 1000, vocab: 6000 },
  n1: { label: 'N1 — Proficient', kanji: 2000, vocab: 10000 },
};

export default async function LevelHubPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = LEVEL_INFO[level];

  if (!info) {
    return <div className="py-20 text-center text-zinc-500">Level not found.</div>;
  }

  const available = level === 'n5';

  const sections = [
    {
      title: 'Kanji',
      char: '漢',
      count: info.kanji,
      href: `/learn/${level}/kanji`,
      quizHref: `/learn/${level}/kanji/quiz`,
    },
    {
      title: 'Vocabulary',
      char: '語',
      count: info.vocab,
      href: `/learn/${level}/vocab`,
      quizHref: `/learn/${level}/vocab/quiz`,
    },
    {
      title: 'Reading',
      char: '読',
      count: 10,
      href: `/learn/${level}/reading`,
      quizHref: `/learn/${level}/reading`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          &larr; Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-4">
          JLPT {info.label}
        </h1>
      </div>

      {!available ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-zinc-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Level Locked</h2>
          <p className="mt-2 text-zinc-500 max-w-sm mx-auto">
            Complete 80% of the previous level&apos;s kanji and vocabulary to unlock {level.toUpperCase()}.
            Keep studying and you&apos;ll get here!
          </p>
          <Link
            href="/learn/n5"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Continue with N5
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{s.char}</span>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{s.title}</h2>
                  <p className="text-sm text-zinc-500">{s.count} items</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={s.href}
                  className="flex-1 py-2 text-center rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Browse
                </Link>
                <Link
                  href={s.quizHref}
                  className="flex-1 py-2 text-center rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href={`/learn/${level}/study`}
                  className="flex-1 py-2 text-center rounded-xl border border-emerald-500 text-emerald-600 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                >
                  Flashcards
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
