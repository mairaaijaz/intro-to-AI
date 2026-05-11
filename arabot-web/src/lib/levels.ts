/**
 * levels.ts — 20 difficulty levels for Arabot
 *
 * Level 1  = easiest (greetings, basic numbers)
 * Level 20 = hardest (all categories, mixed)
 *
 * Each level defines:
 *   - which categories are in the word pool
 *   - recommended session size
 *   - emoji + display name
 */

export interface Level {
  id: number;
  name: string;
  emoji: string;
  description: string;
  categories: string[];   // word pool filtered to these categories
  sessionSize: number;    // how many words per session
  color: string;          // card background gradient
}

export const LEVELS: Level[] = [
  // ── Tier 1: Beginner Basics (1–4) ────────────────────────────────────────
  {
    id: 1, name: 'Hello!', emoji: '👋', description: 'Basic greetings',
    categories: ['greetings'], sessionSize: 5,
    color: 'linear-gradient(135deg,#ffb3ba,#ffdfba)',
  },
  {
    id: 2, name: 'Count!', emoji: '🔢', description: 'Numbers 1–10',
    categories: ['numbers'], sessionSize: 5,
    color: 'linear-gradient(135deg,#ffffba,#baffc9)',
  },
  {
    id: 3, name: 'Rainbow', emoji: '🌈', description: 'Colours of the world',
    categories: ['colors'], sessionSize: 5,
    color: 'linear-gradient(135deg,#bae1ff,#c9b3ff)',
  },
  {
    id: 4, name: 'My Family', emoji: '👨‍👩‍👧', description: 'Family members',
    categories: ['family'], sessionSize: 7,
    color: 'linear-gradient(135deg,#ffcce7,#ffb3ba)',
  },

  // ── Tier 2: My World (5–8) ────────────────────────────────────────────────
  {
    id: 5, name: 'My Body', emoji: '🦾', description: 'Body parts',
    categories: ['body'], sessionSize: 7,
    color: 'linear-gradient(135deg,#baffc9,#b3f0ff)',
  },
  {
    id: 6, name: 'Yummy!', emoji: '🍎', description: 'Food & drinks',
    categories: ['food'], sessionSize: 8,
    color: 'linear-gradient(135deg,#ffdfba,#ffffba)',
  },
  {
    id: 7, name: 'Animals', emoji: '🐾', description: 'Animals big & small',
    categories: ['animals'], sessionSize: 7,
    color: 'linear-gradient(135deg,#e8d5ff,#ffcce7)',
  },
  {
    id: 8, name: 'Mix 1', emoji: '🎲', description: 'Mix: Greetings + Numbers + Colors',
    categories: ['greetings','numbers','colors'], sessionSize: 10,
    color: 'linear-gradient(135deg,#ffb3ba,#ffffba,#bae1ff)',
  },

  // ── Tier 3: My Community (9–12) ──────────────────────────────────────────
  {
    id: 9, name: 'Nature', emoji: '🌿', description: 'Sun, rain, trees & more',
    categories: ['nature'], sessionSize: 7,
    color: 'linear-gradient(135deg,#baffc9,#ffffba)',
  },
  {
    id: 10, name: 'Places', emoji: '🏠', description: 'Home, school, mosque & more',
    categories: ['places'], sessionSize: 10,
    color: 'linear-gradient(135deg,#bae1ff,#e8d5ff)',
  },
  {
    id: 11, name: 'Time', emoji: '⏰', description: 'Days, weeks, months & more',
    categories: ['time'], sessionSize: 7,
    color: 'linear-gradient(135deg,#ffffba,#ffdfba)',
  },
  {
    id: 12, name: 'Transport', emoji: '🚗', description: 'Cars, trains & planes',
    categories: ['transport'], sessionSize: 7,
    color: 'linear-gradient(135deg,#b3f0ff,#baffc9)',
  },

  // ── Tier 4: Learning & Action (13–16) ─────────────────────────────────────
  {
    id: 13, name: 'Action!', emoji: '🏃', description: 'Verbs — what we do',
    categories: ['verbs'], sessionSize: 10,
    color: 'linear-gradient(135deg,#ffcce7,#ffb3ba)',
  },
  {
    id: 14, name: 'Questions', emoji: '❓', description: 'Who, what, where, when',
    categories: ['questions'], sessionSize: 7,
    color: 'linear-gradient(135deg,#e8d5ff,#bae1ff)',
  },
  {
    id: 15, name: 'School', emoji: '🎓', description: 'Education & work words',
    categories: ['education'], sessionSize: 8,
    color: 'linear-gradient(135deg,#c9b3ff,#e8d5ff)',
  },
  {
    id: 16, name: 'Mix 2', emoji: '🎯', description: 'Mix: Nature + Places + Time',
    categories: ['nature','places','time','transport'], sessionSize: 12,
    color: 'linear-gradient(135deg,#bae1ff,#baffc9,#ffdfba)',
  },

  // ── Tier 5: Advanced (17–20) ─────────────────────────────────────────────
  {
    id: 17, name: 'Describe It', emoji: '✨', description: 'Adjectives — big, fast, beautiful',
    categories: ['adjectives'], sessionSize: 10,
    color: 'linear-gradient(135deg,#ffffba,#ffcce7)',
  },
  {
    id: 18, name: 'Health', emoji: '❤️‍🩹', description: 'Health & body care',
    categories: ['health'], sessionSize: 7,
    color: 'linear-gradient(135deg,#ffb3ba,#ffcce7)',
  },
  {
    id: 19, name: 'Tech', emoji: '💻', description: 'Technology & gadgets',
    categories: ['technology'], sessionSize: 8,
    color: 'linear-gradient(135deg,#b3f0ff,#c9b3ff)',
  },
  {
    id: 20, name: 'Master!', emoji: '🏆', description: 'All 200 words — the ultimate challenge!',
    categories: [
      'greetings','numbers','colors','family','body','food',
      'animals','nature','places','time','transport','verbs',
      'questions','education','adjectives','health','technology',
    ],
    sessionSize: 15,
    color: 'linear-gradient(135deg,#ffb3ba,#ffffba,#baffc9,#bae1ff,#e8d5ff)',
  },
];

export function getLevelById(id: number): Level | undefined {
  return LEVELS.find(l => l.id === id);
}
