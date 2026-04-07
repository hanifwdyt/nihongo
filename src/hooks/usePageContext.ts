'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCompanionStore } from '@/store/companion';
import { getCreatureById } from '@/data/creatures';

const PAGE_REACTIONS: Record<string, string[]> = {
  '/dashboard': [
    'Okaeri! Ready to study today? 📚',
    'Welcome back! Let\'s keep that streak going! 🔥',
    'Your learning journey continues! Ganbare! 💪',
  ],
  '/learn/n5': [
    'N5 is the starting point of your journey! ✨',
    'Let\'s master the basics together! がんばって!',
  ],
  '/learn/n5/kanji': [
    'Kanji time! Each character tells a story 📖',
    'Ready to learn some kanji? I\'ll help you! ✏️',
    'Looking at your progress... want me to suggest what to study?',
  ],
  '/learn/n5/vocab': [
    'Vocabulary is the building blocks! 🧱',
    'Let\'s expand your word power! 言葉の力! 💪',
  ],
  '/learn/n5/kanji/quiz': [
    'Quiz time! Show me what you\'ve learned! 🎯',
    'Let\'s test your kanji knowledge! 頑張れ!',
    'Don\'t worry about mistakes — they help you learn! 🌱',
  ],
  '/learn/n5/vocab/quiz': [
    'Vocab quiz! You got this! 💪',
    'Time to put your vocabulary to the test! ✨',
  ],
  '/buddy': [
    'Hey! What\'s on your mind? Let\'s chat! 💬',
    'I\'m all ears! Ask me anything about Japanese! 🎌',
  ],
  '/pricing': [
    'Pro gives you full access to everything! Worth it! 💎',
  ],
  '/kana': [
    'Kana is the foundation! Master these first! あいうえお ✨',
  ],
};

export function usePageContext() {
  const pathname = usePathname();
  const { setCurrentPage, showSpeech, creatureId, mood } = useCompanionStore();

  useEffect(() => {
    setCurrentPage(pathname);

    if (!creatureId) return;

    // Find matching reaction
    const exactMatch = PAGE_REACTIONS[pathname];
    const prefixMatch = Object.entries(PAGE_REACTIONS).find(
      ([key]) => key !== '/' && pathname.startsWith(key) && !exactMatch,
    );

    const reactions = exactMatch ?? prefixMatch?.[1];
    if (reactions && reactions.length > 0) {
      const delay = 800 + Math.random() * 1200;
      const timer = setTimeout(() => {
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        showSpeech(reaction, 4000);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [pathname, creatureId]);
}

export function useCompanionReaction() {
  const { showSpeech, setMood } = useCompanionStore();

  return {
    onQuizStart: () => {
      showSpeech('Ganbare! You can do this! 💪', 3000);
    },
    onQuizComplete: (score: number, total: number) => {
      const pct = score / total;
      setMood('celebrating');
      if (pct >= 0.9) {
        showSpeech(`SUGOI!! ${score}/${total}! Almost perfect! ✨🎉`, 5000);
      } else if (pct >= 0.7) {
        showSpeech(`Nice! ${score}/${total}! Keep improving! 👏`, 5000);
      } else if (pct >= 0.5) {
        showSpeech(`${score}/${total} — not bad! Review the ones you missed! 📖`, 5000);
      } else {
        showSpeech(`${score}/${total} — don't worry! Practice makes perfect! 🌱`, 5000);
      }
      setTimeout(() => setMood('idle'), 5000);
    },
    onCardReview: () => {
      showSpeech('Great job reviewing! Consistency is key! 🔑', 3000);
    },
    onStreakMilestone: (days: number) => {
      setMood('celebrating');
      showSpeech(`${days} day streak! You're on fire! 🔥🔥🔥`, 5000);
      setTimeout(() => setMood('idle'), 5000);
    },
  };
}
