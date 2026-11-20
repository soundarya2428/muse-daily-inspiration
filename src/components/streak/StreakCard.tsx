import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Flame, Trophy } from 'lucide-react';
import { useStreak } from '@/streak/useStreak';

export function StreakCard() {
  const { currentStreak, longestStreak, totalActiveDays, message } = useStreak();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <article
      aria-label="Daily Activity Streak"
      className="group relative overflow-hidden rounded-3xl border border-outline bg-raised p-6 shadow-card transition-all duration-300 hover:border-gilt/40 hover:shadow-card-lifted sm:p-7"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Flame Icon, Headline and Reflective Message */}
        <div className="flex items-start gap-4 sm:gap-5">
          <motion.div
            initial={reducedMotion ? { scale: 1 } : { scale: 0.9, opacity: 0 }}
            animate={reducedMotion ? { scale: 1 } : { scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-outline bg-highlight text-gilt shadow-sm sm:h-14 sm:w-14"
          >
            <Flame
              className="h-6 w-6 fill-gilt/20 text-gilt transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7"
              strokeWidth={1.75}
            />
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] uppercase tracking-widest2 text-gilt">
                Daily Ritual
              </span>
              <span className="h-1 w-1 rounded-full bg-gilt/60" />
              <span className="font-sans text-[11px] uppercase tracking-widest2 text-primary-faint">
                Activity
              </span>
            </div>

            <h3 className="mt-1 font-display text-2xl leading-tight text-primary sm:text-3xl">
              {currentStreak} {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </h3>

            <p className="mt-1.5 max-w-xl font-sans text-xs leading-relaxed text-primary-soft sm:text-sm">
              {message}
            </p>
          </div>
        </div>

        {/* Right: Quick Streak Metrics */}
        <div className="flex items-center gap-3 border-t border-outline/60 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          {/* Best Streak */}
          <div className="flex-1 rounded-2xl border border-outline/70 bg-surface px-4 py-3 text-left transition-colors sm:min-w-[105px]">
            <div className="flex items-center gap-1.5 text-primary-faint">
              <Trophy className="h-3.5 w-3.5 text-gilt" strokeWidth={1.5} />
              <span className="font-sans text-[10px] uppercase tracking-wider">Best</span>
            </div>
            <p className="mt-1 font-sans text-base font-semibold text-primary sm:text-lg">
              {longestStreak} <span className="text-xs font-normal text-primary-faint">days</span>
            </p>
          </div>

          {/* Total Days */}
          <div className="flex-1 rounded-2xl border border-outline/70 bg-surface px-4 py-3 text-left transition-colors sm:min-w-[105px]">
            <div className="flex items-center gap-1.5 text-primary-faint">
              <Calendar className="h-3.5 w-3.5 text-gilt" strokeWidth={1.5} />
              <span className="font-sans text-[10px] uppercase tracking-wider">Total</span>
            </div>
            <p className="mt-1 font-sans text-base font-semibold text-primary sm:text-lg">
              {totalActiveDays} <span className="text-xs font-normal text-primary-faint">days</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
