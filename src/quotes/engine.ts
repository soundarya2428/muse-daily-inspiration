import { QUOTES } from '@/quotes/data';
import type { Quote } from '@/quotes/data';

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Deterministic quote for a given calendar day — same all day, changes at midnight. */
export function dailyQuote(date: Date = new Date()): Quote {
  const index = hashString(dayKey(date)) % QUOTES.length;
  return QUOTES[index];
}

/** Random quote, guaranteed different from `excludeText` (the currently shown one). */
export function randomQuote(excludeText?: string): Quote {
  const pool = excludeText ? QUOTES.filter((q) => q.text !== excludeText) : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
