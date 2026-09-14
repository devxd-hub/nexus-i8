/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { PreloaderStage } from './CinematicPreloader.tsx';

export interface ConvergenceTrailsProps {
  progress: number;
  stage?: PreloaderStage;
  className?: string;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  trail: TrailPoint[];
  maxTrailLength: number;
  speed: number;
}

const MAX_PARTICLES = 22;

// Brand-tailored particle color palettes
const DARK_PALETTE = ['#F2613F', '#F26504', '#FF7A45', '#FFA07A', '#FFFFFF'];
const LIGHT_PALETTE = ['#F2613F', '#E05332', '#481E14', '#D44A1B', '#F26504'];

/**
 * ConvergenceTrails Canvas Animation:
 * - Single persistent requestAnimationFrame loop for the component lifecycle.
 * - Progress stored in progressRef.current to prevent loop recreations.
 * - Responsive resize lifecycle with device pixel ratio scaling & no layout thrashing.
 * - Strict particle memory management with clean expiration & array clearance on unmount.
 * - prefersReducedMotion support with zero continuous animation frames.
 * - Seamless theme updates via isDarkRef without loop interruption.
 */
export const ConvergenceTrails: React.FC<ConvergenceTrailsProps> = ({
  progress,
  stage,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const particlesRef = useRef<TrailParticle[]>([]);

  const shouldReduceMotion = useReducedMotion();
  const { isDark } = useTheme();

  // Store latest progress & stage in refs to avoid restarting the animation loop on updates
  const progressRef = useRef<number>(progress);
  progressRef.current = progress;

  const stageRef = useRef<PreloaderStage | undefined>(stage);
  stageRef.current = stage;

  // Store theme in a ref so renderer reads it without restarting the loop
  const isDarkRef = useRef<boolean>(isDark);
  isDarkRef.current = isDark;

  // Cached canvas dimensions & DPR
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 0,
    height: 0,
    dpr: 1,
  });

  // Responsive resize handler respecting DPR without layout thrashing
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.floor(rect.width);
    const displayHeight = Math.floor(rect.height);

    if (displayWidth <= 0 || displayHeight <= 0) return;

    const targetWidth = Math.floor(displayWidth * dpr);
    const targetHeight = Math.floor(displayHeight * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    sizeRef.current = {
      width: displayWidth,
      height: displayHeight,
      dpr,
    };
  }, []);

  // Helper to spawn a new converging particle
  const spawnParticle = (
    width: number,
    height: number,
    targetX: number,
    targetY: number,
    currentProgress: number,
    dark: boolean
  ) => {
    const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
    const color = palette[Math.floor(Math.random() * palette.length)];

    let startX: number;
    let startY: number;

    if (currentProgress >= 72) {
      // During NE/US convergence: trails follow the actual lateral trajectory of the incoming letters
      // Symmetrically streaming in from the left (NE) and right (US) along the horizontal baseline
      const isLeft = Math.random() < 0.5;
      const xOffset = width * (0.32 + Math.random() * 0.18);
      startX = isLeft ? targetX - xOffset : targetX + xOffset;
      // Slight vertical variance centered on the letter baseline
      startY = targetY + (Math.random() - 0.5) * 36;
    } else {
      // Prior phases: 4 diagonal arms of the NEXUS 'X'
      const baseAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      const baseAngle = baseAngles[Math.floor(Math.random() * baseAngles.length)];
      const angleJitter = (Math.random() - 0.5) * 0.45;
      const spawnAngle = baseAngle + angleJitter;

      const spawnDistance = Math.hypot(width, height) * (0.35 + Math.random() * 0.25);
      startX = targetX + Math.cos(spawnAngle) * spawnDistance;
      startY = targetY + Math.sin(spawnAngle) * spawnDistance;
    }

    // Speed scales slightly with progress as convergence accelerates
    const baseSpeed = 130 + Math.random() * 80 + (currentProgress / 100) * 140;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy) || 1;

    const vx = (dx / dist) * baseSpeed;
    const vy = (dy / dist) * baseSpeed;

    const particle: TrailParticle = {
      x: startX,
      y: startY,
      vx,
      vy,
      targetX,
      targetY,
      radius: 1.2 + Math.random() * 1.6,
      color,
      alpha: 0.2 + Math.random() * 0.6,
      life: 1.0,
      maxLife: 1.8 + Math.random() * 1.2,
      trail: [],
      maxTrailLength: 10 + Math.floor(Math.random() * 8),
      speed: baseSpeed,
    };

    particlesRef.current.push(particle);
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Reduced motion: do not start continuous loop, ensure no active RAF
    if (shouldReduceMotion) {
      return () => {
        isMountedRef.current = false;
        particlesRef.current = [];
      };
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateCanvasSize();

    // ResizeObserver ensures single stable listener without duplicate registrations
    const resizeObserver = new ResizeObserver(() => {
      if (isMountedRef.current) {
        updateCanvasSize();
      }
    });
    resizeObserver.observe(canvas);

    let lastTime = performance.now();
    let lastSpawnTime = performance.now();

    // Single persistent canvas animation loop
    const renderLoop = (now: number) => {
      if (!isMountedRef.current) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const { width, height, dpr } = sizeRef.current;
      const currentProgress = progressRef.current;
      const dark = isDarkRef.current;

      if (width > 0 && height > 0) {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const targetX = width / 2;
        const targetY = height / 2;

        // Controlled spawning: active strictly during NE/US convergence (75% -> 98%)
        if (currentProgress >= 75 && currentProgress < 98 && particlesRef.current.length < MAX_PARTICLES) {
          const isNearLock = currentProgress >= 94;
          const spawnInterval = isNearLock ? 160 : 70;

          if (now - lastSpawnTime > spawnInterval) {
            lastSpawnTime = now;
            spawnParticle(width, height, targetX, targetY, currentProgress, dark);
          }
        }

        // Update, filter, and render active particles
        const aliveParticles: TrailParticle[] = [];

        for (let i = 0; i < particlesRef.current.length; i++) {
          const p = particlesRef.current[i];

          // Push current position to trail history
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          if (p.trail.length > p.maxTrailLength) {
            p.trail.shift();
          }

          // Move toward target
          const toTargetX = targetX - p.x;
          const toTargetY = targetY - p.y;
          const distToTarget = Math.hypot(toTargetX, toTargetY);

          // Convergence acceleration as it approaches center
          const pull = 1.0 + Math.max(0, (1 - distToTarget / (width * 0.5))) * 1.5;
          p.x += (p.vx * pull) * dt;
          p.y += (p.vy * pull) * dt;

          // Dissolve near center, or rapidly dissolve once letters lock (>= 98%)
          if (currentProgress >= 98) {
            p.life -= dt * 4.5;
          } else if (distToTarget < 20) {
            p.life -= dt * 3.5;
          } else {
            p.life -= dt / p.maxLife;
          }

          // Clean particle memory removal
          if (p.life > 0) {
            aliveParticles.push(p);

            // Render Trail
            if (p.trail.length > 1) {
              ctx.beginPath();
              ctx.moveTo(p.trail[0].x * dpr, p.trail[0].y * dpr);
              for (let t = 1; t < p.trail.length; t++) {
                ctx.lineTo(p.trail[t].x * dpr, p.trail[t].y * dpr);
              }
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = Math.max(0, p.alpha * p.life * 0.35);
              ctx.lineWidth = Math.max(0.6, p.radius * 0.7 * dpr);
              ctx.stroke();
            }

            // Render Particle Head
            ctx.beginPath();
            ctx.arc(p.x * dpr, p.y * dpr, p.radius * dpr, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha * p.life);
            ctx.fill();
          }
        }

        particlesRef.current = aliveParticles;
        ctx.restore();
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMountedRef.current = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      resizeObserver.disconnect();
      particlesRef.current = [];
    };
  }, [shouldReduceMotion, updateCanvasSize]); // Stable lifecycle: does NOT restart on progress or theme changes

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
