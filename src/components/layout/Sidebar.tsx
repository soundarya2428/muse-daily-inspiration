import { ThemeToggle } from '@/theme/ThemeToggle';
import { NAV_ITEMS } from '@/navigation';
import type { SectionId } from '@/types';
import { Feather } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-outline bg-raised lg:flex">
      <div className="flex flex-col gap-10 px-6 pb-8 pt-10">
        <a
          href="#today"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('today');
          }}
          className="flex items-center gap-3 px-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Feather className="h-5 w-5 text-on-accent" strokeWidth={1.5} />
          </span>
          <span className="font-display text-2xl tracking-wide text-primary">Muse</span>
        </a>

        <p className="px-2 font-quote text-lg italic leading-snug text-primary-faint">
          A little inspiration, every day.
        </p>

        <nav aria-label="Primary" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-highlight"
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-highlight"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                      isActive ? 'bg-gilt' : 'bg-blush/60'
                    }`}
                  />
                  <span
                    className={`font-sans text-sm tracking-wide transition-colors duration-200 ${
                      isActive ? 'font-medium text-primary' : 'text-primary-soft'
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-outline px-6 py-5">
        <p className="font-sans text-xs tracking-widest2 uppercase text-primary-faint">Muse</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
