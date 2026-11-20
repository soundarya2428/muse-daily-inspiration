import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Quote } from '@/quotes/data';
import { dailyQuote, randomQuote } from '@/quotes/engine';

export interface UseQuoteOfTheDay {
  quote: Quote;
  isNew: boolean;
  history: Quote[];
  showText: boolean;
  toggleText: () => void;
  nextQuote: () => void;
  previousQuote: () => void;
  canGoBack: boolean;
}

/**
 * Quote of the day: deterministic per calendar day, kept stable across renders
 * and reloads. "New quote" draws a random quote that differs from the current
 * one; every quote shown is kept in a history stack for "previous".
 */
export function useQuoteOfTheDay(): UseQuoteOfTheDay {
  const [dayQuote, setDayQuote] = useState<Quote>(() => dailyQuote());
  const [userQuote, setUserQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<Quote[]>([]);
  const [showText, setShowText] = useState(true);

  // FIX C-2: holds the ID of whatever midnight timeout is currently scheduled
  // so the cleanup function can always cancel the *latest* one, not just the
  // first one created before any recursive calls ran.
  const midnightTimerRef = useRef<number | undefined>(undefined);

  // Re-checks once per hour (and via the midnight timer below) so the quote
  // rolls over even if the timer was throttled by the browser.
  useEffect(() => {
    function rolloverIfNewDay() {
      if (dailyQuote().text !== dayQuote.text) {
        setDayQuote(dailyQuote());
        setUserQuote(null);
        setHistory([]);
      }
    }
    const interval = window.setInterval(rolloverIfNewDay, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [dayQuote.text]);

  // A one-shot timer moves to the new day's quote right at midnight.
  // FIX C-2: Every call to schedule() — including the recursive one fired
  // from inside the timeout callback — writes its new ID into midnightTimerRef.
  // The cleanup function reads from that same ref, so it always clears the
  // *most recently registered* timeout regardless of how many recursions have
  // occurred.  This prevents zombie timers from surviving an unmount.
  useEffect(() => {
    function schedule() {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const timeout = next.getTime() - now.getTime();
      midnightTimerRef.current = window.setTimeout(() => {
        setDayQuote(dailyQuote());
        setUserQuote(null);
        setHistory([]);
        schedule(); // reschedule for the *next* midnight; ref is updated above
      }, timeout + 1000); // 1 s grace so the new day has definitely begun
    }
    schedule();
    return () => window.clearTimeout(midnightTimerRef.current);
  }, []);

  const quote = userQuote ?? dayQuote;
  const isNew = userQuote !== null;

  const nextQuote = useCallback(() => {
    const shown = userQuote ?? dayQuote;
    const next = randomQuote(shown.text);
    setHistory((h) => [...h, shown]);
    setUserQuote(next);
  }, [userQuote, dayQuote]);

  const previousQuote = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    // FIX C-3: if the quote we're returning to is the original daily quote,
    // clear userQuote back to null so isNew becomes false and the UI
    // correctly shows the date-based label instead of "Fresh Perspective".
    setUserQuote(prev.text === dayQuote.text ? null : prev);
  }, [history, dayQuote.text]);

  const toggleText = useCallback(() => setShowText((s) => !s), []);

  return useMemo(
    () => ({
      quote,
      isNew,
      history,
      showText,
      toggleText,
      nextQuote,
      previousQuote,
      canGoBack: history.length > 0,
    }),
    [quote, isNew, history, showText, toggleText, nextQuote, previousQuote]
  );
}
