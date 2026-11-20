import { createContext, useContext } from 'react';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // 'YYYY-MM-DD'
  totalActiveDays: number;
}

export interface StreakContextValue extends StreakData {
  isNewUser: boolean;
  message: string;
}

export function getStreakMessage(currentStreak: number, isNewUser: boolean): string {
  if (isNewUser || currentStreak <= 1) {
    return 'Your daily ritual begins today. Return tomorrow to build your streak.';
  }
  if (currentStreak === 2) {
    return 'Two days in a row. A mindful habit is beginning to take shape.';
  }
  if (currentStreak < 7) {
    return `${currentStreak} days of reflection. Every day brings a fresh perspective.`;
  }
  if (currentStreak === 7) {
    return 'A full week of inspiration. Your commitment to growth is shining.';
  }
  if (currentStreak < 30) {
    return `${currentStreak} consecutive days. Your daily pause has become second nature.`;
  }
  return `${currentStreak} days strong. A remarkable testament to intentional living.`;
}

export const StreakContext = createContext<StreakContextValue | null>(null);

export function useStreak(): StreakContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) {
    throw new Error('useStreak must be used within StreakProvider');
  }
  return ctx;
}
