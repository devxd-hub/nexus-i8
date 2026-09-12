/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export type ScrollCallback = (state: {
  scrollY: number;
  progress: number;
  velocity: number;
}) => void;

interface LenisContextValue {
  lenis: null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
  scrollProgress: number;
  scrollY: number;
  velocity: number;
  subscribe: (callback: ScrollCallback) => () => void;
  activeSectionId?: string;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  scrollProgress: 0,
  scrollY: 0,
  velocity: 0,
  subscribe: () => () => {},
  activeSectionId: 'nexus-about-signature',
});

export const useAboutScroll = () => useContext(LenisContext);

export interface AboutSectionInfo {
  id: string;
  number: string;
  title: string;
}

export const ABOUT_SECTIONS: AboutSectionInfo[] = [
  { id: 'nexus-about-signature', number: '00', title: 'SIGNATURE' },
  { id: 'about-hero', number: '01', title: 'ABOUT' },
  { id: 'nexus-story-scroll-section', number: '02', title: 'STORY' },
  { id: 'about-thinking', number: '03', title: 'THINKING' },
  { id: 'about-building', number: '04', title: 'BUILDING' },
  { id: 'chapter-05', number: '05', title: 'PROJECTS' },
  { id: 'about-beliefs', number: '06', title: 'BELIEFS' },
  { id: 'about-final-statement', number: '07', title: 'STATEMENT' },
];

interface AboutScrollManagerProps {
  children: React.ReactNode;
}

/**
 * AboutScrollManager
 *
 * Implements an editorial-grade Momentum Scrolling Engine:
 * - Smooth momentum scrolling tuned with continuous easing (lerp: 0.085, duration: 1.15s)
 * - Directly removes scroll stutter for a fluid, continuous glide
 * - Real-time subscriber sync for frame-perfect sticky story stage transitions
 * - Dynamic reading progress indicator
 * - Respects prefers-reduced-motion preferences
 */
export const AboutScrollManager: React.FC<AboutScrollManagerProps> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>(ABOUT_SECTIONS[0].id);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Core physics refs for 60/120fps momentum interpolation
  const targetYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const isProgrammaticGlideRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const subscribersRef = useRef<Set<ScrollCallback>>(new Set());

  // Subscribe helper for child components (e.g. NexusStoryScroll)
  const subscribe = useCallback((callback: ScrollCallback) => {
    subscribersRef.current.add(callback);
    // Immediately emit current state
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    callback({
      scrollY: currentYRef.current,
      progress: Math.min(1, Math.max(0, currentYRef.current / maxScroll)),
      velocity: velocityRef.current,
    });
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Dispatch state to all registered subscribers
  const notifySubscribers = useCallback((scrollY: number, progress: number, velocity: number) => {
    subscribersRef.current.forEach((cb) => {
      try {
        cb({ scrollY, progress, velocity });
      } catch {
        // Safe consumer execution
      }
    });
  }, []);

  // Update active section tracker
  const checkActiveSection = useCallback((scrollY: number) => {
    const viewportMid = window.innerHeight * 0.35;
    let currentActive = ABOUT_SECTIONS[0].id;

    for (const section of ABOUT_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportMid && rect.bottom > viewportMid) {
          currentActive = section.id;
          break;
        }
        if (rect.top <= viewportMid) {
          currentActive = section.id;
        }
      }
    }
    setActiveSectionId(currentActive);
  }, []);

  // Main continuous momentum rAF loop
  const startMomentumLoop = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const LERP = 0.085; // Calibrated continuous easing deceleration

    const step = () => {
      if (isProgrammaticGlideRef.current) return; // Programmed glide controls rAF

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetYRef.current = Math.max(0, Math.min(targetYRef.current, maxScroll));
      const diff = targetYRef.current - currentYRef.current;

      if (Math.abs(diff) > 0.2) {
        const delta = diff * LERP;
        currentYRef.current += delta;
        velocityRef.current = delta;

        window.scrollTo(0, currentYRef.current);

        const progress = maxScroll > 0 ? currentYRef.current / maxScroll : 0;
        const clampedProgress = Math.min(1, Math.max(0, progress));
        setScrollProgress(clampedProgress);
        setShowScrollTop(currentYRef.current > 450);
        checkActiveSection(currentYRef.current);
        notifySubscribers(currentYRef.current, clampedProgress, delta);

        rafIdRef.current = requestAnimationFrame(step);
      } else {
        currentYRef.current = targetYRef.current;
        velocityRef.current = 0;
        window.scrollTo(0, currentYRef.current);

        const progress = maxScroll > 0 ? currentYRef.current / maxScroll : 0;
        const clampedProgress = Math.min(1, Math.max(0, progress));
        setScrollProgress(clampedProgress);
        setShowScrollTop(currentYRef.current > 450);
        checkActiveSection(currentYRef.current);
        notifySubscribers(currentYRef.current, clampedProgress, 0);

        isAnimatingRef.current = false;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [checkActiveSection, notifySubscribers]);

  // Synchronize target with current position on mount
  useEffect(() => {
    const initialY = window.scrollY;
    currentYRef.current = initialY;
    targetYRef.current = initialY;
  }, []);

  // Desktop wheel momentum listener
  useEffect(() => {
    if (shouldReduceMotion) return;

    const onWheel = (e: WheelEvent) => {
      // Allow browser zoom and modifier navigation
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Don't intercept if scrolling inside an independently scrollable child element
      let el = e.target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight) {
          const overflowY = window.getComputedStyle(el).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            return;
          }
        }
        el = el.parentElement;
      }

      e.preventDefault();

      // Normalize wheel delta across browsers & input devices
      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 26; // Lines
      else if (e.deltaMode === 2) deltaY *= window.innerHeight; // Pages

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetYRef.current = Math.max(0, Math.min(targetYRef.current + deltaY * 0.95, maxScroll));

      startMomentumLoop();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [shouldReduceMotion, startMomentumLoop]);

  // Native scroll listener for scrollbar drag, mobile swipe, or touch gestures
  useEffect(() => {
    const onScroll = () => {
      if (isAnimatingRef.current || isProgrammaticGlideRef.current) return;

      const scrollY = window.scrollY;
      currentYRef.current = scrollY;
      targetYRef.current = scrollY;

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      const clampedProgress = Math.min(1, Math.max(0, progress));

      setScrollProgress(clampedProgress);
      setShowScrollTop(scrollY > 450);
      checkActiveSection(scrollY);
      notifySubscribers(scrollY, clampedProgress, 0);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [checkActiveSection, notifySubscribers]);

  // Programmatic smooth glide (duration: 1.15s, exponential easing)
  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
      let targetY = 0;
      const offset = options?.offset ?? -90;

      if (typeof target === 'number') {
        targetY = target;
      } else if (typeof target === 'string') {
        const el = document.querySelector(target.startsWith('#') ? target : `#${target}`);
        if (el) {
          targetY = el.getBoundingClientRect().top + window.scrollY + offset;
        } else {
          return;
        }
      } else if (target instanceof HTMLElement) {
        targetY = target.getBoundingClientRect().top + window.scrollY + offset;
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clampedTarget = Math.max(0, Math.min(targetY, maxScroll));

      if (shouldReduceMotion) {
        window.scrollTo({ top: clampedTarget, behavior: 'auto' });
        currentYRef.current = clampedTarget;
        targetYRef.current = clampedTarget;
        return;
      }

      // Smooth custom glide animation with duration 1.15s and continuous easing
      const startY = window.scrollY;
      const distance = clampedTarget - startY;
      if (Math.abs(distance) < 2) return;

      const duration = (options?.duration ?? 1.15) * 1000;
      const startTime = performance.now();

      isProgrammaticGlideRef.current = true;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      // Continuous exponential deceleration curve
      const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      const glideStep = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);

        const nextY = startY + distance * eased;
        currentYRef.current = nextY;
        targetYRef.current = clampedTarget;
        window.scrollTo(0, nextY);

        const docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const curProgress = Math.min(1, Math.max(0, nextY / docMax));
        setScrollProgress(curProgress);
        setShowScrollTop(nextY > 450);
        checkActiveSection(nextY);
        notifySubscribers(nextY, curProgress, 0);

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(glideStep);
        } else {
          isProgrammaticGlideRef.current = false;
          rafIdRef.current = null;
        }
      };

      rafIdRef.current = requestAnimationFrame(glideStep);
    },
    [shouldReduceMotion, checkActiveSection, notifySubscribers]
  );

  return (
    <LenisContext.Provider
      value={{
        lenis: null,
        scrollTo,
        scrollProgress,
        scrollY: currentYRef.current,
        velocity: velocityRef.current,
        subscribe,
        activeSectionId,
      }}
    >
      {/* Floating Back-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => scrollTo(0, { duration: 1.3 })}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 p-3 bg-[#0A0A09] text-[#F3EEE5] hover:bg-[#EF5A2A] hover:text-white transition-colors duration-300 rounded-full shadow-lg shadow-black/10 flex items-center justify-center group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A]"
            aria-label="Glide smoothly back to top"
          >
            <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span className="sr-only">Scroll back to top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Children content (About page sections) */}
      {children}
    </LenisContext.Provider>
  );
};
