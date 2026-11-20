import { dayKey } from '@/quotes/engine';
import type { StreakData } from '@/streak/useStreak';

export function getDayDifference(prevDateStr: string, currentDateStr: string): number {
  const [y1, m1, d1] = prevDateStr.split('-').map(Number);
  const [y2, m2, d2] = currentDateStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffMs = date2.getTime() - date1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateUpdatedStreak(
  current: StreakData,
  todayStr: string = dayKey(new Date())
): { updated: boolean; data: StreakData } {
  // If already recorded today, no change
  if (current.lastActiveDate === todayStr) {
    return { updated: false, data: current };
  }

  // First time visitor
  if (!current.lastActiveDate) {
    const newData: StreakData = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: todayStr,
      totalActiveDays: 1,
    };
    return { updated: true, data: newData };
  }

  const diff = getDayDifference(current.lastActiveDate, todayStr);

  // Same day check
  if (diff === 0) {
    return { updated: false, data: current };
  }

  // Consecutive day
  if (diff === 1) {
    const nextCurrent = current.currentStreak + 1;
    const nextLongest = Math.max(current.longestStreak, nextCurrent);
    const newData: StreakData = {
      currentStreak: nextCurrent,
      longestStreak: nextLongest,
      lastActiveDate: todayStr,
      totalActiveDays: current.totalActiveDays + 1,
    };
    return { updated: true, data: newData };
  }

  // Missed 1 or more days -> reset current streak to 1
  if (diff > 1) {
    const nextCurrent = 1;
    const newData: StreakData = {
      currentStreak: nextCurrent,
      longestStreak: Math.max(current.longestStreak, nextCurrent),
      lastActiveDate: todayStr,
      totalActiveDays: current.totalActiveDays + 1,
    };
    return { updated: true, data: newData };
  }

  // If clock moved backwards, do not alter
  return { updated: false, data: current };
}
