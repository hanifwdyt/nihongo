import OpenAI from 'openai';

let _ai: OpenAI | null = null;

export function getAI(): OpenAI {
  if (!_ai) {
    _ai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
    });
  }
  return _ai;
}

export const BUDDY_MODEL = 'anthropic/claude-haiku-4.5';
