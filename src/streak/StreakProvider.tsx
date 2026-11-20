import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  StreakContext,
  type StreakData,
  getStreakMessage,
} from '@/streak/useStreak';
import { calculateUpdatedStreak } from '@/streak/streakLogic';
import { dayKey } from '@/quotes/engine';

const STORAGE_KEY = 'muse-streak';

function isValidStreakData(item: unknown): item is StreakData {
  if (typeof item !== 'object' || item === null) return false;
  const s = item as StreakData;
  return (
    typeof s.currentStreak === 'number' &&
    s.currentStreak >= 0 &&
    typeof s.longestStreak === 'number' &&
    s.longestStreak >= 0 &&
    typeof s.totalActiveDays === 'number' &&
    s.totalActiveDays >= 0 &&
    (s.lastActiveDate === null || typeof s.lastActiveDate === 'string')
  );
}

function getInitialStreak(): StreakData {
  const defaultData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalActiveDays: 0,
  };
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    if (isValidStreakData(parsed)) return parsed;
  } catch {
    // Corrupted data fallback
  }
  return defaultData;
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState<StreakData>(getInitialStreak);
  const evaluatedDateRef = useRef<string | null>(null);

  const applyTodayVisit = useCallback(() => {
    const today = dayKey(new Date());
    if (evaluatedDateRef.current === today) return;
    evaluatedDateRef.current = today;

    setStreak((prev) => {
      const { updated, data } = calculateUpdatedStreak(prev, today);
      if (updated) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Storage blocked or full
        }
        return data;
      }
      return prev;
    });
  }, []);

  // Record active visit on initial mount
  useEffect(() => {
    applyTodayVisit();
  }, [applyTodayVisit]);

  // Handle midnight rollover and tab returning to foreground
  useEffect(() => {
    function checkRollover() {
      const today = dayKey(new Date());
      if (evaluatedDateRef.current !== today) {
        applyTodayVisit();
      }
    }

    const interval = window.setInterval(checkRollover, 60 * 60 * 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkRollover();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [applyTodayVisit]);

  // Multi-tab synchronization
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isValidStreakData(parsed)) {
            setStreak(parsed);
          }
        } catch {
          // Ignored
        }
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isNewUser = streak.totalActiveDays <= 1 && streak.longestStreak <= 1;
  const message = getStreakMessage(streak.currentStreak, isNewUser);

  return (
    <StreakContext.Provider
      value={{
        ...streak,
        isNewUser,
        message,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}
