export type Theme = 'light' | 'dark';

export type SectionId = 'today' | 'library' | 'favorites' | 'history' | 'settings';

export interface NavItem {
  id: SectionId;
  label: string;
  description: string;
}
