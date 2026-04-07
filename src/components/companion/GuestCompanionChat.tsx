'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Creature } from '@/data/creatures';

interface QuickAction {
  label: string;
  response: string;
  followUp?: QuickAction[];
  cta?: { label: string; href: string };
}

const CONVERSATION_TREE: QuickAction[] = [
  {
    label: 'What is Nihongo?',
    response:
      'Nihongo is a Japanese learning app! You can practice Hiragana, Katakana, Kanji, Vocabulary, and even reading — all with me as your study buddy. I track your progress, remember your strengths and weaknesses, and give you personalized tips!',
    followUp: [
      {
        label: 'What can I learn?',
        response:
          'Right now we have:\n\n• **Kana** — Hiragana & Katakana with timed quizzes\n• **107 N5 Kanji** — browse, quiz, and flashcards\n• **200 N5 Vocabulary** — with example sentences\n• **10 Reading passages** — with furigana and comprehension quizzes\n• **Me!** — I can chat with you, quiz you, and help you study\n\nMore content (N4-N1) is coming soon!',
        cta: { label: 'Try free Kana quiz', href: '/kana' },
      },
      {
        label: 'Is it free?',
        response:
          'Yes! The core features are completely free. Kana quizzes work without even signing up. Create a free account to unlock Kanji, Vocab, Reading, and chat with me as your AI tutor!',
        cta: { label: 'Sign up free', href: '/register' },
      },
    ],
  },
  {
    label: 'I want to start learning!',
    response:
      'Awesome! If you\'re a complete beginner, start with the **Kana quiz** — no signup needed! Once you\'re comfortable with Hiragana and Katakana, sign up and I\'ll help you with Kanji, Vocabulary, and more.',
    cta: { label: 'Start Kana quiz', href: '/kana' },
    followUp: [
      {
        label: 'What are Kana?',
        response:
          'Japanese has 3 writing systems:\n\n• **Hiragana** (あいうえお) — for native Japanese words\n• **Katakana** (アイウエオ) — for foreign/loan words\n• **Kanji** (漢字) — Chinese characters with meaning\n\nYou learn Hiragana and Katakana first — they\'re the foundation!',
        cta: { label: 'Try Hiragana quiz', href: '/kana/hiragana/1' },
      },
      {
        label: 'I already know Kana',
        response:
          'Great! Then you\'re ready for Kanji and Vocabulary. Sign up for a free account and I\'ll give you a placement test to find your level. Then we can start learning together!',
        cta: { label: 'Sign up to continue', href: '/register' },
      },
    ],
  },
  {
    label: 'Who are you?',
    response:
      'I\'m your study buddy! When you sign up, I become your personal AI tutor. I can:\n\n• Chat about Japanese language and culture\n• Quiz you on Kanji and Vocabulary\n• Remember what you\'re good at and what needs practice\n• Give you study tips based on your progress\n• Customize your learning content\n\nI\'m powered by AI, so I can help with pretty much anything Japanese-related!',
    followUp: [
      {
        label: 'That sounds cool!',
        response: 'Sign up and let\'s get started! I\'ll be here whenever you need me.',
        cta: { label: 'Create free account', href: '/register' },
      },
      {
        label: 'How does the AI work?',
        response:
          'I use a language model to understand your questions and give helpful answers. I also have access to your learning data — quiz scores, flashcard progress, mistakes you\'ve made — so I can give personalized advice. Everything I learn about you is saved so I remember our conversations!',
      },
    ],
  },
];

export default function GuestCompanionChat({ creature }: { creature: Creature }) {
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string; cta?: { label: string; href: string } }[]>([
    {
      role: 'assistant',
      content: `Hey there! I'm ${creature.name}, your Japanese learning buddy. I'd love to help you get started! What would you like to know?`,
    },
  ]);
  const [actions, setActions] = useState<QuickAction[]>(CONVERSATION_TREE);

  const handleAction = (action: QuickAction) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: action.label },
      { role: 'assistant', content: action.response, cta: action.cta },
    ]);
    setActions(action.followUp ?? [
      {
        label: 'Tell me more about Nihongo',
        response: 'Nihongo helps you go from zero to JLPT N1. Start with a free Kana quiz, or sign up for the full experience with AI tutoring, flashcards, and personalized learning!',
        cta: { label: 'Sign up free', href: '/register' },
        followUp: CONVERSATION_TREE,
      },
      {
        label: 'I want to sign up',
        response: 'Let\'s go! Click below to create your free account. I\'ll be waiting on the other side to start your journey!',
        cta: { label: 'Create free account', href: '/register' },
      },
    ]);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                }`}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </div>
            {msg.cta && (
              <div className="mt-2 ml-0">
                <Link
                  href={msg.cta.href}
                  className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  {msg.cta.label} →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick action buttons instead of text input */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 space-y-2">
        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleAction(action)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="text-center">
          <Link
            href="/register"
            className="text-xs text-emerald-600 hover:underline font-medium"
          >
            Sign up to unlock full AI chat →
          </Link>
        </div>
      </div>
    </>
  );
}
