import { useEffect } from 'react';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { MoodToMuse } from '@/components/mood/MoodToMuse';
import { StreakCard } from '@/components/streak/StreakCard';
import { useQuoteOfTheDay } from '@/quotes/useQuoteOfTheDay';
import { useHistory } from '@/history/useHistory';

export function TodaySection() {
  const { quote, isNew, showText, toggleText, nextQuote, previousQuote, canGoBack } =
    useQuoteOfTheDay();
  const { recordView } = useHistory();

  useEffect(() => {
    if (quote) {
      recordView(quote, 'today');
    }
  }, [quote, recordView]);

  const greeting = isNew
    ? 'A thought for this moment'
    : 'Your quote for today';

  return (
    <section aria-label="Today">
      <div className="max-w-2xl">
        <p className="font-sans text-xs uppercase tracking-widest2 text-gilt">
          {isNew ? 'Fresh Perspective' : formatToday()}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-primary sm:text-4xl">
          {greeting}
        </h2>
        <p className="mt-4 font-sans text-base leading-relaxed text-primary-soft">
          {isNew
            ? 'Drawn at random from the collection — something new to sit with.'
            : 'One quote, chosen for today. Return tomorrow for a new one.'}
        </p>
      </div>

      <div className="mt-8">
        <StreakCard />
      </div>

      <QuoteCard
        quote={quote}
        showText={showText}
        onToggleText={toggleText}
        onNewQuote={nextQuote}
        onPreviousQuote={previousQuote}
        canGoBack={canGoBack}
      />

      <div className="mt-16 border-t border-outline/70 pt-12 sm:mt-20 sm:pt-16">
        <MoodToMuse />
      </div>
    </section>
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
