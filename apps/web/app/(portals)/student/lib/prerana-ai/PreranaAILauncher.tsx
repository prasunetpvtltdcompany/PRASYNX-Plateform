'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreranaAIStore } from './store';
import PreranaAIPanel from './PreranaAIPanel';

function Sparkle({ delay }: { delay: number }) {
  const x = (Math.random() - 0.5) * 100;
  const y = -(Math.random() * 80 + 30);

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-purple-300 pointer-events-none"
      style={{ left: '50%', top: '50%' }}
      animate={{
        x: [0, x, x * 0.5],
        y: [0, y, y * 0.6],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

export default function PreranaAILauncher({ role }: { role?: string }) {
  const { isOpen, setOpen, badgeCount, setRole, notifications } = usePreranaAIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (role) setRole(role as any);
  }, [role]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isOpen) return <PreranaAIPanel />;

  const hasNotifs = badgeCount > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div className="relative flex flex-col items-center">

        {/* Glow aura */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'clamp(90px, 18vw, 170px)',
            height: 'clamp(90px, 18vw, 170px)',
            background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(139,92,246,0.07) 40%, transparent 65%)',
            filter: 'blur(22px)',
            top: 'calc(50% - 5px)',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: isHovered ? 1.5 : [1, 1.05, 1],
            opacity: isHovered ? 1 : [0.5, 0.65, 0.5],
          }}
          transition={{
            scale: isHovered
              ? { duration: 0.5, ease: 'easeOut' }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            opacity: isHovered
              ? { duration: 0.4 }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Sparkle particles */}
        {!isScrolled && [...Array(5)].map((_, i) => (
          <Sparkle key={i} delay={i * 0.5} />
        ))}

        {/* Notification badge */}
        <AnimatePresence>
          {hasNotifs && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: 1,
              }}
              transition={{
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 z-10"
            >
              <div className="relative w-[12px] h-[12px] rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-red-400/60"
                />
              </div>
              {badgeCount > 1 && (
                <div className="absolute -top-2.5 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 border-[1.5px] border-white flex items-center justify-center text-[8px] font-bold text-white shadow-md shadow-red-500/30">
                  {badgeCount}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main character button */}
        <motion.button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative block cursor-pointer focus:outline-none pointer-events-auto"
          style={{
            width: 'clamp(56px, 12.8vw, 96px)',
            height: 'clamp(56px, 12.8vw, 96px)',
          }}
          animate={{
            y: isScrolled ? 0 : [0, -6, 0],
            scale: isHovered ? 1.12 : 1,
            rotate: isHovered ? [0, -3, 3, 0] : 0,
          }}
          transition={{
            y: isScrolled
              ? { duration: 0.3 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            scale: { type: 'spring', stiffness: 400, damping: 17 },
            rotate: { duration: 0.4 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Ambient inner pulse glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none bg-purple-500/10 blur-[10px]"
            animate={{
              scale: [0.95, 1.15, 0.95],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <img
            src="/prerana-ai.png"
            alt="Prerana AI"
            className="w-full h-full object-contain pointer-events-none select-none relative z-[1]"
            style={{
              filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.12))${isHovered ? ' drop-shadow(0 0 22px rgba(124,58,237,0.35))' : ''}`,
              transition: 'filter 0.4s ease',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </motion.button>


      </div>
    </div>
  );
}
