import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionIntro } from '@/sections/SectionIntro';
import { LibraryQuoteCard } from '@/components/quotes/LibraryQuoteCard';
import { Toast } from '@/components/ui/Toast';
import { QUOTES, CATEGORIES, type Category } from '@/quotes/data';

type SelectedCategory = 'all' | Category;

export function LibrarySection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('all');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message: string, duration = 2400) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const filteredQuotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return QUOTES.filter((q) => {
      const matchesCategory =
        selectedCategory === 'all' || q.category === selectedCategory;
      const matchesSearch =
        !query ||
        q.text.toLowerCase().includes(query) ||
        q.author.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  // Compute counts for category badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: QUOTES.length };
    for (const quote of QUOTES) {
      counts[quote.category] = (counts[quote.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <section aria-label="Library">
      <SectionIntro eyebrow="The Collection" title="A library of timeless words">
        Explore quotes across 10 timeless disciplines. Search by keyword or author, or filter by
        category to find the perspective you need today.
      </SectionIntro>

      {/* Search and Category Filter Controls */}
      <div className="mt-10 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-4 h-4 w-4 text-primary-faint"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote or author..."
              aria-label="Search quotes by text or author"
              className="w-full rounded-2xl border border-outline bg-raised py-3.5 pl-11 pr-11 font-sans text-sm text-primary placeholder-primary-faint shadow-card outline-none transition-all duration-200 focus:border-gilt/60 focus:ring-1 focus:ring-gilt/60"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface text-primary-soft transition-colors duration-200 hover:bg-highlight hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gilt" strokeWidth={1.5} />
            <span className="font-sans text-xs uppercase tracking-widest2 text-primary-faint">
              Categories
            </span>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="Filter quotes by category"
          >
            {/* "All" Filter Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-xs transition-all duration-200 active:scale-95 ${
                selectedCategory === 'all'
                  ? 'border-accent bg-accent font-medium text-on-accent shadow-card'
                  : 'border-outline bg-raised text-primary-soft hover:bg-highlight hover:text-primary'
              }`}
            >
              <span>All Quotes</span>
              <span
                className={`rounded-full px-1.5 py-0.2 font-sans text-[10px] ${
                  selectedCategory === 'all'
                    ? 'bg-on-accent/15 text-on-accent'
                    : 'bg-surface text-primary-faint'
                }`}
              >
                {categoryCounts.all}
              </span>
            </button>

            {/* Individual Category Pills */}
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-xs transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'border-accent bg-accent font-medium text-on-accent shadow-card'
                      : 'border-outline bg-raised text-primary-soft hover:bg-highlight hover:text-primary'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-sans text-[10px] ${
                      isSelected
                        ? 'bg-on-accent/15 text-on-accent'
                        : 'bg-surface text-primary-faint'
                    }`}
                  >
                    {categoryCounts[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Active Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline/60 pt-4">
          <p className="font-sans text-xs tracking-wider text-primary-soft">
            Showing <span className="font-semibold text-primary">{filteredQuotes.length}</span>{' '}
            {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
            {selectedCategory !== 'all' && (
              <span>
                {' '}
                in <span className="font-medium text-gilt">{selectedCategory}</span>
              </span>
            )}
            {searchQuery.trim() && (
              <span>
                {' '}
                matching &ldquo;
                <span className="font-medium text-primary">{searchQuery.trim()}</span>
                &rdquo;
              </span>
            )}
          </p>

          {(selectedCategory !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-sans text-xs font-medium text-gilt transition-colors hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Quote Grid or Empty State */}
      {filteredQuotes.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuotes.map((quote) => (
            <LibraryQuoteCard key={quote.text} quote={quote} onToast={showToast} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-outline bg-raised p-12 text-center shadow-card sm:p-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-gilt">
            <Sparkles className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-2xl text-primary">No quotes found</h3>
          <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-primary-soft">
            {searchQuery.trim()
              ? `No quotes or authors matched "${searchQuery.trim()}". Try checking your spelling or selecting another category.`
              : 'No quotes match the selected criteria.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-xs font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-95"
          >
            Clear search & filters
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      <Toast message={toast} />
    </section>
  );
}
