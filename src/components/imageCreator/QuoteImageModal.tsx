import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Edit3,
  Heart,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import {
  TEMPLATES,
  type TemplateId,
  renderQuoteToCanvas,
  downloadCanvasAsPng,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '@/imageCreator/canvasRenderer';
import { useImageCreator } from '@/imageCreator/useImageCreator';
import { useFavorites } from '@/favorites/useFavorites';
import { Toast } from '@/components/ui/Toast';

export function QuoteImageModal() {
  const { isOpen, activeQuote, closeCreator } = useImageCreator();
  const { favorites } = useFavorites();

  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCategory, setQuoteCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('editorial');
  const [selectedPaletteId, setSelectedPaletteId] = useState('parchment');
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const canvasDebounceRef = useRef<number | undefined>(undefined);
  // For focus management: remember what triggered the modal so we can restore focus on close.
  const triggerRef = useRef<Element | null>(null);
  // The dialog element itself — used to trap focus.
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg: string, duration = 2400) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  // Sync state whenever modal opens with a new quote; remember trigger element.
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    }
    if (activeQuote) {
      setQuoteText(activeQuote.text);
      setQuoteAuthor(activeQuote.author);
      setQuoteCategory(activeQuote.category);
      setIsEditing(false);
    }
  }, [isOpen, activeQuote]);

  // Move focus into the dialog when it opens; restore on close.
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus the close button (first interactive element in the dialog).
      const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
    if (!isOpen && triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Escape key dismisses the modal; Tab key is trapped within it.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCreator();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCreator]);

  const currentTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplate) ?? TEMPLATES[1];

  const currentPalette =
    currentTemplate.palettes.find((p) => p.id === selectedPaletteId) ??
    currentTemplate.palettes[0];

  // Debounced canvas re-render: waits 150ms after the last change before drawing,
  // preventing excessive redraws on rapid keystroke input.
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;

    window.clearTimeout(canvasDebounceRef.current);
    canvasDebounceRef.current = window.setTimeout(() => {
      renderQuoteToCanvas(canvas, {
        quote: {
          text: quoteText || 'Words that inspire the mind.',
          author: quoteAuthor || 'Author',
          category: (quoteCategory as never) || 'Life',
        },
        templateId: selectedTemplate,
        palette: currentPalette,
      });
    }, 150);

    return () => window.clearTimeout(canvasDebounceRef.current);
  }, [isOpen, quoteText, quoteAuthor, quoteCategory, selectedTemplate, currentPalette]);

  const handleTemplateChange = useCallback((templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template && template.palettes.length > 0) {
      setSelectedPaletteId(template.palettes[0].id);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);

    try {
      const sanitizedAuthor = (quoteAuthor || 'muse')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `muse-${sanitizedAuthor}-${Date.now()}.png`;

      const success = await downloadCanvasAsPng(canvasRef.current, filename);
      if (success) {
        showToast('Image downloaded! (1080 × 1350 PNG)');
      } else {
        showToast('Could not download image. Please try again.');
      }
    } catch {
      showToast('An error occurred during export.');
    } finally {
      setIsDownloading(false);
    }
  }, [quoteAuthor, showToast]);

  const handleSelectFavorite = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedText = e.target.value;
      const found = favorites.find((f) => f.text === selectedText);
      if (found) {
        setQuoteText(found.text);
        setQuoteAuthor(found.author);
        setQuoteCategory(found.category);
      }
    },
    [favorites]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCreator}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-creator-title"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-outline bg-raised shadow-card-lifted"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-highlight text-gilt">
                  <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 id="image-creator-title" className="font-display text-lg text-primary sm:text-xl">
                    Quote Image Creator
                  </h3>
                  <p className="font-sans text-[11px] uppercase tracking-wider text-primary-faint">
                    Export 1080 × 1350 PNG
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCreator}
                aria-label="Close Image Creator"
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary-soft transition-colors hover:bg-highlight hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gilt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body: Left Preview, Right Customization */}
            <div className="grid flex-1 grid-cols-1 overflow-y-auto p-6 md:grid-cols-2 md:gap-8 md:p-8">
              {/* Left Column: Live Canvas Preview */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-2xl border border-outline/70 bg-surface shadow-card sm:max-w-[380px]">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="mt-3 font-sans text-[11px] text-primary-faint">
                  Standard 4:5 portrait ratio &bull; Crystal-clear high resolution
                </p>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="mt-6 flex flex-col gap-6 md:mt-0">
                {/* Optional Quote Switcher from Favorites */}
                {favorites.length > 0 && (
                  <div className="rounded-2xl border border-outline/70 bg-surface p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-primary-faint">
                      <Heart className="h-3.5 w-3.5 text-blush" strokeWidth={1.5} />
                      <span className="font-sans uppercase tracking-wider">
                        Or choose from Favorites
                      </span>
                    </div>
                    <select
                      aria-label="Choose a quote from your Favorites"
                      onChange={handleSelectFavorite}
                      className="mt-2 w-full truncate rounded-xl border border-outline bg-raised px-3 py-2 font-sans text-xs text-primary outline-none focus:border-gilt/60"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a saved quote ({favorites.length} available)...
                      </option>
                      {favorites.map((f) => (
                        <option key={f.text} value={f.text}>
                          &ldquo;{f.text.slice(0, 45)}...&rdquo; — {f.author}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Template Selector */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest2 text-primary-faint">
                    1. Select Design Template
                  </label>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {TEMPLATES.map((tmpl) => {
                      const isSelected = selectedTemplate === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleTemplateChange(tmpl.id)}
                          aria-pressed={isSelected}
                          className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gilt ${
                            isSelected
                              ? 'border-accent bg-accent font-medium text-on-accent shadow-card'
                              : 'border-outline bg-surface text-primary hover:bg-highlight'
                          }`}
                        >
                          <span className="font-sans text-xs font-semibold">{tmpl.name}</span>
                          <span
                            className={`mt-1 line-clamp-1 font-sans text-[10px] ${
                              isSelected ? 'text-on-accent/80' : 'text-primary-faint'
                            }`}
                          >
                            {tmpl.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest2 text-primary-faint">
                    2. Background Palette
                  </label>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    {currentTemplate.palettes.map((palette) => {
                      const isSelected = selectedPaletteId === palette.id;
                      return (
                        <button
                          key={palette.id}
                          type="button"
                          onClick={() => setSelectedPaletteId(palette.id)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gilt ${
                            isSelected
                              ? 'border-gilt/80 bg-highlight shadow-sm ring-1 ring-gilt/50'
                              : 'border-outline bg-surface hover:bg-highlight'
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-inner"
                            style={{ backgroundColor: palette.bg }}
                          />
                          <span className="font-sans text-xs font-medium text-primary">
                            {palette.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Edit Quote Content Toggle */}
                <div className="rounded-2xl border border-outline/70 bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs uppercase tracking-widest2 text-primary-faint">
                      3. Quote Text &amp; Author
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing((prev) => !prev)}
                      className="inline-flex items-center gap-1 font-sans text-xs text-gilt hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gilt"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="font-sans text-[11px] text-primary-faint">Quote</label>
                        <textarea
                          rows={3}
                          value={quoteText}
                          onChange={(e) => setQuoteText(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-outline bg-raised p-2.5 font-sans text-xs text-primary outline-none focus:border-gilt/60"
                          placeholder="Enter quote text..."
                        />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] text-primary-faint">Author</label>
                        <input
                          type="text"
                          value={quoteAuthor}
                          onChange={(e) => setQuoteAuthor(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-outline bg-raised p-2 font-sans text-xs text-primary outline-none focus:border-gilt/60"
                          placeholder="Author name..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-left">
                      <p className="line-clamp-2 font-quote text-sm italic text-primary">
                        &ldquo;{quoteText}&rdquo;
                      </p>
                      <p className="mt-1 font-sans text-[11px] text-primary-soft">
                        — {quoteAuthor}
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-sans text-sm font-medium text-on-accent transition-transform duration-200 hover:opacity-90 active:scale-98 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gilt"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Preparing Download...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download High-Res PNG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feedback Toast */}
          <Toast message={toast} />
        </div>
      )}
    </AnimatePresence>
  );
}
