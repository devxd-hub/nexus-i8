/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AsciiTextWalkingEngine } from './AsciiTextWalkingEngine.ts';

export interface AsciiPenguinWalkStageProps {
  className?: string;
  id?: string;
  maxHeight?: number;
  interactive?: boolean;
  color?: string;
  stationary?: boolean;
}

/**
 * AsciiPenguinWalkStage
 *
 * Renders the user's authentic ASCII text penguin performing a realistic walking/waddling cycle with active wing physics in signature orange.
 * Renders each character directly with crisp monospace typography.
 */
export const AsciiPenguinWalkStage: React.FC<AsciiPenguinWalkStageProps> = ({
  className = '',
  id = 'ascii-penguin-walk-stage',
  maxHeight = 440,
  interactive = true,
  color = '#F2613F',
  stationary = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AsciiTextWalkingEngine | null>(null);
  const animIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const dragOffsetRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = new AsciiTextWalkingEngine({ stationary });
    engineRef.current = engine;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let ctx: CanvasRenderingContext2D | null = null;

    const resize = () => {
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
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
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

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      animIdRef.current = requestAnimationFrame(loop);

      if (width <= 0 || height <= 0 || !ctx) {
        resize();
      }

      if (!isVisibleRef.current || !ctx || width <= 0 || height <= 0) {
        lastTimeRef.current = time;
        return;
      }

      const prevTime = lastTimeRef.current || time;
      const rawDt = (time - prevTime) * 0.001;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      lastTimeRef.current = time;

      // Update walking kinematics and forward locomotion across stage width
      if (!reducedMotion) {
        engine.update(dt, width);
      } else {
        engine.update(dt * 0.2, width);
      }

      // Smooth drag recovery
      if (!isDraggingRef.current && Math.abs(dragOffsetRef.current) > 0.1) {
        dragOffsetRef.current *= Math.max(0, 1 - dt * 8);
      }

      // Render ASCII characters with crisp typography
      engine.render(ctx, width, height, dragOffsetRef.current, color);
    };

    const handlePointerMoveGlobal = (e: PointerEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width * 0.5)) / (rect.width * 0.5);
      const relY = (e.clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.5);
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      engine.setTargetGaze(relX, relY, isInside);
    };

    window.addEventListener('pointermove', handlePointerMoveGlobal, { passive: true });

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMoveGlobal);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    engineRef.current?.triggerClickImpulse();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    dragOffsetRef.current = Math.max(-25, Math.min(25, delta * 0.4));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full flex items-center justify-center select-none cursor-default ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
      aria-label="Authentic ASCII Text Penguin Mascot walking cycle"
    >
      <canvas
        ref={canvasRef}
        className="block pointer-events-none drop-shadow-xs"
      />
    </div>
  );
};

export default AsciiPenguinWalkStage;
