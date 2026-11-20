import { useState, useCallback, type ReactNode } from 'react';
import type { Quote } from '@/quotes/data';
import { ImageCreatorContext } from '@/imageCreator/useImageCreator';
import { QuoteImageModal } from '@/components/imageCreator/QuoteImageModal';

export function ImageCreatorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  const openCreator = useCallback((quote: Quote) => {
    setActiveQuote(quote);
    setIsOpen(true);
  }, []);

  const closeCreator = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ImageCreatorContext.Provider
      value={{
        isOpen,
        activeQuote,
        openCreator,
        closeCreator,
      }}
    >
      {children}
      <QuoteImageModal />
    </ImageCreatorContext.Provider>
  );
}
