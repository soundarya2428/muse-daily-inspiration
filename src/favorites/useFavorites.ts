import { createContext, useContext } from 'react';
import type { Quote } from '@/quotes/data';

export interface FavoritesContextValue {
  favorites: Quote[];
  isFavorite: (quote: Quote) => boolean;
  /** Toggles the favorite state for a quote. */
  toggleFavorite: (quote: Quote) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
