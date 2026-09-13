/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PIXEL_HEART, PENGUIN_COLORS } from './penguinData.ts';

interface PixelHeartProps {
  delay?: number;
  startX?: number;
  startY?: number;
  driftX?: number;
  scale?: number;
}

/**
 * 7x7 Crisp Pixel-Art Heart
 * Spawns with gentle scale-in, upward organic float, horizontal drift, and soft fade.
 */
export const PixelHeart: React.FC<PixelHeartProps> = ({
  delay = 0,
  startX = 0,
  startY = 0,
  driftX = 0,
  scale = 2,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: startX,
        y: startY,
        scale: 0.3,
      }}
      animate={{
        opacity: [0, 0.95, 0.95, 0],
        x: [startX, startX + driftX * 0.4, startX + driftX],
        y: [startY, startY - 24, startY - 50],
        scale: [0.3, 1.05, 1, 0.8],
      }}
      transition={{
        duration: 2.0,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute pointer-events-none select-none z-40"
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
