import { useState, useCallback, useRef, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { SectionIntro } from '@/sections/SectionIntro';
import { LibraryQuoteCard } from '@/components/quotes/LibraryQuoteCard';
import { Toast } from '@/components/ui/Toast';
import { useFavorites } from '@/favorites/useFavorites';
import type { SectionId } from '@/types';

interface FavoritesSectionProps {
  onNavigate?: (id: SectionId) => void;
}

export function FavoritesSection({ onNavigate }: FavoritesSectionProps) {
  const { favorites } = useFavorites();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: string, duration = 2400) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <section aria-label="Favorites">
      <SectionIntro eyebrow="Kept Close" title="Words you have saved">
        Quotes you mark as favorites gather here, so the lines that resonate are never more than
        a glance away.
      </SectionIntro>

      {favorites.length > 0 ? (
        <div className="mt-10 space-y-6">
          {/* Favorites Count Summary */}
          <div className="flex items-center justify-between border-b border-outline/60 pb-4">
            <p className="font-sans text-xs tracking-wider text-primary-soft">
              Saved <span className="font-semibold text-primary">{favorites.length}</span>{' '}
              {favorites.length === 1 ? 'quote' : 'quotes'}
            </p>
          </div>

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((quote) => (
              <LibraryQuoteCard
                key={quote.text}
                quote={quote}
                onToast={showToast}
                removeLabel="Remove"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-outline bg-raised p-12 text-center shadow-card sm:p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-highlight text-blush">
            <Heart className="h-7 w-7 fill-blush/25 text-blush" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-2xl text-primary">No favorites yet</h3>
          <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-primary-soft">
            When words resonate with you in Today or the Library, tap the heart icon to save them
            here for quiet reflection.
          </p>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('library')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-xs font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Explore the Library
            </button>
          )}
        </div>
      )}

      {/* Action feedback toast */}
      <Toast message={toast} />
    </section>
  );
}
