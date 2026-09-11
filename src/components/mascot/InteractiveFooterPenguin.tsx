/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { NexusPenguinSprite } from './NexusPenguinSprite.tsx';
import { PenguinFrameKey } from './penguinData.ts';

interface InteractiveFooterPenguinProps {
  className?: string;
  scale?: number;
}

/**
 * InteractiveFooterPenguin
 *
 * Pure, clean interactive mascot:
 * - Natural drag, pull, and elastic spring physics
 * - Dynamic struggle, recover, and annoyed expressions
 * - Zero artificial boxes, zero telemetry slop, zero borders
 */
export const InteractiveFooterPenguin: React.FC<InteractiveFooterPenguinProps> = ({
  className = '',
  scale = 2.8,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const characterRef = useRef<HTMLDivElement>(null);

  // States
  const [currentFrame, setCurrentFrame] = useState<PenguinFrameKey>('idle');
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPostDragAnnoyed, setIsPostDragAnnoyed] = useState(false);

  // Drag tracking
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Spring physics for physical drag resistance and snappy settle
  const springConfig = { damping: 22, stiffness: 260, mass: 0.75 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);
  const springRotate = useSpring(0, springConfig);

  const clearTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
  }, []);

  // Idle micro-motions (natural blinks & curious tilts)
  useEffect(() => {
    if (isDragging || isPostDragAnnoyed) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextIdleMotion = () => {
      const delay = 3500 + Math.random() * 2500;

      timeoutId = setTimeout(() => {
        if (!isDragging && !isPostDragAnnoyed) {
          const roll = Math.random();

          if (roll < 0.45) {
            setCurrentFrame('blink');
            const t = setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) {
                setCurrentFrame('idle');
              }
            }, 160);
            animationTimeoutsRef.current.push(t);
          } else if (roll < 0.75) {
            setCurrentFrame('look_right');
            const t = setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) {
                setCurrentFrame('idle');
              }
            }, 750);
            animationTimeoutsRef.current.push(t);
          } else {
            setCurrentFrame('curious');
            const t = setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) {
                setCurrentFrame('idle');
              }
            }, 850);
            animationTimeoutsRef.current.push(t);
          }
        }
        scheduleNextIdleMotion();
      }, delay);
    };

    scheduleNextIdleMotion();

    return () => {
      clearTimeout(timeoutId);
      clearTimeouts();
    };
  }, [isDragging, isPostDragAnnoyed, clearTimeouts]);

  // Pointer Down (Start Drag)
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

  // Pointer Move (Active Drag & Struggle)
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

    const maxHorizontal = 75;
    const maxVerticalUp = -45;
    const maxVerticalDown = 30;

    const clampedX = Math.max(-maxHorizontal, Math.min(maxHorizontal, rawDeltaX * 0.68));
    const clampedY = Math.max(maxVerticalUp, Math.min(maxVerticalDown, rawDeltaY * 0.68));

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

  // Pointer Up / Cancel (Release -> Settle -> Recover -> Annoyed -> Idle)
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
      setCurrentFrame('look_left');
    }, 1550);

    const t3 = setTimeout(() => {
      setCurrentFrame('idle');
      setIsPostDragAnnoyed(false);
    }, 2100);

    animationTimeoutsRef.current.push(t1, t2, t3);
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
      }}
    >
      {/* Mascot Penguin Container */}
      <div className="relative flex items-center justify-center p-2">
        {/* Dynamic Pixel Shadow Underneath */}
        <motion.div
          style={{
            x: springX,
            opacity: isDragging ? 0.3 : 0.65,
            scaleX: isDragging ? 0.75 : 1,
          }}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-[#000000] rounded-full filter blur-[1px] pointer-events-none"
        />

        <motion.div
          ref={characterRef}
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
          } focus:outline-none`}
          title="NEXUS Mascot — Drag & pull"
          aria-label="NEXUS Interactive Mascot Penguin"
        >
          <NexusPenguinSprite
            frame={currentFrame}
            scale={scale}
            className="filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveFooterPenguin;
