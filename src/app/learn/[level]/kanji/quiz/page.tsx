import KanjiQuiz from '@/components/quiz/KanjiQuiz';
import Link from 'next/link';

export default async function LevelKanjiQuizPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  return (
    <div className="py-8">
      <Link href={`/learn/${level}/kanji`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to {level.toUpperCase()} Kanji
      </Link>
      <KanjiQuiz />
    </div>
  );
}
