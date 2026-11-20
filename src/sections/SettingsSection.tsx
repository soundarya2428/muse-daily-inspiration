import { useTheme } from '@/theme/ThemeProvider';
import { SectionIntro } from '@/sections/SectionIntro';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export function SettingsSection() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section aria-label="Settings">
      <SectionIntro eyebrow="Preferences" title="Make Muse yours">
        Choose how Muse looks and feels. Your preferences are remembered on this device.
      </SectionIntro>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        className="mt-12 max-w-xl rounded-3xl border border-outline bg-raised p-8 shadow-card"
      >
        <h3 className="font-display text-xl text-primary">Appearance</h3>
        <p className="mt-2 font-sans text-sm leading-relaxed text-primary-soft">
          Switch between the warm ivory light theme and the deep plum dark theme.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label="Theme">
          <button
            type="button"
            onClick={() => isDark && toggleTheme()}
            aria-pressed={!isDark}
            className={`flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200 ${
              !isDark
                ? 'border-gilt/60 bg-highlight shadow-card'
                : 'border-outline bg-surface hover:bg-highlight'
            }`}
          >
            <Sun className="h-5 w-5 text-gilt" strokeWidth={1.5} />
            <span className="font-sans text-sm font-medium text-primary">Light</span>
            <span className="font-sans text-xs leading-relaxed text-primary-faint">
              Warm ivory, like morning paper
            </span>
          </button>

          <button
            type="button"
            onClick={() => !isDark && toggleTheme()}
            aria-pressed={isDark}
            className={`flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200 ${
              isDark
                ? 'border-gilt/60 bg-highlight shadow-card'
                : 'border-outline bg-surface hover:bg-highlight'
            }`}
          >
            <Moon className="h-5 w-5 text-haze" strokeWidth={1.5} />
            <span className="font-sans text-sm font-medium text-primary">Dark</span>
            <span className="font-sans text-xs leading-relaxed text-primary-faint">
              Deep plum, for evening reading
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
