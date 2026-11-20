import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRef } from 'react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  // A monotonic counter used as the Framer Motion key so that every new toast
  // message — including one identical to the previous — triggers a fresh
  // enter/exit animation cycle.
  //
  // Why not key={message}?  If the parent shows the same string twice in a row
  // without a null in between, the key would not change and the animation would
  // be silently skipped.
  //
  // The counter is stored in a ref (not state) so that incrementing it during
  // the render phase never causes an extra re-render.  We update it whenever
  // `message` becomes non-null for the first time, or transitions from one
  // non-null string to a *different* non-null string.  Those are the only
  // moments when AnimatePresence needs to see a new key.
  //
  // Note: if the parent fires setToast("same string") while "same string" is
  // still displayed, React batches the update as a no-op (identical state →
  // no re-render), so the component never even executes — there is nothing to
  // fix in that sub-case at this layer.
  const generationRef = useRef(0);
  const prevMessageRef = useRef<string | null>(null);

  if (message !== null && message !== prevMessageRef.current) {
    // Transitioning into a new visible toast → advance the generation so
    // AnimatePresence unmounts the old child and mounts a fresh one.
    generationRef.current += 1;
  }
  // Always keep prevMessageRef in sync with what we rendered last.
  prevMessageRef.current = message;

  const toastKey = generationRef.current;

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-10">
      <AnimatePresence>
        {message && (
          <motion.div
            key={toastKey}
            role="status"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2.5 rounded-full border border-outline bg-raised px-5 py-2.5 shadow-card-lifted"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gilt/15">
              <Check className="h-3 w-3 text-gilt" strokeWidth={2.5} />
            </span>
            <span className="font-sans text-sm text-primary">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
