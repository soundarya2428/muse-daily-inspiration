import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Quote } from '@/quotes/data';
import { FavoritesContext } from '@/favorites/useFavorites';

const STORAGE_KEY = 'muse-favorites';

function isValidQuote(item: unknown): item is Quote {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as Quote).text === 'string' &&
    typeof (item as Quote).author === 'string' &&
    typeof (item as Quote).category === 'string'
  );
}

function getInitialFavorites(): Quote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const seen = new Set<string>();
      const validQuotes: Quote[] = [];
      for (const item of parsed) {
        if (isValidQuote(item) && !seen.has(item.text)) {
          seen.add(item.text);
          validQuotes.push(item);
        }
      }
      return validQuotes;
    }
  } catch {
    // Graceful fallback if storage access fails or data is corrupted
  }
  return [];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Quote[]>(getInitialFavorites);

  // Persist favorites to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage might be blocked or full in private browsing
    }
  }, [favorites]);

  // Sync across tabs if user changes favorites in another window
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const seen = new Set<string>();
            const valid = parsed.filter((item): item is Quote => {
              if (isValidQuote(item) && !seen.has(item.text)) {
                seen.add(item.text);
                return true;
              }
              return false;
            });
            setFavorites(valid);
          }
        } catch {
          // Ignore invalid payload
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isFavorite = useCallback(
    (quote: Quote) => favorites.some((f) => f.text === quote.text),
    [favorites]
  );

  const toggleFavorite = useCallback((quote: Quote): void => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.text === quote.text);
      if (exists) {
        return prev.filter((f) => f.text !== quote.text);
      }
      return [quote, ...prev]; // Place newly favorited quote at the top
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

