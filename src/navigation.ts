import type { SectionId, NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Today', description: 'Your daily inspiration' },
  { id: 'library', label: 'Library', description: 'Browse the collection' },
  { id: 'favorites', label: 'Favorites', description: 'Quotes you have saved' },
  { id: 'history', label: 'History', description: 'Quotes you have viewed' },
  { id: 'settings', label: 'Settings', description: 'Appearance and preferences' },
];

export function getNavItem(id: SectionId): NavItem {
  return NAV_ITEMS.find((item) => item.id === id) ?? NAV_ITEMS[0];
}
