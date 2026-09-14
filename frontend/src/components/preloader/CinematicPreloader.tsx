/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ConvergenceTrails } from './ConvergenceTrails.tsx';
import { NexusFormationX } from './NexusFormationX.tsx';

export type PreloaderStage =
  | 'init'
  | 'forming-x'
  | 'locking-x'
  | 'converging'
  | 'locked';

export interface NexusPreloaderProps {
  theme?: 'light' | 'dark';
  duration?: number;
  onComplete: () => void;
  onHandoffStart?: () => void;
  isReplay?: boolean;
}

// Backwards compatibility alias
export type CinematicPreloaderProps = NexusPreloaderProps;

export function getStageFromProgress(progress: number): PreloaderStage {
  if (progress >= 98) return 'locked';
  if (progress >= 75) return 'converging';
  if (progress >= 55) return 'locking-x';
  if (progress >= 15) return 'forming-x';
  return 'init';
}

const DEFAULT_DURATION = 1700;
const HOLD_DURATION_MS = 250;
const EXIT_DURATION_MS = 450;

/**
 * Clean, Editorial NEXUS Preloader:
 * - Central Hero: NEXUS X physically traced into existence.
 * - Negative space: 100% clean, quiet canvas with zero dashboard HUD metadata and zero percentage counters.
 * - Symmetrical Lovelo font convergence (NE from left, US from right).
 * - Seamless transition from traced SVG to authentic asset (/logo/NEXUS-removebg-preview.png).
 * - Stable single-RAF animation clock honoring the duration prop (1700ms).
 * - Supports theme inheritance, replay, and accessibility (prefers-reduced-motion).
 */
export const NexusPreloader: React.FC<NexusPreloaderProps> = ({
  theme,
  duration = DEFAULT_DURATION,
  onComplete,
  onHandoffStart,
  isReplay = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Progress state: 0 to 100 (drives physical tracing and convergence silently)
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<PreloaderStage>('init');
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  // Animation frame & timing refs
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);

  // Timeout refs
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lifecycle & completion guard refs
  const isMountedRef = useRef<boolean>(true);
  const hasCompletedRef = useRef<boolean>(false);

  // Stored references for callbacks & props to prevent stale closures without re-triggering effects
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onHandoffStartRef = useRef(onHandoffStart);
  onHandoffStartRef.current = onHandoffStart;

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const shouldReduceMotionRef = useRef(shouldReduceMotion);
  shouldReduceMotionRef.current = shouldReduceMotion;

  // Dedicated single-execution completion guard
  const safeComplete = () => {
    if (hasCompletedRef.current || !isMountedRef.current) return;
    hasCompletedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    isMountedRef.current = true;

    const cleanup = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (holdTimeoutRef.current !== null) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
      if (exitTimeoutRef.current !== null) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };

    // Clean up any existing loop/timers on new mount or replay
    cleanup();
    startTimeRef.current = null;
    progressRef.current = 0;
    hasCompletedRef.current = false;

    // Reset component React states for clean replay instance
    setProgress(0);
    setStage('init');
    setIsExiting(false);
    setIsDone(false);

    // Accessibility: prefers-reduced-motion path
    if (shouldReduceMotionRef.current) {
      if (!isMountedRef.current) return cleanup;

      progressRef.current = 100;
      setProgress(100);
      setStage('locked');

      holdTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        setIsExiting(true);
        onHandoffStartRef.current?.();

        exitTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setIsDone(true);
          safeComplete();
        }, 120);
      }, 180);

      return () => {
        isMountedRef.current = false;
        cleanup();
      };
    }

    // Main animation loop: ONE stable rAF clock for instance lifetime
    const tick = (now: number) => {
      if (!isMountedRef.current) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = now - startTimeRef.current;
      const targetDuration = Math.max(100, durationRef.current);

      // Derive progress monotonically from elapsed time
      const rawProgress = (elapsed / targetDuration) * 100;
      const nextProgress = Math.min(100, Math.max(progressRef.current, Math.floor(rawProgress)));

      // Update state without recreating loop
      if (nextProgress !== progressRef.current) {
        progressRef.current = nextProgress;
        const nextStage = getStageFromProgress(nextProgress);
        setProgress(nextProgress);
        setStage(nextStage);
      }

      if (rawProgress < 100) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // Reached 100% exactly
        progressRef.current = 100;
        setProgress(100);
        setStage('locked');

        // Execute 100% hold
        holdTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;

          setIsExiting(true);
          onHandoffStartRef.current?.();

          // After exit transition, complete lifecycle exactly once
          exitTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            setIsDone(true);
            safeComplete();
          }, EXIT_DURATION_MS);
        }, HOLD_DURATION_MS);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [isReplay]);

  if (isDone) return null;

  return (
    <div
      id="nexus-preloader"
      role="status"
      aria-label="Loading NEXUS"
      data-stage={stage}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] select-none transition-opacity duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={{
        opacity: isExiting ? 0 : 1,
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* Background canvas for subtle Convergence Trails during NE/US lateral approach */}
      <ConvergenceTrails progress={progress} stage={stage} />

      {/* Central Visual Focus: Pure Tracing & Lovelo NE/US Convergence */}
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
        className="relative z-10 flex items-center justify-center"
      >
        <NexusFormationX progress={progress} />
      </motion.div>
    </div>
  );
};

// Aliases for unified importing across the application
export const CinematicPreloader = NexusPreloader;
export default NexusPreloader;
