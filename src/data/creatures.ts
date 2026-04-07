export interface Creature {
  id: string;
  name: string;
  emoji: string;
  color: string;
  personality: string;
  idleFrames: string[];
  celebrateFrames: string[];
  thinkFrames: string[];
}

export const creatures: Creature[] = [
  {
    id: 'dragon',
    name: 'Ryuu',
    emoji: '🐉',
    color: '#10b981',
    personality: 'wise and encouraging',
    idleFrames: ['🐉', '🐲', '🐉', '✨🐉'],
    celebrateFrames: ['🎉🐉', '✨🐉✨', '🐉🎊', '⭐🐉⭐'],
    thinkFrames: ['🤔🐉', '💭🐉', '🐉💡', '🐉✨'],
  },
  {
    id: 'fox',
    name: 'Kitsune',
    emoji: '🦊',
    color: '#f97316',
    personality: 'playful and mischievous',
    idleFrames: ['🦊', '🦊✨', '🦊', '🦊💫'],
    celebrateFrames: ['🎉🦊', '🦊🎊', '✨🦊✨', '🦊⭐'],
    thinkFrames: ['🦊🤔', '🦊💭', '🦊💡', '💫🦊'],
  },
  {
    id: 'tanuki',
    name: 'Ponta',
    emoji: '🦝',
    color: '#8b5cf6',
    personality: 'chill and funny',
    idleFrames: ['🦝', '🦝🍃', '🦝', '🍂🦝'],
    celebrateFrames: ['🦝🎉', '✨🦝✨', '🦝🎊', '⭐🦝'],
    thinkFrames: ['🦝💭', '🤔🦝', '🦝💡', '🦝✨'],
  },
  {
    id: 'owl',
    name: 'Fukurou',
    emoji: '🦉',
    color: '#6366f1',
    personality: 'scholarly and precise',
    idleFrames: ['🦉', '🦉✨', '🦉', '💫🦉'],
    celebrateFrames: ['🦉🎉', '✨🦉✨', '🦉📚⭐', '🎊🦉'],
    thinkFrames: ['🦉📖', '🦉💭', '🦉💡', '📚🦉'],
  },
  {
    id: 'cat',
    name: 'Neko',
    emoji: '🐱',
    color: '#ec4899',
    personality: 'sassy but caring',
    idleFrames: ['🐱', '😺', '🐱', '😸'],
    celebrateFrames: ['😻', '🐱🎉', '✨🐱✨', '😸⭐'],
    thinkFrames: ['🐱💭', '😼', '🐱💡', '😺✨'],
  },
  {
    id: 'rabbit',
    name: 'Usagi',
    emoji: '🐰',
    color: '#f472b6',
    personality: 'energetic and supportive',
    idleFrames: ['🐰', '🐰✨', '🐰', '🐰💫'],
    celebrateFrames: ['🐰🎉', '✨🐰✨', '🐰🎊', '⭐🐰'],
    thinkFrames: ['🐰💭', '🤔🐰', '🐰💡', '🐰✨'],
  },
  {
    id: 'penguin',
    name: 'Penpen',
    emoji: '🐧',
    color: '#3b82f6',
    personality: 'calm and reliable',
    idleFrames: ['🐧', '🐧❄️', '🐧', '✨🐧'],
    celebrateFrames: ['🐧🎉', '✨🐧✨', '🐧🎊', '⭐🐧'],
    thinkFrames: ['🐧💭', '🐧🤔', '🐧💡', '🐧✨'],
  },
  {
    id: 'panda',
    name: 'Pan-chan',
    emoji: '🐼',
    color: '#1f2937',
    personality: 'gentle and patient',
    idleFrames: ['🐼', '🐼🎋', '🐼', '🐼✨'],
    celebrateFrames: ['🐼🎉', '✨🐼✨', '🐼🎊', '⭐🐼'],
    thinkFrames: ['🐼💭', '🐼🤔', '🐼💡', '🐼✨'],
  },
];

export function getRandomCreature(): Creature {
  return creatures[Math.floor(Math.random() * creatures.length)];
}

export function getCreatureById(id: string): Creature | undefined {
  return creatures.find((c) => c.id === id);
}
