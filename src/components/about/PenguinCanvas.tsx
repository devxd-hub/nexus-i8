/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AsciiTextWalkingEngine } from './AsciiTextWalkingEngine.ts';

export interface PenguinCanvasProps {
  activeSlide?: number;
  totalSlides?: number;
  scrollProgress?: number;
  isTransitioning?: boolean;
  dragInfluence?: number;
  className?: string;
  id?: string;
}

/**
 * Authentic ASCII Text Penguin Walking Canvas
 *
 * Renders the exact uploaded ASCII penguin text into a realistic, subtle walking/waddling cycle:
 * - 100% preservation of all ASCII characters (#, +, -, .) with authentic density and typography.
 * - Articulated natural walking: weight shifts, low foot lifts, stabilized head, passive flipper sway.
 * - Locked orientation and static camera with full body visibility.
 */
export const PenguinCanvas: React.FC<PenguinCanvasProps> = ({
  scrollProgress,
  dragInfluence = 0,
  className = '',
  id = 'about-halftone-penguin-canvas',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AsciiTextWalkingEngine | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = new AsciiTextWalkingEngine();
    engineRef.current = engine;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const now = performance.now();
    lastTimeRef.current = now;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let ctx: CanvasRenderingContext2D | null = null;

    const setupDimensions = () => {
      const rect = container.getBoundingClientRect();
      const newW = Math.floor(rect.width);
      const newH = Math.floor(rect.height);

      if (newW <= 0 || newH <= 0) return;

      width = newW;
      height = newH;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupDimensions();

    const resizeObserver = new ResizeObserver(() => {
      setupDimensions();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisibleRef.current = entry.isIntersecting;
        }
      },
      { threshold: 0.0 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTimeRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Continuous Animation Loop
    const loop = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      if (width <= 0 || height <= 0 || !ctx) {
        setupDimensions();
      }

      if (!isVisibleRef.current || !ctx || width <= 0 || height <= 0) {
        lastTimeRef.current = currentTime;
        return;
      }

      const prevTime = lastTimeRef.current || currentTime;
      const rawDt = (currentTime - prevTime) * 0.001;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      lastTimeRef.current = currentTime;

      if (!reducedMotion) {
        engine.update(dt, width);
      } else {
        engine.update(dt * 0.2, width);
      }

      const dragOffset = dragInfluence * 10;
      engine.render(ctx, width, height, dragOffset, '#EF5A2A');
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, [dragInfluence]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div
      className={`w-full flex flex-col items-center lg:items-end justify-center select-none shrink-0 ${className}`}
    >
      {/* ASCII Canvas Viewport Stage */}
      <div
        ref={containerRef}
        id={id}
        data-testid="about-halftone-penguin-canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-full min-h-[160px] max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] flex items-center justify-center overflow-visible"
        aria-label="Authentic ASCII Text Penguin Mascot Walking Cycle"
      >
        <canvas
          ref={canvasRef}
          className="block pointer-events-none drop-shadow-xs"
        />
      </div>
    </div>
  );
};

export default PenguinCanvas;
