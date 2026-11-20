import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Quote } from '@/quotes/data';
import {
  HistoryContext,
  type HistoryEntry,
  type HistorySource,
} from '@/history/useHistory';

const STORAGE_KEY = 'muse-history';
const MAX_HISTORY_ENTRIES = 100;

function isValidQuote(item: unknown): item is Quote {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as Quote).text === 'string' &&
    typeof (item as Quote).author === 'string' &&
    typeof (item as Quote).category === 'string'
  );
}

function isValidHistoryEntry(item: unknown): item is HistoryEntry {
  if (typeof item !== 'object' || item === null) return false;
  const entry = item as HistoryEntry;
  return (
    typeof entry.id === 'string' &&
    typeof entry.viewedAt === 'number' &&
    (entry.source === 'today' || entry.source === 'mood') &&
    isValidQuote(entry.quote)
  );
}

function getInitialHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const validEntries: HistoryEntry[] = [];
      for (const item of parsed) {
        if (isValidHistoryEntry(item)) {
          // Avoid consecutive duplicates on load
          if (
            validEntries.length === 0 ||
            validEntries[validEntries.length - 1].quote.text !== item.quote.text
          ) {
            validEntries.push(item);
          }
        }
      }
      return validEntries.slice(0, MAX_HISTORY_ENTRIES);
    }
  } catch {
    // Graceful fallback for corrupted data
  }
  return [];
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(getInitialHistory);
  const lastRecordedRef = useRef<{ text: string; source: HistorySource; time: number } | null>(
    null
  );

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage could be full or blocked
    }
  }, [history]);

  // Sync with other browser tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(isValidHistoryEntry).slice(0, MAX_HISTORY_ENTRIES);
            setHistory(valid);
          }
        } catch {
          // Ignore invalid payload
        }
      } else if (e.key === STORAGE_KEY && !e.newValue) {
        setHistory([]);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const recordView = useCallback((quote: Quote, source: HistorySource) => {
    if (!quote || !quote.text) return;

    const now = Date.now();
    // Prevent immediate consecutive duplicate invokes (e.g. React StrictMode or quick re-renders)
    if (
      lastRecordedRef.current &&
      lastRecordedRef.current.text === quote.text &&
      lastRecordedRef.current.source === source &&
      now - lastRecordedRef.current.time < 1200
    ) {
      return;
    }

    lastRecordedRef.current = { text: quote.text, source, time: now };

    setHistory((prev) => {
      // Avoid duplicate consecutive entries
      if (prev.length > 0 && prev[0].quote.text === quote.text) {
        return prev;
      }

      const newEntry: HistoryEntry = {
        id: `${quote.author.replace(/\s+/g, '-')}-${now}-${Math.random().toString(36).slice(2, 7)}`,
        quote,
        viewedAt: now,
        source,
      };

      return [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
    lastRecordedRef.current = null;
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        recordView,
        clearHistory,
        historyCount: history.length,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}
