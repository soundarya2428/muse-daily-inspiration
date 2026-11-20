import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <motion.div {...fadeUp} className="max-w-2xl">
      <p className="font-sans text-xs uppercase tracking-widest2 text-gilt">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-primary sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 font-sans text-base leading-relaxed text-primary-soft">{children}</p>}
    </motion.div>
  );
}
