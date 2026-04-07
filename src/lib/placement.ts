import { hiraganaPools, katakanaPools, type KanaEntry } from '@/data/kana';
import { n5Kanji, type KanjiEntry } from '@/data/n5-kanji';
import { n5Vocab, type VocabEntry } from '@/data/n5-vocab';

export interface PlacementQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  level: 'n5' | 'n4' | 'n3';
  type: 'kana' | 'kanji' | 'vocab';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function generateWrongOptions(correct: string, pool: string[], count: number): string[] {
  const filtered = pool.filter((o) => o !== correct);
  return shuffle(filtered).slice(0, count);
}

function makeKanaQuestion(pool: KanaEntry[], level: PlacementQuestion['level']): PlacementQuestion {
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const allRomaji = [...new Set(pool.map((e) => e.romaji))];
  const wrong = generateWrongOptions(entry.romaji, allRomaji, 3);
  return {
    question: `What is the reading of "${entry.kana}"?`,
    options: shuffle([entry.romaji, ...wrong]),
    correctAnswer: entry.romaji,
    level,
    type: 'kana',
  };
}

function makeKanjiQuestion(kanjiPool: KanjiEntry[], level: PlacementQuestion['level']): PlacementQuestion {
  const entry = kanjiPool[Math.floor(Math.random() * kanjiPool.length)];
  const meaning = entry.meanings[0];
  const allMeanings = [...new Set(kanjiPool.map((k) => k.meanings[0]))];
  const wrong = generateWrongOptions(meaning, allMeanings, 3);
  return {
    question: `What does "${entry.character}" mean?`,
    options: shuffle([meaning, ...wrong]),
    correctAnswer: meaning,
    level,
    type: 'kanji',
  };
}

function makeVocabQuestion(vocabPool: VocabEntry[], level: PlacementQuestion['level']): PlacementQuestion {
  const entry = vocabPool[Math.floor(Math.random() * vocabPool.length)];
  const meaning = entry.meanings[0];
  const allMeanings = [...new Set(vocabPool.map((v) => v.meanings[0]))];
  const wrong = generateWrongOptions(meaning, allMeanings, 3);
  return {
    question: `What does "${entry.word}" (${entry.reading}) mean?`,
    options: shuffle([meaning, ...wrong]),
    correctAnswer: meaning,
    level,
    type: 'vocab',
  };
}

function generateN5Questions(count: number): PlacementQuestion[] {
  const questions: PlacementQuestion[] = [];
  // Basic kana (levels 1-2), easy kanji, common vocab
  const easyHiragana = hiraganaPools[1]; // vowels + K + S + T + N + H
  const easyKatakana = katakanaPools[0];
  const easyKanji = n5Kanji.slice(0, 30); // simpler kanji (numbers, basic)
  const easyVocab = n5Vocab.slice(0, 50); // common greetings/basics

  // Mix: 2 kana, 1-2 kanji, 1-2 vocab
  const kanaCount = Math.ceil(count * 0.4);
  const kanjiCount = Math.ceil(count * 0.3);
  const vocabCount = count - kanaCount - kanjiCount;

  for (let i = 0; i < kanaCount; i++) {
    const pool = i % 2 === 0 ? easyHiragana : easyKatakana;
    questions.push(makeKanaQuestion(pool, 'n5'));
  }
  for (let i = 0; i < kanjiCount; i++) {
    questions.push(makeKanjiQuestion(easyKanji, 'n5'));
  }
  for (let i = 0; i < vocabCount; i++) {
    questions.push(makeVocabQuestion(easyVocab, 'n5'));
  }

  return shuffle(questions);
}

function generateN4Questions(count: number): PlacementQuestion[] {
  const questions: PlacementQuestion[] = [];
  // Harder: combination kana, harder kanji, more vocab
  const hardHiragana = hiraganaPools[4]; // all kana including combinations
  const hardKatakana = katakanaPools[4];
  const harderKanji = n5Kanji.slice(30); // less common N5 kanji
  const harderVocab = n5Vocab.slice(50); // less common N5 vocab

  const kanaCount = Math.ceil(count * 0.3);
  const kanjiCount = Math.ceil(count * 0.4);
  const vocabCount = count - kanaCount - kanjiCount;

  for (let i = 0; i < kanaCount; i++) {
    // Focus on combination kana (harder)
    const pool = i % 2 === 0 ? hardHiragana : hardKatakana;
    questions.push(makeKanaQuestion(pool, 'n4'));
  }
  for (let i = 0; i < kanjiCount; i++) {
    if (harderKanji.length > 0) {
      questions.push(makeKanjiQuestion(harderKanji, 'n4'));
    } else {
      questions.push(makeKanjiQuestion(n5Kanji, 'n4'));
    }
  }
  for (let i = 0; i < vocabCount; i++) {
    if (harderVocab.length > 0) {
      questions.push(makeVocabQuestion(harderVocab, 'n4'));
    } else {
      questions.push(makeVocabQuestion(n5Vocab, 'n4'));
    }
  }

  return shuffle(questions);
}

function generateN3Questions(count: number): PlacementQuestion[] {
  const questions: PlacementQuestion[] = [];
  // Hardest from N5 data: all kana, all kanji, all vocab
  const allKana = hiraganaPools[4];
  const allKatakana = katakanaPools[4];

  const kanaCount = Math.ceil(count * 0.2);
  const kanjiCount = Math.ceil(count * 0.4);
  const vocabCount = count - kanaCount - kanjiCount;

  for (let i = 0; i < kanaCount; i++) {
    const pool = i % 2 === 0 ? allKana : allKatakana;
    questions.push(makeKanaQuestion(pool, 'n3'));
  }
  for (let i = 0; i < kanjiCount; i++) {
    questions.push(makeKanjiQuestion(n5Kanji, 'n3'));
  }
  for (let i = 0; i < vocabCount; i++) {
    questions.push(makeVocabQuestion(n5Vocab, 'n3'));
  }

  return shuffle(questions);
}

export function generatePlacementTest(): PlacementQuestion[] {
  // Start with 5 N5 questions
  // If user does well, add N4 then N3
  // Return all at once -- the adaptive logic is in calculateLevel
  return [
    ...generateN5Questions(5),
    ...generateN4Questions(5),
    ...generateN3Questions(5),
  ];
}

export interface PlacementScores {
  n5: number;
  n4: number;
  n3: number;
}

export function calculateLevel(
  answers: { questionIndex: number; selectedAnswer: string }[],
  questions: PlacementQuestion[],
): { level: string; scores: PlacementScores; totalCorrect: number; totalQuestions: number } {
  const scores: PlacementScores = { n5: 0, n4: 0, n3: 0 };
  const totals = { n5: 0, n4: 0, n3: 0 };
  let totalCorrect = 0;

  for (const answer of answers) {
    const q = questions[answer.questionIndex];
    if (!q) continue;

    totals[q.level]++;
    if (answer.selectedAnswer === q.correctAnswer) {
      scores[q.level]++;
      totalCorrect++;
    }
  }

  // Calculate percentages
  const n5Pct = totals.n5 > 0 ? scores.n5 / totals.n5 : 0;
  const n4Pct = totals.n4 > 0 ? scores.n4 / totals.n4 : 0;
  const n3Pct = totals.n3 > 0 ? scores.n3 / totals.n3 : 0;

  // Determine level
  let level = 'n5';
  if (n5Pct >= 0.8 && n4Pct >= 0.8 && n3Pct >= 0.6) {
    level = 'n3';
  } else if (n5Pct >= 0.8 && n4Pct >= 0.6) {
    level = 'n4';
  } else if (n5Pct >= 0.8) {
    level = 'n4';
  }

  return {
    level,
    scores,
    totalCorrect,
    totalQuestions: answers.length,
  };
}
