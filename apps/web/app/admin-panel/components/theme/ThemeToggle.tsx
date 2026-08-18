'use client';

import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useAdminTheme } from './useAdminTheme';

export default function ThemeToggle() {
  const { dark, toggle } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      className="group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full outline-none transition-all duration-300 hover:scale-110 hover:shadow-[0_0_18px_rgba(109,76,255,0.45)] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#6D4CFF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1220]"
      style={{
        background: dark ? 'linear-gradient(135deg, #6D4CFF, #8B5CF6)' : '#E2E8F0',
        boxShadow: dark ? '0 0 14px rgba(109,76,255,0.45)' : 'inset 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      {/* Faint icons on the track */}
      <Sun
        size={9}
        className="absolute left-1 text-white/40 transition-opacity duration-300"
        style={{ opacity: dark ? 0.35 : 0 }}
      />
      <Moon
        size={9}
        className="absolute right-1 text-white/60 transition-opacity duration-300"
        style={{ opacity: dark ? 0 : 0.4 }}
      />

      <motion.span
        className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
        animate={{ left: dark ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 550, damping: 32 }}
      >
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ rotate: -100, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center"
        >
          {dark ? <Moon size={10} className="text-[#6D4CFF]" /> : <Sun size={10} className="text-amber-500" />}
        </motion.span>
      </motion.span>
    </button>
  );
}