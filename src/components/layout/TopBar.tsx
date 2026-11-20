import type { SectionId } from '@/types';
import { ThemeToggle } from '@/theme/ThemeToggle';
import { getNavItem } from '@/navigation';

interface TopBarProps {
  active: SectionId;
}

export function TopBar({ active }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-outline bg-surface/85 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-12">
      <div>
        <p className="font-sans text-[11px] uppercase tracking-widest2 text-primary-faint">Muse</p>
        <h1 className="font-display text-xl text-primary">{getNavItem(active).label}</h1>
      </div>
      <div className="lg:hidden">
        <ThemeToggle />
      </div>
    </header>
  );
}
