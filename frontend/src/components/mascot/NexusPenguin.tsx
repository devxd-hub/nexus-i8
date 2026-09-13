/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';
import { NexusPenguinSprite } from './NexusPenguinSprite.tsx';
import { PixelHeart } from './PixelHeart.tsx';
import { PenguinFrameKey } from './penguinData.ts';
import { AppRoute } from '../../types.ts';
import {
  createPenguinContext,
  updatePenguinStateMachine,
  PenguinAutonomousContext,
} from './penguinPhysicsMachine.ts';

interface NexusPenguinProps {
  currentRoute: AppRoute;
  preloaderFinished?: boolean;
}

const SESSION_PAGEMAP_KEY = 'nexus_penguin_sighting_count';

export const NexusPenguin: React.FC<NexusPenguinProps> = ({
  currentRoute,
  preloaderFinished = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Visual sprite render state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [renderFrame, setRenderFrame] = useState<PenguinFrameKey>('peek_bottom');
  const [showHearts, setShowHearts] = useState<boolean>(false);

  // Animation & Physics Refs
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const ctxRef = useRef<PenguinAutonomousContext | null>(null);
  const currentFrameRef = useRef<PenguinFrameKey>('peek_bottom');

  // Lifecycle control refs
  const isEmergingRef = useRef<boolean>(false);
  const isRetreatingRef = useRef<boolean>(false);
  const lastScrollY = useRef<number>(0);
  const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retreatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPageSightingCount = (route: string): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = sessionStorage.getItem(SESSION_PAGEMAP_KEY);
      if (!stored) return 0;
      const parsed = JSON.parse(stored);
      return parsed[route] || 0;
    } catch {
      return 0;
    }
  };

  const incrementPageSighting = (route: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(SESSION_PAGEMAP_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[route] = (parsed[route] || 0) + 1;
      sessionStorage.setItem(SESSION_PAGEMAP_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore
    }
  };

  // Trigger smooth retreat below screen
  const triggerRetreat = useCallback(() => {
    if (isRetreatingRef.current) return;
    isRetreatingRef.current = true;
    isEmergingRef.current = false;
    setShowHearts(false);

    // After spring descends below viewport (approx 1.2s), stop rAF
    if (retreatTimeoutRef.current) clearTimeout(retreatTimeoutRef.current);
    retreatTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }, 1300);
  }, []);

  // Rapid scroll retreat trigger
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const velocity = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;

      if (velocity > 45 && isActive && !isRetreatingRef.current) {
        triggerRetreat();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive, triggerRetreat]);

  // Window resize handler: update viewport bounds
  useEffect(() => {
    const handleResize = () => {
      if (ctxRef.current && typeof window !== 'undefined') {
        const min = Math.max(28, window.innerWidth * 0.05);
        const max = Math.min(window.innerWidth - 84, window.innerWidth * 0.94);
        ctxRef.current.minX = min;
        ctxRef.current.maxX = max;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Unified requestAnimationFrame Animation & Physics Loop
  useEffect(() => {
    if (!isActive) return;

    lastTimeRef.current = performance.now();

    const loop = (time: DOMHighResTimeStamp) => {
      // 1. Calculate delta time with performance.now() and safe clamp (max 50ms)
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (ctxRef.current) {
        // 2. Step the controlled state machine & spring-damper physics
        const visual = updatePenguinStateMachine(
          ctxRef.current,
          dt,
          isEmergingRef.current,
          isRetreatingRef.current
        );

        // 3. Apply hardware-accelerated transform directly to DOM ref (silky 60+ FPS)
        if (mascotRef.current) {
          const appliedTilt = shouldReduceMotion ? 0 : visual.tiltDeg;
          mascotRef.current.style.transform = `translate3d(${visual.posX}px, ${visual.posY}px, 0px) scaleX(${visual.scaleX}) rotate(${appliedTilt}deg)`;
        }

        // 4. Update sprite frame only on state transition (eliminating React churn)
        if (currentFrameRef.current !== visual.frame) {
          currentFrameRef.current = visual.frame;
          setRenderFrame(visual.frame);
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isActive, shouldReduceMotion]);

  // Route-Specific Scheduling & Spawn Lifecycle
  useEffect(() => {
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (retreatTimeoutRef.current) clearTimeout(retreatTimeoutRef.current);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setIsActive(false);
    isEmergingRef.current = false;
    isRetreatingRef.current = false;
    setShowHearts(false);

    // Guard: Do not spawn while preloader is active
    if (!preloaderFinished) return;

    // Frequency control: Max 2 visits per route per session
    const count = getPageSightingCount(currentRoute);
    if (count >= 2) return;

    // On small mobile devices, avoid floating overlays to preserve clean touch zones
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return;
    }

    const spawnDelay = currentRoute === '/' ? 4200 : 3400;

    spawnTimeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 640) return;
      incrementPageSighting(currentRoute);

      const windowW = window.innerWidth;
      const minX = Math.max(28, windowW * 0.05);
      const maxX = Math.min(windowW - 84, windowW * 0.94);

      // Route-aware initial spawn location
      let initialX = maxX - 60; // Default bottom-right
      if (currentRoute === '/about' || currentRoute === '/contact') {
        initialX = minX + 50; // Bottom-left on about/contact
      } else if (currentRoute === '/gallery') {
        initialX = (minX + maxX) * 0.65;
      }

      // Initialize physics context with spring-damper model
      ctxRef.current = createPenguinContext(initialX, minX, maxX);
      isEmergingRef.current = true;
      isRetreatingRef.current = false;
      setIsActive(true);

      // Show welcome hearts on home page
      if (currentRoute === '/' && !shouldReduceMotion) {
        setTimeout(() => {
          setShowHearts(true);
          setTimeout(() => setShowHearts(false), 2400);
        }, 1200);
      }

      // Autonomous promenade duration (16 seconds before dignified retreat)
      retreatTimeoutRef.current = setTimeout(() => {
        triggerRetreat();
      }, 16500);
    }, spawnDelay);

    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (retreatTimeoutRef.current) clearTimeout(retreatTimeoutRef.current);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [currentRoute, preloaderFinished, shouldReduceMotion, triggerRetreat]);

  // Interactive Click / Hover Handler: Penguin responds with friendly wave & heart burst
  const handleInteraction = () => {
    if (!ctxRef.current || isRetreatingRef.current) return;
    ctxRef.current.isInteracting = true;
    ctxRef.current.interactionTimer = 2.0;
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2200);
  };

  if (!isActive) return null;

  return (
    <div
      className="fixed bottom-0 left-0 z-40 pointer-events-none select-none will-change-transform"
      aria-hidden="true"
    >
      <div
        ref={mascotRef}
        onClick={handleInteraction}
        onMouseEnter={handleInteraction}
        className="relative pointer-events-auto cursor-pointer flex flex-col items-center justify-end origin-bottom"
        style={{
          transform: 'translate3d(0px, 80px, 0px)',
        }}
      >
        {/* Floating Pixel Hearts on Greeting or Click */}
        {showHearts && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none">
            <PixelHeart delay={0} startX={-10} startY={0} driftX={-8} scale={2} />
            <PixelHeart delay={0.2} startX={8} startY={-4} driftX={8} scale={1.8} />
            <PixelHeart delay={0.4} startX={0} startY={-8} driftX={-2} scale={2.2} />
          </div>
        )}

        {/* Crisp Pixel-Art Mascot Sprite (Integer scale 2.4x) */}
        <NexusPenguinSprite
          frame={renderFrame}
          scale={2.4}
          className="filter drop-shadow-[0_4px_12px_rgba(10,10,9,0.28)] transition-filter duration-200 hover:brightness-105"
        />
      </div>
    </div>
  );
};

export default NexusPenguin;
