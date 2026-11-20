import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Compass,
  Copy,
  Heart,
  Quote as QuoteIcon,
  Share2,
  Sparkles,
  Sun,
} from 'lucide-react';
import type { HistoryEntry } from '@/history/useHistory';
import { copyQuoteToClipboard, shareQuote } from '@/quotes/actions';
import { useFavorites } from '@/favorites/useFavorites';

interface HistoryQuoteCardProps {
  entry: HistoryEntry;
  onToast: (message: string) => void;
}

function formatViewedAt(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} at ${timeStr}`;
}

export function HistoryQuoteCard({ entry, onToast }: HistoryQuoteCardProps) {
  const { quote, viewedAt, source } = entry;
  const [copied, setCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
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
    if (result === 'shared') return;
    if (result === 'copied') {
      onToast('Sharing unavailable — quote copied instead.');
    } else if (result === 'cancelled') {
      return;
    } else {
      onToast('Could not share right now. Please try again.');
    }
  }, [quote, onToast]);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-outline bg-raised p-6 shadow-card transition-all duration-300 hover:border-gilt/40 hover:shadow-card-lifted sm:p-7">
      {/* Quotation watermark */}
      <QuoteIcon
        aria-hidden
        className="pointer-events-none absolute -top-3 right-4 h-20 w-20 text-blush/10 transition-colors duration-300 group-hover:text-blush/20"
        strokeWidth={1}
      />

      <div className="relative">
        {/* Badges: Category + Timestamp + Source */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-highlight px-3.5 py-1 font-sans text-[11px] uppercase tracking-widest2 text-gilt">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
            {quote.category}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3 py-1 font-sans text-[11px] text-primary-soft">
            <Clock className="h-3 w-3 text-gilt/80" strokeWidth={1.5} />
            <span>{formatViewedAt(viewedAt)}</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-outline/70 bg-surface/70 px-2.5 py-0.5 font-sans text-[10px] text-primary-faint">
            {source === 'today' ? (
              <>
                <Sun className="h-2.5 w-2.5 text-gilt" />
                <span>Today</span>
              </>
            ) : (
              <>
                <Compass className="h-2.5 w-2.5 text-blush" />
                <span>Mood</span>
              </>
            )}
          </span>
        </div>

        {/* Quote text */}
        <p className="mt-4 font-quote text-xl italic leading-relaxed text-primary sm:text-2xl">
          “{quote.text}”
        </p>

        {/* Author citation */}
        <p className="mt-4 font-sans text-xs tracking-wider uppercase text-primary-soft">
          — {quote.author}
        </p>
      </div>

      {/* Action Footer */}
      <div className="relative mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-outline/70 pt-4">
        {/* Favorite */}
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
          <span>{isFav ? 'Favorited' : 'Favorite'}</span>
        </button>

        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy quote by ${quote.author}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-gilt" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share quote by ${quote.author}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
