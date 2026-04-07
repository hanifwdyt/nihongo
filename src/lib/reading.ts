import type { FuriganaSegment } from '@/data/reading/n5-reading';

export function calculateCPM(charCount: number, timeMs: number): number {
  if (timeMs <= 0) return 0;
  const minutes = timeMs / 60000;
  return Math.round(charCount / minutes);
}

export function getCharCount(segments: FuriganaSegment[]): number {
  return segments.reduce((acc, seg) => acc + seg.text.length, 0);
}

export function getCPMFeedback(cpm: number): { level: string; message: string } {
  if (cpm >= 200) return { level: 'fast', message: 'Incredible speed! Native-level reading!' };
  if (cpm >= 120) return { level: 'good', message: 'Great reading speed! Keep it up!' };
  if (cpm >= 60) return { level: 'average', message: 'Solid pace. Practice will make you faster!' };
  return { level: 'slow', message: 'Take your time — understanding is more important than speed!' };
}

export function getPlainText(segments: FuriganaSegment[]): string {
  return segments.map((s) => s.text).join('');
}
