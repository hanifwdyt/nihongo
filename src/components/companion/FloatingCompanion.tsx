'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCompanionStore } from '@/store/companion';
import { getCreatureById, getRandomCreature } from '@/data/creatures';
import { CreatureSVG } from './creatures';
import CompanionChat from './CompanionChat';
import GuestCompanionChat from './GuestCompanionChat';

interface Props {
  isGuest: boolean;
}

export default function FloatingCompanion({ isGuest }: Props) {
  const {
    creatureId,
    setCreature,
    mood,
    speechBubble,
    speechBubbleVisible,
    chatExpanded,
    toggleChat,
    minimized,
    setMinimized,
    showSpeech,
  } = useCompanionStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!creatureId) {
      const creature = getRandomCreature();
      setCreature(creature.id, creature.name);
    }
  }, []);

  // Guest greeting
  useEffect(() => {
    if (!mounted || !creatureId) return;
    const creature = getCreatureById(creatureId);
    if (!creature) return;

    const timer = setTimeout(() => {
      if (isGuest) {
        showSpeech(`Hey! I'm ${creature.name}. Want to learn Japanese together? Try the free Kana quiz, or sign up to unlock everything!`, 7000);
      } else {
        showSpeech(`Welcome back! Ready to study? Click me anytime you need help!`, 5000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [mounted, isGuest, creatureId]);

  const creature = creatureId ? getCreatureById(creatureId) : null;

  if (!mounted || !creature) return null;

  if (minimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.15 }}
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border backdrop-blur-sm"
        style={{
          backgroundColor: creature.color + '15',
          borderColor: creature.color + '40',
        }}
      >
        <CreatureSVG type={creature.id} state="idle" color={creature.color} size={36} />
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {/* Chat panel */}
      <AnimatePresence>
        {chatExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] sm:h-[520px] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col pointer-events-auto"
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
              style={{ backgroundColor: creature.color + '08' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8">
                  <CreatureSVG type={creature.id} state={mood} color={creature.color} size={32} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {creature.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {isGuest ? 'Say hi!' : 'Online'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1L13 13M1 13L13 1" />
                </svg>
              </button>
            </div>
            {isGuest ? (
              <GuestCompanionChat creature={creature} />
            ) : (
              <CompanionChat creature={creature} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {speechBubbleVisible && speechBubble && !chatExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto max-w-[280px] relative"
          >
            <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-white dark:bg-zinc-800 shadow-xl border border-zinc-100 dark:border-zinc-700 text-[13px] text-zinc-700 dark:text-zinc-200 leading-relaxed">
              {speechBubble}
            </div>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-white dark:bg-zinc-800 border-r border-b border-zinc-100 dark:border-zinc-700" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <div className="flex items-end gap-1.5 pointer-events-auto">
        <button
          onClick={() => setMinimized(true)}
          className="mb-1 w-5 h-5 flex items-center justify-center rounded text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          title="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 5L5 9L9 5" />
          </svg>
        </button>
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2 cursor-pointer select-none transition-shadow hover:shadow-2xl"
          style={{
            backgroundColor: creature.color + '12',
            borderColor: creature.color + '35',
          }}
        >
          <motion.div
            animate={
              mood === 'celebrating'
                ? { rotate: [0, -5, 5, -5, 0] }
                : mood === 'thinking'
                  ? { y: [0, -2, 0] }
                  : { y: [0, -3, 0] }
            }
            transition={{
              duration: mood === 'celebrating' ? 0.4 : 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <CreatureSVG type={creature.id} state={mood} color={creature.color} size={44} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
