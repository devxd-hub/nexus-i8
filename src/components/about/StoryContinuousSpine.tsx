/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useTransform } from 'motion/react';
import { useStoryScroll } from './ScrollStoryContext.tsx';

export const StoryContinuousSpine: React.FC = () => {
  const { smoothProgress } = useStoryScroll();

  // Map progress to path length and subtle glowing anchor nodes
  const pathLength = useTransform(smoothProgress, [0, 1], [0.02, 1]);
  const spineOpacity = useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0.4, 0.85, 0.85, 0.5]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 left-0 right-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Background Architectural Grid Lines Along Editorial Margins */}
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 w-[1px] bg-[rgba(10,10,9,0.04)]" />
        <div className="absolute right-4 sm:right-6 lg:right-8 top-0 bottom-0 w-[1px] bg-[rgba(10,10,9,0.04)]" />

        {/* Dynamic Continuous Orange Narrative Thread */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 1000"
        >
          {/* Subtle Background Guide Track */}
          <path
            d="M 50 0 Q 52 120, 48 240 T 52 480 T 48 720 T 50 1000"
            fill="none"
            stroke="rgba(10,10,9,0.05)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Active Ink Thread Drawn by Scroll Progress */}
          <motion.path
            d="M 50 0 Q 52 120, 48 240 T 52 480 T 48 720 T 50 1000"
            fill="none"
            stroke="#EF5A2A"
            strokeWidth="1.25"
            strokeDasharray="4 2"
            strokeLinecap="round"
            style={{
              pathLength,
              opacity: spineOpacity,
            }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};
