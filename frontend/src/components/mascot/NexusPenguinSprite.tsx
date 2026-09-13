/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PENGUIN_COLORS,
  PENGUIN_FRAMES,
  PenguinFrameKey,
} from './penguinData.ts';

export interface NexusPenguinSpriteProps {
  frame?: PenguinFrameKey;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  ariaHidden?: boolean;
}

/**
 * NEXUS PIXEL-PENGUIN SPRITE
 * Renders the original NEXUS pixel-art penguin mascot with crisp vector pixel rendering.
 *
 * Characteristics:
 * - 16x24 pixel grid rendered via SVG crispEdges / image-rendering: pixelated
 * - Primary colors: Near-black (#151311), Warm cream (#F3EEE5), NEXUS orange (#EF5A2A)
 * - Scalable without blur or antialiasing artifacts
 */
export const NexusPenguinSprite: React.FC<NexusPenguinSpriteProps> = ({
  frame = 'idle',
  scale = 2,
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaHidden = true,
}) => {
  const rows = PENGUIN_FRAMES[frame] || PENGUIN_FRAMES.idle;
  const height = rows.length || 24;
  const width = rows[0]?.length || 20;

  const pixelWidth = width * scale;
  const pixelHeight = height * scale;

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        imageRendering: 'pixelated',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden={ariaHidden}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        style={{
          display: 'block',
          imageRendering: 'pixelated',
        }}
      >
        {rows.map((row, y) =>
          row.split('').map((char, x) => {
            if (char === '.' || !PENGUIN_COLORS[char]) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={PENGUIN_COLORS[char]}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
