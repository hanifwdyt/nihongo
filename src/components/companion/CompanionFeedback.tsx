'use client';

import { useEffect, useState } from 'react';
import { useCompanionStore } from '@/store/companion';
import { getCreatureById } from '@/data/creatures';
import { CreatureSVG } from './creatures';

interface Props {
  score: number;
  total: number;
  quizType: string;
  missedSummary?: string;
}

export default function CompanionFeedback({ score, total, quizType, missedSummary }: Props) {
  const { creatureId, setMood } = useCompanionStore();
  const creature = creatureId ? getCreatureById(creatureId) : null;
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pct = score / total;

  useEffect(() => {
    if (pct >= 0.8) setMood('celebrating');
    const timer = setTimeout(() => setMood('idle'), 6000);

    async function fetchComment() {
      setLoading(true);
      try {
        const context = missedSummary
          ? ` They missed: ${missedSummary}.`
          : '';

        const prompt = pct >= 0.8
          ? `[SYSTEM: ${quizType} quiz done] User scored ${score}/${total}! Celebrate! 1-2 sentences, anime style.`
          : pct >= 0.5
            ? `[SYSTEM: ${quizType} quiz done] User scored ${score}/${total}.${context} Encourage + one tip. 2-3 sentences, anime style.`
            : `[SYSTEM: ${quizType} quiz done] User scored ${score}/${total}.${context} Be very encouraging, suggest practice. 2-3 sentences, anime style.`;

        const res = await fetch('/api/buddy/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt }),
        });

        if (res.ok) {
          const data = await res.json();
          setComment(data.response);
        }
      } catch {
        // Fallback
        if (pct >= 0.8) setComment('Sugoi!! Amazing work! ✨');
        else if (pct >= 0.5) setComment('Nice try! Review what you missed and go again! 💪');
        else setComment('Daijoubu~ practice makes perfect! がんばって! 🌱');
      } finally {
        setLoading(false);
      }
    }

    fetchComment();
    return () => clearTimeout(timer);
  }, []);

  if (!creature) return null;

  return (
    <div className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: creature.color + '12' }}
        >
          <CreatureSVG
            type={creature.id}
            state={pct >= 0.8 ? 'celebrating' : 'talking'}
            color={creature.color}
            size={36}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            {creature.name} says:
          </div>
          {loading ? (
            <div className="flex gap-1 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            <p
              className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: (comment ?? '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>'),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
