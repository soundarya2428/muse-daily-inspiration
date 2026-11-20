import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Copy,
  Heart,
  Quote as QuoteIcon,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  MOODS,
  type MoodId,
  getMoodConfig,
  getRandomQuoteForMood,
} from '@/quotes/moods';
import type { Quote } from '@/quotes/data';
import { copyQuoteToClipboard, shareQuote } from '@/quotes/actions';
import { useFavorites } from '@/favorites/useFavorites';
import { useHistory } from '@/history/useHistory';
import { Toast } from '@/components/ui/Toast';

export function MoodToMuse() {
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [recommendedQuote, setRecommendedQuote] = useState<Quote | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const reducedMotion = useReducedMotion() ?? false;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordView } = useHistory();

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (recommendedQuote) {
      recordView(recommendedQuote, 'mood');
    }
  }, [recommendedQuote, recordView]);

  const showToast = useCallback((message: string, duration = 2400) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const handleSelectMood = useCallback((moodId: MoodId) => {
    setSelectedMood(moodId);
    setRecommendedQuote(getRandomQuoteForMood(moodId));
  }, []);

  const handleFindAnother = useCallback(() => {
    if (!selectedMood) return;
    const next = getRandomQuoteForMood(selectedMood, recommendedQuote?.text);
    if (next) {
      setRecommendedQuote(next);
    } else {
      showToast('No additional quotes found for this mood.');
    }
  }, [selectedMood, recommendedQuote?.text, showToast]);

  const handleCopy = useCallback(async () => {
    if (!recommendedQuote) return;
    const ok = await copyQuoteToClipboard(recommendedQuote);
    if (ok) {
      setCopied(true);
      showToast('Quote copied to clipboard!');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Could not copy — clipboard access blocked.');
    }
  }, [recommendedQuote, showToast]);

  const handleShare = useCallback(async () => {
    if (!recommendedQuote) return;
    const result = await shareQuote(recommendedQuote);
    if (result === 'shared') return;
    if (result === 'copied') {
      showToast('Sharing unavailable — quote copied instead.');
    } else if (result === 'cancelled') {
      return;
    } else {
      showToast('Could not share right now. Please try again.');
    }
  }, [recommendedQuote, showToast]);

  const isFav = recommendedQuote ? isFavorite(recommendedQuote) : false;

  const handleToggleFavorite = useCallback(() => {
    if (!recommendedQuote) return;
    const nextState = !isFav;
    toggleFavorite(recommendedQuote);
    showToast(nextState ? 'Saved to Favorites' : 'Removed from Favorites');
  }, [isFav, recommendedQuote, toggleFavorite, showToast]);

  const activeConfig = selectedMood ? getMoodConfig(selectedMood) : null;

  return (
    <section aria-label="Mood-to-Muse" className="relative">
      <div className="max-w-2xl">
        <p className="font-sans text-xs uppercase tracking-widest2 text-gilt">
          Mood-to-Muse
        </p>
        <h3 className="mt-3 font-display text-2xl leading-tight text-primary sm:text-3xl">
          How are you feeling right now?
        </h3>
        <p className="mt-3 font-sans text-sm leading-relaxed text-primary-soft">
          Select your present state of mind to receive thoughtful inspiration attuned to where
          you are.
        </p>
      </div>

      {/* Mood Selector Grid */}
      <div
        role="radiogroup"
        aria-label="Select your current mood"
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelectMood(mood.id)}
              className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-blush/80 bg-highlight shadow-card-lifted ring-1 ring-blush/60'
                  : 'border-outline bg-raised shadow-card hover:border-gilt/50 hover:bg-highlight/50'
              }`}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110 sm:text-3xl">
                {mood.emoji}
              </span>
              <span className="mt-2 font-sans text-sm font-medium text-primary">
                {mood.label}
              </span>
              <span className="mt-0.5 line-clamp-1 font-sans text-[11px] text-primary-faint">
                {mood.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommended Quote Display */}
      <AnimatePresence mode="wait">
        {selectedMood && recommendedQuote && activeConfig && (
          <motion.div
            key={selectedMood}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative mt-8 overflow-hidden rounded-3xl border border-outline bg-raised shadow-card"
          >
            {/* Watermark Quote Icon */}
            <QuoteIcon
              aria-hidden
              className="pointer-events-none absolute -top-3 right-6 h-28 w-28 text-blush/10"
              strokeWidth={1}
            />

            <div className="relative px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10">
              {/* Badges Header */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-highlight px-3.5 py-1 font-sans text-[11px] uppercase tracking-widest2 text-gilt">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                  <span>{activeConfig.emoji}</span>
                  <span>{activeConfig.label}</span>
                </span>
                <span className="inline-flex items-center rounded-full border border-outline bg-surface px-3 py-1 font-sans text-[11px] uppercase tracking-widest2 text-primary-soft">
                  {recommendedQuote.category}
                </span>
              </div>

              {/* Animated Quote Body */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={recommendedQuote.text}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-6 min-h-[7rem] sm:min-h-[8.5rem]"
                >
                  <p className="font-quote text-2xl italic leading-snug text-primary sm:text-[28px] sm:leading-[1.35]">
                    “{recommendedQuote.text}”
                  </p>
                  <p className="mt-4 font-sans text-xs tracking-wider uppercase text-primary-soft">
                    — {recommendedQuote.author}
                  </p>
                </motion.div>
              </AnimatePresence>

              <p className="mt-6 font-sans text-[11px] text-primary-faint">
                Recommended from your {activeConfig.label.toLowerCase()} reflection pool (
                {activeConfig.categories.join(', ')}).
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline/70 px-6 py-4 sm:px-10">
              <button
                type="button"
                onClick={handleFindAnother}
                aria-label={`Find another quote for ${activeConfig.label} mood`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-sans text-xs font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Find another
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Favorite */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label={
                    isFav
                      ? `Remove quote by ${recommendedQuote.author} from favorites`
                      : `Save quote by ${recommendedQuote.author} to favorites`
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
                  aria-label={`Copy quote by ${recommendedQuote.author}`}
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
                  aria-label={`Share quote by ${recommendedQuote.author}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary transition-colors duration-200 hover:bg-highlight active:scale-95"
                >
                  <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graceful fallback if a mood has no matching quotes */}
      {selectedMood && !recommendedQuote && (
        <div className="mt-8 rounded-2xl border border-outline bg-raised p-8 text-center shadow-card">
          <p className="font-sans text-sm text-primary-soft">
            No matching quotes were found for this mood. Please choose another mood.
          </p>
        </div>
      )}

      {/* Toast Feedback */}
      <Toast message={toast} />
    </section>
  );
}
