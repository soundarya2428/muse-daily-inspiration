import { createContext, useContext } from 'react';
import type { Quote } from '@/quotes/data';

export interface ImageCreatorContextValue {
  isOpen: boolean;
  activeQuote: Quote | null;
  openCreator: (quote: Quote) => void;
  closeCreator: () => void;
}

export const ImageCreatorContext = createContext<ImageCreatorContextValue | null>(null);

export function useImageCreator(): ImageCreatorContextValue {
  const ctx = useContext(ImageCreatorContext);
  if (!ctx) {
    throw new Error('useImageCreator must be used within ImageCreatorProvider');
  }
  return ctx;
}
