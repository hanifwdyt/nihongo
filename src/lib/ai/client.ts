import OpenAI from 'openai';

export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const BUDDY_MODEL = 'anthropic/claude-haiku-4.5';
