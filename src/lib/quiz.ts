import type { KanaEntry } from '@/data/kana';

export interface Question {
  kana: string;
  romaji: string;
}

export interface QuizResult {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuiz(pool: KanaEntry[], count = 50): Question[] {
  const questions: Question[] = [];
  while (questions.length < count) {
    const shuffled = shuffle(pool);
    for (const entry of shuffled) {
      if (questions.length >= count) break;
      questions.push({ kana: entry.kana, romaji: entry.romaji });
    }
  }
  return questions;
}

export function generateMultipleChoice(
  pool: KanaEntry[],
  count = 20,
  optionCount = 4,
): { question: Question; options: string[] }[] {
  const questions = generateQuiz(pool, count);
  const allRomaji = [...new Set(pool.map((e) => e.romaji))];

  return questions.map((q) => {
    const wrongOptions = shuffle(allRomaji.filter((r) => r !== q.romaji)).slice(
      0,
      optionCount - 1,
    );
    const options = shuffle([q.romaji, ...wrongOptions]);
    return { question: q, options };
  });
}

export function getFeedback(
  score: number,
  total: number,
): { level: 'red' | 'yellow' | 'green'; message: string } {
  const pct = score / total;
  if (pct < 0.6)
    return { level: 'red', message: 'You need more practice at this level' };
  if (pct < 0.8)
    return {
      level: 'yellow',
      message: 'Good progress! Review what you missed',
    };
  return { level: 'green', message: 'Great job! Ready for the next level' };
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
}
