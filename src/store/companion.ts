'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CompanionMood = 'idle' | 'thinking' | 'celebrating' | 'talking' | 'sleeping';

export interface CompanionEvent {
  type: string;
  page: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface PageFilter {
  type: 'kanji' | 'vocab';
  query?: string;
  category?: string;
  customItems?: string[];
  label?: string;
}

interface CompanionState {
  // Character
  creatureId: string | null;
  creatureName: string | null;

  // UI state
  mood: CompanionMood;
  speechBubble: string | null;
  speechBubbleVisible: boolean;
  chatExpanded: boolean;
  minimized: boolean;

  // Page interaction
  currentPage: string;
  pageFilter: PageFilter | null;

  // Actions
  setCreature: (id: string, name: string) => void;
  setMood: (mood: CompanionMood) => void;
  showSpeech: (text: string, duration?: number) => void;
  hideSpeech: () => void;
  toggleChat: () => void;
  setMinimized: (v: boolean) => void;
  setCurrentPage: (page: string) => void;
  setPageFilter: (filter: PageFilter | null) => void;
  clearPageFilter: () => void;
}

let speechTimeout: ReturnType<typeof setTimeout> | null = null;

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set) => ({
      creatureId: null,
      creatureName: null,
      mood: 'idle',
      speechBubble: null,
      speechBubbleVisible: false,
      chatExpanded: false,
      minimized: false,
      currentPage: '/',
      pageFilter: null,

      setCreature: (id, name) => set({ creatureId: id, creatureName: name }),

      setMood: (mood) => set({ mood }),

      showSpeech: (text, duration = 5000) => {
        if (speechTimeout) clearTimeout(speechTimeout);
        set({ speechBubble: text, speechBubbleVisible: true });
        speechTimeout = setTimeout(() => {
          set({ speechBubbleVisible: false });
        }, duration);
      },

      hideSpeech: () => {
        if (speechTimeout) clearTimeout(speechTimeout);
        set({ speechBubbleVisible: false });
      },

      toggleChat: () => set((s) => ({ chatExpanded: !s.chatExpanded, speechBubbleVisible: false })),

      setMinimized: (v) => set({ minimized: v }),

      setCurrentPage: (page) => set({ currentPage: page, pageFilter: null }),

      setPageFilter: (filter) => set({ pageFilter: filter }),

      clearPageFilter: () => set({ pageFilter: null }),
    }),
    {
      name: 'nihongo-companion',
      partialize: (state) => ({
        creatureId: state.creatureId,
        creatureName: state.creatureName,
        minimized: state.minimized,
      }),
    },
  ),
);
