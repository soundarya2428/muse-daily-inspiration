import { QUOTES, type Category, type Quote } from '@/quotes/data';

export type MoodId =
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'motivated'
  | 'lost'
  | 'loved'
  | 'creative'
  | 'calm';

export interface MoodConfig {
  id: MoodId;
  label: string;
  emoji: string;
  description: string;
  categories: readonly Category[];
}

export const MOODS: readonly MoodConfig[] = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    description: 'Joy, celebration & gratitude',
    categories: ['Happiness', 'Life', 'Growth'],
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '🌧️',
    description: 'Gentle warmth for cloudy days',
    categories: ['Happiness', 'Life', 'Growth'],
  },
  {
    id: 'anxious',
    label: 'Anxious',
    emoji: '😰',
    description: 'Grounding words of reassurance',
    categories: ['Confidence', 'Life', 'Growth'],
  },
  {
    id: 'motivated',
    label: 'Motivated',
    emoji: '🔥',
    description: 'Fuel your drive and focus',
    categories: ['Motivation', 'Success', 'Discipline'],
  },
  {
    id: 'lost',
    label: 'Lost',
    emoji: '🌱',
    description: 'Gentle guidance to find your path',
    categories: ['Growth', 'Dreams', 'Life'],
  },
  {
    id: 'loved',
    label: 'Loved',
    emoji: '💗',
    description: 'Embrace connection and warmth',
    categories: ['Love', 'Happiness'],
  },
  {
    id: 'creative',
    label: 'Creative',
    emoji: '🎨',
    description: 'Spark inspiration and wonder',
    categories: ['Creativity', 'Dreams'],
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '🌿',
    description: 'Deepen presence and peace',
    categories: ['Life', 'Happiness', 'Growth'],
  },
] as const;

export function getMoodConfig(moodId: MoodId): MoodConfig {
  const config = MOODS.find((m) => m.id === moodId);
  if (!config) throw new Error(`Unknown mood id: ${moodId}`);
  return config;
}

/**
 * Returns all existing quotes belonging to the categories mapped to the given mood.
 */
export function getQuotesForMood(moodId: MoodId): Quote[] {
  const config = getMoodConfig(moodId);
  if (!config) return [];
  const categorySet = new Set<string>(config.categories);
  return QUOTES.filter((q) => categorySet.has(q.category));
}

/**
 * Recommends a quote matching the mapped categories.
 * Guarantees no immediate repetition of the currently shown quote when alternatives exist.
 */
export function getRandomQuoteForMood(
  moodId: MoodId,
  excludeText?: string
): Quote | null {
  const pool = getQuotesForMood(moodId);
  if (pool.length === 0) return null;

  const eligible =
    excludeText && pool.length > 1
      ? pool.filter((q) => q.text !== excludeText)
      : pool;

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex] ?? pool[0];
}
