import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { TodaySection } from '@/sections/TodaySection';
import { LibrarySection } from '@/sections/LibrarySection';
import { FavoritesSection } from '@/sections/FavoritesSection';
import { HistorySection } from '@/sections/HistorySection';
import { SettingsSection } from '@/sections/SettingsSection';
import { NAV_ITEMS } from '@/navigation';
import type { SectionId } from '@/types';

export function AppShell() {
  const [active, setActive] = useState<SectionId>('today');

  // Set document title on initial mount.
  useEffect(() => {
    document.title = 'Today — Muse';
  }, []);

  const handleNavigate = useCallback((id: SectionId) => {
    setActive(id);
    const item = NAV_ITEMS.find((n) => n.id === id);
    document.title = item ? `${item.label} — Muse` : 'Muse';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar active={active} onNavigate={handleNavigate} />
      <BottomNav active={active} onNavigate={handleNavigate} />

      <div className="lg:pl-64">
        <TopBar active={active} />
        <main id="main-content" className="px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pb-16">
          {active === 'today' && <TodaySection />}
          {active === 'library' && <LibrarySection />}
          {active === 'favorites' && <FavoritesSection onNavigate={handleNavigate} />}
          {active === 'history' && <HistorySection onNavigate={handleNavigate} />}
          {active === 'settings' && <SettingsSection />}
        </main>

        <footer className="hidden px-12 pb-10 lg:block">
          <p className="border-t border-outline pt-6 font-sans text-xs tracking-widest2 uppercase text-primary-faint">
            Muse — A little inspiration, every day.
          </p>
        </footer>
      </div>
    </div>
  );
}
