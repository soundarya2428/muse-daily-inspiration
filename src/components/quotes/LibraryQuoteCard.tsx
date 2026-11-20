import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Heart,
  Image as ImageIcon,
  Quote as QuoteIcon,
  Share2,
  Sparkles,
} from 'lucide-react';
import type { Quote } from '@/quotes/data';
import { copyQuoteToClipboard, shareQuote } from '@/quotes/actions';
import { useFavorites } from '@/favorites/useFavorites';
import { useImageCreator } from '@/imageCreator/useImageCreator';

interface LibraryQuoteCardProps {
  quote: Quote;
  onToast: (message: string) => void;
  removeLabel?: string;
}

export function LibraryQuoteCard({ quote, onToast, removeLabel }: LibraryQuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openCreator } = useImageCreator();
  const isFav = isFavorite(quote);

  const handleToggleFavorite = useCallback(() => {
    const nextState = !isFav;
    toggleFavorite(quote);
    onToast(nextState ? 'Saved to Favorites' : 'Removed from Favorites');
  }, [isFav, quote, toggleFavorite, onToast]);

  const handleCopy = useCallback(async () => {
    const ok = await copyQuoteToClipboard(quote);
    if (ok) {
      setCopied(true);
      onToast('Quote copied to clipboard!');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      onToast('Could not copy — clipboard access blocked.');
    }
  }, [quote, onToast]);

  const handleShare = useCallback(async () => {
    const result = await shareQuote(quote);
    if (result === 'shared') return; // Native sheet provides its own feedback
    if (result === 'copied') {
      onToast('Sharing unavailable — quote copied instead.');
    } else if (result === 'cancelled') {
      return;
    } else {
      onToast('Could not share right now. Please try again.');
    }
  }, [quote, onToast]);

  const favoriteLabel = isFav ? removeLabel ?? 'Favorited' : 'Favorite';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-outline bg-raised p-6 shadow-card transition-all duration-300 hover:border-gilt/40 hover:shadow-card-lifted sm:p-7">
      {/* Decorative subtle quotation watermark */}
      <QuoteIcon
        aria-hidden
        className="pointer-events-none absolute -top-3 right-4 h-20 w-20 text-blush/10 transition-colors duration-300 group-hover:text-blush/20"
        strokeWidth={1}
      />

      <div className="relative">
        {/* Category Pill */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-highlight px-3.5 py-1 font-sans text-[11px] uppercase tracking-widest2 text-gilt">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          {quote.category}
        </span>

        {/* Quote text */}
        <p className="mt-4 font-quote text-xl italic leading-relaxed text-primary sm:text-2xl">
          “{quote.text}”
        </p>

        {/* Author */}
        <p className="mt-4 font-sans text-xs tracking-wider uppercase text-primary-soft">
          — {quote.author}
        </p>
      </div>

      {/* Action Footer */}
      <div className="relative mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-outline/70 pt-4">
        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={
            isFav
              ? `Remove quote by ${quote.author} from favorites`
              : `Save quote by ${quote.author} to favorites`
          }
          aria-pressed={isFav}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-sans text-xs font-medium transition-all duration-200 active:scale-95 ${
            isFav
              ? 'border-blush/70 bg-highlight text-primary shadow-sm'
              : 'border-outline bg-surface text-primary hover:bg-highlight'
          }`}
        >
          <motion.span
            key={isFav ? 'fav' : 'unfav'}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center justify-center"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors duration-200 ${
                isFav ? 'fill-blush text-blush' : 'text-primary-soft'
              }`}
              strokeWidth={1.5}
            />
          </motion.span>
          <span>{favoriteLabel}</span>
        </button>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy quote: "${quote.text}" by ${quote.author}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-gilt" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share quote: "${quote.text}" by ${quote.author}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Share</span>
        </button>

        {/* Image Creator Button */}
        <button
          type="button"
          onClick={() => openCreator(quote)}
          aria-label={`Create downloadable image for quote: "${quote.text}" by ${quote.author}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
        >
          <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Image</span>
        </button>
      </div>
    </article>
  );
}
