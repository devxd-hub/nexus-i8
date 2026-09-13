/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface GlitchParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  size: number;
}

interface GridCell {
  x: number;
  y: number;
  char: string;
  targetChar: string;
  baseAlpha: number;
  currentAlpha: number;
  glitchTimer: number;
  isAccent: boolean;
}

const ASCII_POOL = [
  '+', '·', '~', '*', '¬', '_', '^', '#', ':', ';',
  '[', ']', '{', '}', '/', '\\', '|', 'x', 'o', '0',
  '1', '•', '°', '%', '$', '=', '<', '>', '?'
];

const ACCENT_GLYPHS = ['#', '+', '*', 'x', '[+]', '{#}', '01', '//', '::', '><'];

/**
 * AsciiGlitchBackground
 *
 * Interactive ambient ASCII canvas background:
 * - Subtle monospace background character grid with organic flickering & micro-glitches
 * - Dynamic Cursor Interaction:
 *   - Mouse proximity field illuminates and rapidly scrambles nearby glyphs
 *   - Generates drifting ASCII sparkle particles on cursor motion
 *   - Click shockwaves that send expanding ASCII character distortion ripples
 * - Cyber-editorial ambient indicators (live cursor coordinates, system state glyphs)
 */
export const AsciiGlitchBackground: React.FC<{
  className?: string;
  accentColor?: string;
  interactive?: boolean;
}> = ({
  className = '',
  accentColor = '#F2613F',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let ctx: CanvasRenderingContext2D | null = null;

    // Grid configuration
    const cellSize = 28;
    let cols = 0;
    let rows = 0;
    let grid: GridCell[] = [];

    // Interactive particles & shockwaves
    const particles: GlitchParticle[] = [];
    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; strength: number }[] = [];

    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      speed: 0,
      lastMoveTime: 0,
    };

    const getRandomChar = () => ASCII_POOL[Math.floor(Math.random() * ASCII_POOL.length)];

    const initGrid = () => {
      cols = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      grid = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isAccent = Math.random() < 0.08;
          const char = isAccent
            ? ACCENT_GLYPHS[Math.floor(Math.random() * ACCENT_GLYPHS.length)]
            : getRandomChar();
          
          grid.push({
            x: c * cellSize + cellSize * 0.5,
            y: r * cellSize + cellSize * 0.5,
            char,
            targetChar: char,
            baseAlpha: isAccent ? 0.08 : 0.035,
            currentAlpha: isAccent ? 0.08 : 0.035,
            glitchTimer: Math.random() * 8 + 2,
            isAccent,
          });
        }
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      initGrid();
    };

    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    // Mouse & Touch listeners
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      const dist = Math.hypot(newX - mouse.targetX, newY - mouse.targetY);
      mouse.speed = dist;
      mouse.targetX = newX;
      mouse.targetY = newY;
      mouse.active = true;
      mouse.lastMoveTime = performance.now();

      setCoords({ x: Math.round(newX), y: Math.round(newY) });

      // Spawn subtle particle sparks on brisk mouse motion
      if (dist > 8 && particles.length < 40) {
        for (let i = 0; i < (dist > 25 ? 2 : 1); i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.8 + 0.6;
          particles.push({
            x: newX + (Math.random() - 0.5) * 12,
            y: newY + (Math.random() - 0.5) * 12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.4,
            char: ASCII_POOL[Math.floor(Math.random() * ASCII_POOL.length)],
            color: Math.random() < 0.45 ? accentColor : '#F5EFE6',
            alpha: 0.65,
            maxLife: 0.8 + Math.random() * 0.6,
            life: 0,
            size: Math.floor(Math.random() * 4) + 11,
          });
        }
      }
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Trigger ASCII shockwave
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.45,
        strength: 1.0,
      });

      // Burst of particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
        const speed = Math.random() * 2.5 + 1.2;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          char: ACCENT_GLYPHS[Math.floor(Math.random() * ACCENT_GLYPHS.length)],
          color: accentColor,
          alpha: 0.85,
          maxLife: 1.0,
          life: 0,
          size: 13,
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerdown', handlePointerDown);

    let lastTime = performance.now();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (!ctx || width <= 0 || height <= 0) return;

      const dt = Math.min(0.05, (time - lastTime) * 0.001);
      lastTime = time;

      // Smooth mouse lerping
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * Math.min(1, dt * 14);
        mouse.y += (mouse.targetY - mouse.y) * Math.min(1, dt * 14);
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update and Render Grid Cells
      ctx.font = '500 11px "JetBrains Mono", "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const mouseProximityRadius = 150;

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];

        // Periodic ambient glitch trigger
        cell.glitchTimer -= dt;
        if (cell.glitchTimer <= 0) {
          cell.glitchTimer = Math.random() * 6 + 2;
          cell.char = cell.isAccent
            ? ACCENT_GLYPHS[Math.floor(Math.random() * ACCENT_GLYPHS.length)]
            : getRandomChar();
        }

        // Distance from cursor
        let distToMouse = 9999;
        if (mouse.active) {
          distToMouse = Math.hypot(cell.x - mouse.x, cell.y - mouse.y);
        }

        // Check shockwave influences
        let shockwaveDistortion = 0;
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const distToWave = Math.abs(Math.hypot(cell.x - sw.x, cell.y - sw.y) - sw.radius);
          if (distToWave < 35) {
            shockwaveDistortion = Math.max(shockwaveDistortion, (1 - distToWave / 35) * sw.strength);
          }
        }

        let targetAlpha = cell.baseAlpha;
        let isHovered = false;
        let drawX = cell.x;
        let drawY = cell.y;
        let renderChar = cell.char;
        let renderColor = '#F5EFE6';

        if (distToMouse < mouseProximityRadius) {
          isHovered = true;
          const proximityNorm = 1 - distToMouse / mouseProximityRadius;
          targetAlpha = cell.baseAlpha + proximityNorm * 0.42;

          // Magnetic gentle push away
          const angle = Math.atan2(cell.y - mouse.y, cell.x - mouse.x);
          const pushDist = Math.sin(proximityNorm * Math.PI) * 6;
          drawX += Math.cos(angle) * pushDist;
          drawY += Math.sin(angle) * pushDist;

          // Rapid glitch morphing near cursor
          if (Math.random() < proximityNorm * 0.35) {
            renderChar = getRandomChar();
          }

          if (proximityNorm > 0.4) {
            renderColor = accentColor;
          }
        }

        if (shockwaveDistortion > 0.05) {
          targetAlpha = Math.max(targetAlpha, shockwaveDistortion * 0.7);
          renderColor = accentColor;
          if (Math.random() < 0.4) {
            renderChar = getRandomChar();
          }
        }

        // Smooth alpha transition
        cell.currentAlpha += (targetAlpha - cell.currentAlpha) * Math.min(1, dt * 10);

        if (cell.currentAlpha > 0.01) {
          ctx.fillStyle = renderColor;
          ctx.globalAlpha = cell.currentAlpha;
          ctx.fillText(renderChar, drawX, drawY);
        }
      }

      // 2. Update and Render Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += dt * 320;
        sw.strength = Math.max(0, 1 - sw.radius / sw.maxRadius);

        if (sw.radius >= sw.maxRadius || sw.strength <= 0.01) {
          shockwaves.splice(s, 1);
        }
      }

      // 3. Update and Render Cursor Particle Sparks
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.life += dt;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.95;
        pt.vy *= 0.95;

        const progress = pt.life / pt.maxLife;
        if (progress >= 1) {
          particles.splice(p, 1);
          continue;
        }

        const alpha = (1 - progress) * pt.alpha;
        ctx.font = `600 ${pt.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fillText(pt.char, pt.x, pt.y);
      }

      ctx.globalAlpha = 1.0;
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [accentColor, interactive]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-auto overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Subtle Cyber-Editorial Corner ASCII Badges */}
      <div className="absolute top-4 left-6 pointer-events-none select-none hidden sm:flex items-center space-x-2 text-[10px] font-mono text-[#F5EFE6]/25 tracking-widest uppercase">
        <span className="text-[#F2613F]/70">+</span>
        <span>SYS_COORD:</span>
        <span className="text-[#F5EFE6]/40 font-semibold">
          [{coords.x.toString().padStart(4, '0')},{coords.y.toString().padStart(4, '0')}]
        </span>
      </div>

      <div className="absolute bottom-4 right-6 pointer-events-none select-none hidden sm:flex items-center space-x-2 text-[10px] font-mono text-[#F5EFE6]/25 tracking-widest uppercase">
        <span>[ ASCII_MATRIX // ACTIVE ]</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2613F]/60 animate-pulse" />
      </div>
    </div>
  );
};

export default AsciiGlitchBackground;
