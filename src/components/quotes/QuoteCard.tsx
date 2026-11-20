import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Copy, Eye, EyeOff, Heart, History, Image as ImageIcon, Quote as QuoteIcon, Share2, Sparkles } from 'lucide-react';
import type { Quote } from '@/quotes/data';
import { copyQuoteToClipboard, shareQuote } from '@/quotes/actions';
import { useFavorites } from '@/favorites/useFavorites';
import { useImageCreator } from '@/imageCreator/useImageCreator';
import { Toast } from '@/components/ui/Toast';

interface QuoteCardProps {
  quote: Quote;
  showText: boolean;
  onToggleText: () => void;
  onNewQuote: () => void;
  onPreviousQuote: () => void;
  canGoBack: boolean;
}

const MOTION_PRESETS = {
  full: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -14 },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  reduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
} as const;

export function QuoteCard({
  quote,
  showText,
  onToggleText,
  onNewQuote,
  onPreviousQuote,
  canGoBack,
}: QuoteCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const quoteMotion = reducedMotion ? MOTION_PRESETS.reduced : MOTION_PRESETS.full;

  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(quote);
  const { openCreator } = useImageCreator();

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: string, duration = 2400) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const handleToggleFavorite = useCallback(() => {
    const nextState = !isFav;
    toggleFavorite(quote);
    showToast(nextState ? 'Saved to Favorites' : 'Removed from Favorites');
  }, [isFav, quote, toggleFavorite, showToast]);

  const handleCopy = useCallback(async () => {
    const ok = await copyQuoteToClipboard(quote);
    if (ok) {
      setCopied(true);
      showToast('Quote copied!');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Could not copy — your browser blocked clipboard access.');
    }
  }, [quote, showToast]);

  const handleShare = useCallback(async () => {
    const result = await shareQuote(quote);
    if (result === 'shared') return; // native sheet handles its own feedback
    if (result === 'copied') showToast('Sharing unavailable — quote copied instead.');
    else if (result === 'cancelled') return;
    else showToast('Could not share right now. Please try again.');
  }, [quote, showToast]);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        className="relative mt-10 overflow-hidden rounded-3xl border border-outline bg-raised shadow-card"
      >
        <QuoteIcon
          aria-hidden
          className="pointer-events-none absolute -top-3 right-6 h-32 w-32 text-blush/15"
          strokeWidth={1}
        />

        <div className="relative px-6 pb-6 pt-10 sm:px-12 sm:pb-8 sm:pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={quote.text} {...quoteMotion} className="min-h-[11rem] sm:min-h-[13rem]">
              <p className="font-quote text-2xl italic leading-snug text-primary sm:text-[32px] sm:leading-[1.35]">
                {showText ? quote.text : '\u00A0'}
              </p>
              <p className="mt-6 font-sans text-sm tracking-wide text-primary-soft">
                — {quote.author}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-outline bg-highlight px-4 py-1.5 font-sans text-[11px] uppercase tracking-widest2 text-gilt">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                {quote.category}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNewQuote}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              New Quote
            </button>
            <button
              type="button"
              onClick={onPreviousQuote}
              disabled={!canGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-5 py-2.5 font-sans text-sm font-medium text-primary transition-colors duration-200 hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
            >
              <History className="h-4 w-4" strokeWidth={1.5} />
              Previous
            </button>
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={
                isFav
                  ? `Remove quote by ${quote.author} from favorites`
                  : `Save quote by ${quote.author} to favorites`
              }
              aria-pressed={isFav}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-sm font-medium transition-all duration-200 active:scale-95 ${
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
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isFav ? 'fill-blush text-blush' : 'text-primary-soft'
                  }`}
                  strokeWidth={1.5}
                />
              </motion.span>
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-5 py-2.5 font-sans text-sm font-medium text-primary transition-colors duration-200 hover:bg-highlight"
            >
              {copied ? (
                <Check className="h-4 w-4 text-gilt" strokeWidth={2} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.5} />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-5 py-2.5 font-sans text-sm font-medium text-primary transition-colors duration-200 hover:bg-highlight"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
              Share
            </button>
            <button
              type="button"
              onClick={() => openCreator(quote)}
              aria-label={`Create downloadable image for quote by ${quote.author}`}
              className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-5 py-2.5 font-sans text-sm font-medium text-primary transition-colors duration-200 hover:bg-highlight"
            >
              <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
              Image
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleText}
            aria-pressed={!showText}
            aria-label={showText ? 'Hide quote text' : 'Show quote text'}
            className="inline-flex items-center gap-2 self-start rounded-full border border-outline bg-surface px-5 py-2.5 font-sans text-sm font-medium text-primary transition-colors duration-200 hover:bg-highlight"
          >
            {showText ? (
              <>
                <EyeOff className="h-4 w-4" strokeWidth={1.5} /> Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" strokeWidth={1.5} /> Show
              </>
            )}
          </button>
        </div>

        <Toast message={toast} />
      </motion.article>
    </>
  );
}
