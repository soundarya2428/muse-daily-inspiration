import { useState, useCallback, useRef, useEffect } from 'react';
import { History, Sparkles, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionIntro } from '@/sections/SectionIntro';
import { HistoryQuoteCard } from '@/components/quotes/HistoryQuoteCard';
import { Toast } from '@/components/ui/Toast';
import { useHistory } from '@/history/useHistory';
import type { SectionId } from '@/types';

type ButtonElement = HTMLButtonElement | null;

interface HistorySectionProps {
  onNavigate?: (id: SectionId) => void;
}

export function HistorySection({ onNavigate }: HistorySectionProps) {
  const { history, clearHistory } = useHistory();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  // Ref for the "Clear History" trigger button — focus is restored here when dialog closes.
  const clearTriggerRef = useRef<ButtonElement>(null);
  // Ref for the Cancel button inside the dialog — receives focus when dialog opens.
  const cancelBtnRef = useRef<ButtonElement>(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Move focus into dialog when it opens; restore to trigger when it closes.
  useEffect(() => {
    if (showConfirmClear) {
      cancelBtnRef.current?.focus();
    } else {
      clearTriggerRef.current?.focus();
    }
  }, [showConfirmClear]);

  // Escape key dismisses the confirmation dialog.
  useEffect(() => {
    if (!showConfirmClear) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowConfirmClear(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showConfirmClear]);

  const showToast = useCallback((message: string, duration = 2400) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const handleConfirmClear = useCallback(() => {
    clearHistory();
    setShowConfirmClear(false);
    showToast('Quote history cleared.');
  }, [clearHistory, showToast]);

  return (
    <section aria-label="Quote History">
      <SectionIntro eyebrow="Timeline" title="Quotes you have walked with">
        A chronological memory of words you have reflected upon through your daily visits and
        mood reflections.
      </SectionIntro>

      {history.length > 0 ? (
        <div className="mt-10 space-y-6">
          {/* Header Bar with Counter and Clear History Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline/60 pb-4">
            <p className="font-sans text-xs tracking-wider text-primary-soft">
              Remembered <span className="font-semibold text-primary">{history.length}</span>{' '}
              {history.length === 1 ? 'quote' : 'quotes'}
              {history.length >= 100 && (
                <span className="text-primary-faint"> (most recent 100)</span>
              )}
            </p>

            <button
              ref={clearTriggerRef}
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 font-sans text-xs font-medium text-primary-soft transition-colors duration-200 hover:border-blush hover:bg-highlight hover:text-primary active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Clear History</span>
            </button>
          </div>

          {/* History Quotes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {history.map((entry) => (
              <HistoryQuoteCard key={entry.id} entry={entry} onToast={showToast} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-outline bg-raised p-12 text-center shadow-card sm:p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-highlight text-gilt">
            <History className="h-7 w-7 text-gilt" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-2xl text-primary">No history yet</h3>
          <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-primary-soft">
            Quotes you reflect upon in Today or through Mood-to-Muse will be remembered here,
            creating a personal timeline of words that found you.
          </p>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('today')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-xs font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Today&apos;s Inspiration
            </button>
          )}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmClear(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="clear-history-title"
              aria-describedby="clear-history-desc"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-3xl border border-outline bg-raised p-6 shadow-card-lifted sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-highlight text-blush">
                  <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  aria-label="Cancel"
                  className="rounded-full p-1 text-primary-soft hover:bg-highlight hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 id="clear-history-title" className="mt-4 font-display text-xl text-primary">
                Clear Quote History?
              </h4>
              <p
                id="clear-history-desc"
                className="mt-2 font-sans text-sm leading-relaxed text-primary-soft"
              >
                This will clear your timeline of previously viewed quotes. Your saved Favorites and
                the quote collection will remain untouched.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="rounded-full border border-outline bg-surface px-4 py-2 font-sans text-xs font-medium text-primary transition-colors hover:bg-highlight"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="rounded-full bg-accent px-4 py-2 font-sans text-xs font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-95"
                >
                  Yes, Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action feedback toast */}
      <Toast message={toast} />
    </section>
  );
}
