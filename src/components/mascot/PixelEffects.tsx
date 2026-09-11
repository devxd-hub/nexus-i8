/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PIXEL_HEART, PENGUIN_COLORS } from './penguinData.ts';

interface ParticleProps {
  id?: string | number;
  delay?: number;
  startX?: number;
  startY?: number;
  driftX?: number;
  scale?: number;
}

const PIXEL_STAR: string[] = [
  "...O...",
  "..OOO..",
  "OOOOOOO",
  ".OOOOO.",
  "..OOO..",
  ".OO.OO.",
  "O.....O",
];

const PIXEL_SNACK: string[] = [
  "..OOO..",
  ".OOOOO.",
  "OOOOOOO",
  "LLOOOLL",
  ".OOOOO.",
  "..O.O..",
  "...O...",
];

export const PixelHeartParticle: React.FC<ParticleProps> = ({
  delay = 0,
  startX = 0,
  startY = 0,
  driftX = 0,
  scale = 2.5,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: startX,
        y: startY,
        scale: 0.4,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: startX + driftX,
        y: startY - 50,
        scale: [0.4, 1.2, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut',
      }}
      className="absolute pointer-events-none select-none z-30"
      style={{
        width: `${7 * scale}px`,
        height: `${7 * scale}px`,
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 7 7"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        style={{ display: 'block', imageRendering: 'pixelated' }}
      >
        {PIXEL_HEART.map((row, y) =>
          row.split('').map((char, x) => {
            if (char === '.') return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={PENGUIN_COLORS[char] || '#EF5A2A'}
              />
            );
          })
        )}
      </svg>
    </motion.div>
  );
};

export const PixelStarParticle: React.FC<ParticleProps> = ({
  delay = 0,
  startX = 0,
  startY = 0,
  driftX = 0,
  scale = 2.5,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: startX,
        y: startY,
        rotate: 0,
        scale: 0.3,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: startX + driftX,
        y: startY - 45,
        rotate: [0, 45, 90],
        scale: [0.3, 1.1, 1, 0.6],
      }}
      transition={{
        duration: 1.6,
        delay,
        ease: 'easeOut',
      }}
      className="absolute pointer-events-none select-none z-30"
      style={{
        width: `${7 * scale}px`,
        height: `${7 * scale}px`,
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 7 7"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        style={{ display: 'block', imageRendering: 'pixelated' }}
      >
        {PIXEL_STAR.map((row, y) =>
          row.split('').map((char, x) => {
            if (char === '.') return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={PENGUIN_COLORS[char] || '#EF5A2A'}
              />
            );
          })
        )}
      </svg>
    </motion.div>
  );
};

export const FallingPixelSnack: React.FC<{
  startX: number;
  targetY: number;
  onLand?: () => void;
}> = ({ startX, targetY, onLand }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -30,
        x: startX,
        rotate: -20,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: targetY,
        x: startX + 5,
        rotate: 15,
      }}
      transition={{
        duration: 0.85,
        ease: 'easeIn',
      }}
      onAnimationComplete={onLand}
      className="absolute pointer-events-none select-none z-30"
      style={{
        width: '18px',
        height: '18px',
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 7 7"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        style={{ display: 'block', imageRendering: 'pixelated' }}
      >
        {PIXEL_SNACK.map((row, y) =>
          row.split('').map((char, x) => {
            if (char === '.') return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={PENGUIN_COLORS[char] || '#EF5A2A'}
              />
            );
          })
        )}
      </svg>
    </motion.div>
  );
};
