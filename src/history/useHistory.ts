import { createContext, useContext } from 'react';
import type { Quote } from '@/quotes/data';

export type HistorySource = 'today' | 'mood';

export interface HistoryEntry {
  id: string;
  quote: Quote;
  viewedAt: number; // Unix timestamp in ms
  source: HistorySource;
}

export interface HistoryContextValue {
  history: HistoryEntry[];
  recordView: (quote: Quote, source: HistorySource) => void;
  clearHistory: () => void;
  historyCount: number;
}

export const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return ctx;
}
