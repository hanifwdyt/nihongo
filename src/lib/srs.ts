'use client';

import { createEmptyCard, fsrs, generatorParameters, type Card, type Grade, Rating } from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: true });
const scheduler = fsrs(params);

export { Rating };
export type { Card, Grade };

const STORAGE_KEY = 'nihongo-srs';

export interface SrsCard {
  contentType: 'kanji' | 'vocab';
  contentId: string;
  card: Card;
}

function loadCards(): SrsCard[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((c: SrsCard) => ({
      ...c,
      card: {
        ...c.card,
        due: new Date(c.card.due),
        last_review: c.card.last_review ? new Date(c.card.last_review) : undefined,
      },
    }));
  } catch {
    return [];
  }
}

function saveCards(cards: SrsCard[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getOrCreateCard(contentType: 'kanji' | 'vocab', contentId: string): SrsCard {
  const cards = loadCards();
  const existing = cards.find(
    (c) => c.contentType === contentType && c.contentId === contentId,
  );
  if (existing) return existing;

  const newCard: SrsCard = {
    contentType,
    contentId,
    card: createEmptyCard(),
  };
  cards.push(newCard);
  saveCards(cards);
  return newCard;
}

export function reviewCard(
  contentType: 'kanji' | 'vocab',
  contentId: string,
  grade: Grade,
): SrsCard {
  const cards = loadCards();
  const idx = cards.findIndex(
    (c) => c.contentType === contentType && c.contentId === contentId,
  );

  let srsCard: SrsCard;
  if (idx === -1) {
    srsCard = { contentType, contentId, card: createEmptyCard() };
    const result = scheduler.repeat(srsCard.card, new Date());
    srsCard.card = result[grade].card;
    cards.push(srsCard);
  } else {
    srsCard = cards[idx];
    const result = scheduler.repeat(srsCard.card, new Date());
    srsCard.card = result[grade].card;
    cards[idx] = srsCard;
  }

  saveCards(cards);
  return srsCard;
}

export function getDueCards(contentType: 'kanji' | 'vocab', allIds: string[]): string[] {
  const cards = loadCards();
  const now = new Date();

  const studied = new Set(
    cards.filter((c) => c.contentType === contentType).map((c) => c.contentId),
  );

  const due: { id: string; date: Date }[] = [];

  for (const c of cards) {
    if (c.contentType !== contentType) continue;
    if (new Date(c.card.due) <= now) {
      due.push({ id: c.contentId, date: new Date(c.card.due) });
    }
  }

  // Add new cards (not yet studied) — introduce 5 at a time
  const newCards = allIds.filter((id) => !studied.has(id));
  const batchSize = Math.max(0, 5 - due.length);
  for (let i = 0; i < Math.min(batchSize, newCards.length); i++) {
    due.push({ id: newCards[i], date: new Date(0) });
  }

  due.sort((a, b) => a.date.getTime() - b.date.getTime());
  return due.map((d) => d.id);
}

export function getStudyStats(contentType: 'kanji' | 'vocab'): {
  total: number;
  learned: number;
  due: number;
} {
  const cards = loadCards();
  const now = new Date();
  const typeCards = cards.filter((c) => c.contentType === contentType);
  const dueCount = typeCards.filter((c) => new Date(c.card.due) <= now).length;

  return {
    total: typeCards.length,
    learned: typeCards.length,
    due: dueCount,
  };
}

export function resetProgress(contentType?: 'kanji' | 'vocab') {
  if (!contentType) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const cards = loadCards().filter((c) => c.contentType !== contentType);
  saveCards(cards);
}
