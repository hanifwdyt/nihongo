import Link from 'next/link';
import { LEVEL_NAMES, hiraganaAdditions, katakanaAdditions } from '@/data/kana';

function KanaSection({ type, label, char, additions }: {
  type: string;
  label: string;
  char: string;
  additions: { kana: string; romaji: string }[][];
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{char}</span>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{label}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEVEL_NAMES.map((name, i) => (
          <Link
            key={i}
            href={`/kana/${type}/${i + 1}`}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
          >
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                Level {i + 1}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{name}</div>
            </div>
            <div className="text-sm text-zinc-400">{additions[i].length} chars</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function KanaPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Kana Practice</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Master Hiragana and Katakana with timed quizzes. Each level builds on the previous one.
        </p>
      </div>

      <KanaSection type="hiragana" label="Hiragana" char="あ" additions={hiraganaAdditions} />
      <KanaSection type="katakana" label="Katakana" char="ア" additions={katakanaAdditions} />
    </div>
  );
}
