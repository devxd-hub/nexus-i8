/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { NexusPenguinSprite } from './NexusPenguinSprite.tsx';
import { PenguinFrameKey } from './penguinData.ts';

interface PenguinFooterProps {
  className?: string;
}

export const PenguinFooter: React.FC<PenguinFooterProps> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<PenguinFrameKey>('idle');
  const [networkActive, setNetworkActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isPostDragAnnoyed, setIsPostDragAnnoyed] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Spring physics
  const springConfig = { damping: 22, stiffness: 260, mass: 0.75 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);
  const springRotate = useSpring(0, springConfig);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // 1. Entrance Sequence
  useEffect(() => {
    if (hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasTriggered(true);
          startEntranceSequence();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered]);

  const startEntranceSequence = () => {
    if (shouldReduceMotion) {
      setCurrentFrame('idle');
      setNetworkActive(true);
      return;
    }

    // Walking steps cycle (walk_1 -> walk_2 -> walk_1)
    setCurrentFrame('walk_1');
    const t1 = setTimeout(() => setCurrentFrame('walk_2'), 250);
    const t2 = setTimeout(() => setCurrentFrame('walk_1'), 500);
    const t3 = setTimeout(() => setCurrentFrame('walk_2'), 750);
    const t4 = setTimeout(() => setCurrentFrame('idle'), 1050);

    // Look around -> approach point
    const t5 = setTimeout(() => setCurrentFrame('look_right'), 1450);
    const t6 = setTimeout(() => {
      setCurrentFrame('nexus_touch');
      setNetworkActive(true);
    }, 2100);

    // Wave to visitor
    const t7 = setTimeout(() => setCurrentFrame('wave_smile'), 2800);
    const t8 = setTimeout(() => setCurrentFrame('idle'), 3800);

    timeoutsRef.current.push(t1, t2, t3, t4, t5, t6, t7, t8);
  };

  // 2. Idle Micro-Motions
  useEffect(() => {
    if (!hasTriggered || isDragging || isPostDragAnnoyed) return;

    const interval = setInterval(() => {
      if (isHovered || isDragging || isPostDragAnnoyed) return;

      const roll = Math.random();
      if (roll < 0.45) {
        setCurrentFrame('blink');
        setTimeout(() => {
          if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
        }, 150);
      } else if (roll < 0.75) {
        setCurrentFrame('look_left');
        setTimeout(() => {
          if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
        }, 700);
      } else {
        setCurrentFrame('curious');
        setTimeout(() => {
          if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
        }, 800);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [hasTriggered, isHovered, isDragging, isPostDragAnnoyed]);

  // 3. Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    clearTimeouts();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setIsPostDragAnnoyed(false);
    setCurrentFrame('struggle_start');
  };

  // 4. Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) {
      if (!isDragging && !isPostDragAnnoyed) {
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX < rect.width * 0.35) {
          setCurrentFrame('look_left');
        } else if (relativeX > rect.width * 0.65) {
          setCurrentFrame('look_right');
        } else {
          setCurrentFrame('idle');
        }
      }
      return;
    }

    const rawDeltaX = e.clientX - dragStartRef.current.x;
    const rawDeltaY = e.clientY - dragStartRef.current.y;

    const clampedX = Math.max(-85, Math.min(85, rawDeltaX * 0.68));
    const clampedY = Math.max(-55, Math.min(35, rawDeltaY * 0.68));

    springX.set(clampedX);
    springY.set(clampedY);

    if (Math.abs(clampedX) >= Math.abs(clampedY)) {
      if (clampedX > 12) {
        setCurrentFrame('struggle_left');
        springRotate.set(shouldReduceMotion ? 0 : -8);
      } else if (clampedX < -12) {
        setCurrentFrame('struggle_right');
        springRotate.set(shouldReduceMotion ? 0 : 8);
      } else {
        setCurrentFrame('struggle_start');
        springRotate.set(0);
      }
    } else {
      if (clampedY < -12) {
        setCurrentFrame('struggle_up');
        springRotate.set(0);
      } else if (clampedY > 12) {
        setCurrentFrame('struggle_down');
        springRotate.set(0);
      } else {
        setCurrentFrame('struggle_start');
        springRotate.set(0);
      }
    }
  };

  // 5. Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(false);
    dragStartRef.current = null;

    springX.set(0);
    springY.set(0);
    springRotate.set(0);

    setCurrentFrame('recover');
    setIsPostDragAnnoyed(true);

    const t1 = setTimeout(() => {
      setCurrentFrame('annoyed');
    }, 380);

    const t2 = setTimeout(() => {
      setCurrentFrame('idle');
      setIsPostDragAnnoyed(false);
    }, 1800);

    timeoutsRef.current.push(t1, t2);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-start select-none ${className}`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
        <span className="font-dosis text-[11px] font-bold tracking-[0.25em] text-[#EF5A2A] uppercase">
          OFFICIAL AMBASSADOR
        </span>
      </div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
        }}
        className="relative p-4 sm:p-5 bg-[#0E0D0C] border border-[rgba(243,238,229,0.12)] hover:border-[rgba(239,90,42,0.4)] transition-all duration-300"
        style={{ width: '260px', minHeight: '150px' }}
      >
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
            networkActive ? 'opacity-100' : 'opacity-0'
          }`}
          viewBox="0 0 260 150"
        >
          <line
            x1="90"
            y1="105"
            x2="175"
            y2="105"
            stroke="#EF5A2A"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="opacity-60"
          />
          <circle cx="175" cy="105" r="2" fill="#EF5A2A" />
          <circle cx="90" cy="105" r="2" fill="#EF5A2A" />
        </svg>

        <div className="relative z-10 flex items-end justify-between h-full pt-1">
          <motion.div
            style={{
              x: springX,
              y: springY,
              rotate: springRotate,
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <NexusPenguinSprite
              frame={currentFrame}
              scale={3.2}
              className="filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
            />
          </motion.div>

          <div className="flex flex-col items-end text-right space-y-1 pb-1 pointer-events-none">
            <span className="font-mono text-[9px] text-[#F3EEE5]/40 tracking-widest uppercase">
              STATUS
            </span>
            <span className="font-dosis font-bold text-xs text-[#F3EEE5] tracking-wider uppercase">
              {isDragging ? 'RESISTING' : networkActive ? 'LINKED' : 'STANDBY'}
            </span>
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 h-[1px] bg-[rgba(243,238,229,0.15)] pointer-events-none" />
      </div>
    </div>
  );
};
