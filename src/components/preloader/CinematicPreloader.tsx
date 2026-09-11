/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface CinematicPreloaderProps {
  onComplete: () => void;
  onHandoffStart?: () => void;
}

/**
 * Minimalist Smooth "X" Intro:
 * 1. The iconic NEXUS "X" fades in smoothly.
 * 2. Brief hold.
 * 3. Fades away smoothly, revealing the entire website normally.
 */
export const CinematicPreloader: React.FC<CinematicPreloaderProps> = ({
  onComplete,
  onHandoffStart,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('in');

  useEffect(() => {
    if (shouldReduceMotion) {
      onHandoffStart?.();
      onComplete();
      setPhase('done');
      return;
    }

    // 1. Fade in X (0 -> 500ms)
    // 2. Hold (500ms -> 950ms)
    // 3. Fade out X & background (950ms -> 1400ms)
    const tHold = setTimeout(() => {
      setPhase('hold');
    }, 500);

    const tOut = setTimeout(() => {
      setPhase('out');
      onHandoffStart?.();
    }, 950);

    const tDone = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1400);

    return () => {
      clearTimeout(tHold);
      clearTimeout(tOut);
      clearTimeout(tDone);
    };
  }, [shouldReduceMotion, onComplete, onHandoffStart]);

  if (phase === 'done') return null;

  const isExiting = phase === 'out';

  return (
    <div
      id="nexus-preloader"
      role="status"
      aria-label="Loading NEXUS"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#F3EEE5] select-none transition-opacity duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        opacity: isExiting ? 0 : 1,
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 0.98 }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: isExiting ? 0.45 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 aspect-square"
      >
        <img
          src="/NEXUS-removebg-preview-1.png"
          alt="NEXUS X"
          className="w-full h-full object-contain pointer-events-none select-none"
          loading="eager"
          decoding="async"
        />
      </motion.div>
    </div>
  );
};
