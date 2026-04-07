import ChatInterface from '@/components/buddy/ChatInterface';
import Link from 'next/link';

export const metadata = {
  title: 'Chat with Sensei — Nihongo',
};

export default function BuddyPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
        &larr; Back to Dashboard
      </Link>
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Chat with <span className="text-emerald-600">Sensei</span> 先生
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Your AI study companion — ask questions, practice Japanese, get personalized tips.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
