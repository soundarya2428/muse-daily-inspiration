import { NAV_ITEMS } from '@/navigation';
import type { SectionId } from '@/types';
import { motion } from 'framer-motion';
import { Sun, BookOpen, Heart, History, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV_ICONS: Record<SectionId, LucideIcon> = {
  today: Sun,
  library: BookOpen,
  favorites: Heart,
  history: History,
  settings: Settings,
};

interface BottomNavProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-outline bg-raised/90 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className="relative flex min-h-[52px] w-full flex-col items-center justify-center gap-1 px-2 pb-2.5 pt-3"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-gilt"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                {(() => {
                  const Icon = NAV_ICONS[item.id];
                  return (
                    <Icon
                      aria-hidden
                      className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-gilt' : 'text-primary-faint'
                      }`}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  );
                })()}
                <span
                  className={`font-sans text-[10px] tracking-wide transition-colors duration-200 ${
                    isActive ? 'font-medium text-primary' : 'text-primary-faint'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
