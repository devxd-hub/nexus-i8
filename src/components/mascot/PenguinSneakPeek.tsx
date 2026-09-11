/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NexusPenguinSprite } from './NexusPenguinSprite.tsx';
import { PenguinFrameKey } from './penguinData.ts';

interface SneakPeekState {
  active: boolean;
  position: 'bottom-right' | 'bottom-left' | 'right-edge';
  frame: PenguinFrameKey;
  step: 'entering' | 'looking' | 'interacting' | 'retreating';
}

const SESSION_KEY = 'nexus_penguin_sightings';
const MAX_SIGHTINGS_PER_SESSION = 3;

export const PenguinSneakPeek: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [peekState, setPeekState] = useState<SneakPeekState | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const lastScrollY = useRef(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const getSightingsCount = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const incrementSightingsCount = () => {
    if (typeof window === 'undefined') return;
    try {
      const current = getSightingsCount();
      sessionStorage.setItem(SESSION_KEY, String(current + 1));
    } catch {
      // Ignore
    }
  };

  const triggerSneakPeek = useCallback(() => {
    const sightings = getSightingsCount();
    if (sightings >= MAX_SIGHTINGS_PER_SESSION) return;

    const positions: Array<'bottom-right' | 'bottom-left' | 'right-edge'> = [
      'bottom-right',
      'bottom-left',
      'right-edge',
    ];
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    const isBottom = randomPos.startsWith('bottom');

    const initialFrame: PenguinFrameKey = isBottom ? 'peek_bottom' : 'peek_right';

    setPeekState({
      active: true,
      position: randomPos,
      frame: initialFrame,
      step: 'entering',
    });

    incrementSightingsCount();

    // 1. Enter (450ms)
    const t1 = setTimeout(() => {
      setPeekState((prev) => {
        if (!prev) return null;
        const lookFrame: PenguinFrameKey = randomPos === 'bottom-left' ? 'look_right' : 'look_left';
        return { ...prev, frame: lookFrame, step: 'looking' };
      });
    }, 450);

    // 2. Curious micro-action
    const t2 = setTimeout(() => {
      setPeekState((prev) => {
        if (!prev) return null;
        const actions: PenguinFrameKey[] = ['curious', 'wave', 'blink', 'look_left', 'look_right'];
        const chosenAction = actions[Math.floor(Math.random() * actions.length)];
        return { ...prev, frame: chosenAction, step: 'interacting' };
      });
    }, 1000);

    // 3. Prepare retreat
    const t3 = setTimeout(() => {
      setPeekState((prev) => {
        if (!prev) return null;
        return { ...prev, frame: initialFrame, step: 'retreating' };
      });
    }, 1650);

    // 4. Complete exit
    const t4 = setTimeout(() => {
      setPeekState(null);
    }, 2200);

    timeoutsRef.current.push(t1, t2, t3, t4);
  }, []);

  // Handle scroll dismiss
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;

      if (diff > 25 && peekState?.active) {
        setPeekState(null);
        clearAllTimeouts();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [peekState, clearAllTimeouts]);

  // Initial schedule logic
  useEffect(() => {
    const count = getSightingsCount();
    if (count >= MAX_SIGHTINGS_PER_SESSION) return;

    const firstDelay = count === 0 ? 12000 + Math.random() * 8000 : 35000 + Math.random() * 25000;

    const timer = setTimeout(() => {
      triggerSneakPeek();
    }, firstDelay);

    timeoutsRef.current.push(timer);

    return () => {
      clearAllTimeouts();
    };
  }, [triggerSneakPeek, clearAllTimeouts]);

  if (!peekState) return null;

  const getPositionStyles = () => {
    switch (peekState.position) {
      case 'bottom-right':
        return {
          containerClass: 'fixed bottom-0 right-6 sm:right-12 z-30 pointer-events-none',
          initialY: shouldReduceMotion ? 0 : 45,
          initialX: 0,
        };
      case 'bottom-left':
        return {
          containerClass: 'fixed bottom-0 left-6 sm:left-12 z-30 pointer-events-none',
          initialY: shouldReduceMotion ? 0 : 45,
          initialX: 0,
        };
      case 'right-edge':
        return {
          containerClass: 'fixed bottom-24 right-0 z-30 pointer-events-none',
          initialY: 0,
          initialX: shouldReduceMotion ? 0 : 45,
        };
    }
  };

  const { containerClass, initialY, initialX } = getPositionStyles();

  return (
    <AnimatePresence>
      {peekState.active && (
        <div className={containerClass} aria-hidden="true">
          <motion.div
            initial={{
              opacity: 0,
              y: initialY,
              x: initialX,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: initialY,
              x: initialX,
              transition: { duration: 0.35, ease: 'easeIn' },
            }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center justify-center p-1.5"
          >
            <NexusPenguinSprite
              frame={peekState.frame}
              scale={2.2}
              className="filter drop-shadow-[0_2px_4px_rgba(10,10,9,0.15)]"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
