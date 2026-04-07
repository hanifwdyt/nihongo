import VocabQuiz from '@/components/quiz/VocabQuiz';
import Link from 'next/link';

export default async function LevelVocabQuizPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  return (
    <div className="py-8">
      <Link href={`/learn/${level}/vocab`} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to {level.toUpperCase()} Vocab
      </Link>
      <VocabQuiz />
    </div>
  );
}
