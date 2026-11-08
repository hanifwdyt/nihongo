import OpenAI from 'openai';

// AI lewat 9router (https://9router.noesis.nz, OpenAI-compatible) — satu key buat semua app.
let _ai: OpenAI | null = null;

export function getAI(): OpenAI {
  if (!_ai) {
    _ai = new OpenAI({
      baseURL: process.env.AI_BASE_URL || 'https://9router.noesis.nz/v1',
      apiKey: process.env.NINEROUTER_API_KEY || '',
    });
  }
  return _ai;
}

// Sensei: tutor santai, balasan pendek + tool call ringan (cari kanji/kosakata).
// Yang dikejar respons cepat, bukan nalar panjang → Haiku 4.5 tanpa thinking.
export const BUDDY_MODEL = process.env.AI_MODEL || 'cc/claude-haiku-4-5-20251001';

// Param tambahan 9router. Ditaruh terpisah karena `reasoning_effort: "none"`
// belum tentu ada di tipe SDK. `stream: false` wajib buat panggilan non-stream:
// 9router default-nya nge-stream buat model Claude.
export const BUDDY_EXTRA = { reasoning_effort: process.env.AI_EFFORT || 'none' } as unknown as Record<string, never>;
export const NO_STREAM = { stream: false as const };
