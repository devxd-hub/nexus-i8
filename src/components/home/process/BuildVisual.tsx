/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface BuildVisualProps {
  isActive: boolean;
}

export const BuildVisual: React.FC<BuildVisualProps> = ({ isActive }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full h-[190px] sm:h-[210px] bg-[#EBE5DB]/50 border border-[rgba(10,10,9,0.1)] p-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Blueprint Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="build-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke="rgba(10,10,9,0.04)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#build-grid)" />
      </svg>

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-dosis tracking-[0.2em] text-[#66615A] uppercase border-b border-[rgba(10,10,9,0.08)] pb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
          SYSTEM SYNTHESIS & SPRINT
        </span>
        <span className="text-[#0A0A09]/60 font-mono text-[9px]">CYCLE: ITERATION 04</span>
      </div>

      {/* Main SVG Blueprint Assembly Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1">
        <svg
          viewBox="0 0 280 145"
          className="w-full h-full max-h-[140px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Calibrated Bounding Box */}
          <rect
            x="40"
            y="20"
            width="200"
            height="105"
            stroke="rgba(10,10,9,0.15)"
            strokeWidth="0.75"
            strokeDasharray="4 4"
          />

          {/* Corner Crosshairs */}
          {['40,20', '240,20', '40,125', '240,125'].map((coords, i) => {
            const [cx, cy] = coords.split(',').map(Number);
            return (
              <g key={`cross-${i}`}>
                <line
                  x1={cx - 4}
                  y1={cy}
                  x2={cx + 4}
                  y2={cy}
                  stroke="#EF5A2A"
                  strokeWidth="1"
                />
                <line
                  x1={cx}
                  y1={cy - 4}
                  x2={cx}
                  y2={cy + 4}
                  stroke="#EF5A2A"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Dimension indicator lines */}
          <line
            x1="40"
            y1="135"
            x2="240"
            y2="135"
            stroke="rgba(10,10,9,0.25)"
            strokeWidth="0.75"
          />
          <line
            x1="40"
            y1="132"
            x2="40"
            y2="138"
            stroke="rgba(10,10,9,0.3)"
            strokeWidth="0.75"
          />
          <line
            x1="240"
            y1="132"
            x2="240"
            y2="138"
            stroke="rgba(10,10,9,0.3)"
            strokeWidth="0.75"
          />
          <text
            x="140"
            y="141"
            textAnchor="middle"
            className="font-mono text-[7.5px] fill-[#0A0A09]/50"
          >
            MODULAR BOUNDARY: 200 × 105 DP
          </text>

          {/* Component 1: Foundation Base Block */}
          <motion.rect
            x="55"
            y="75"
            width="80"
            height="38"
            fill="rgba(10,10,9,0.06)"
            stroke={isActive ? '#0A0A09' : 'rgba(10,10,9,0.25)'}
            strokeWidth="1.2"
            initial={{ opacity: 0.8, y: 0 }}
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    x: [55, 58, 55],
                  }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <text
            x="95"
            y="98"
            textAnchor="middle"
            className="font-dosis font-bold text-[8.5px] tracking-[0.12em] fill-[#0A0A09]/70 uppercase"
          >
            CORE SYSTEM
          </text>

          {/* Component 2: Interface / Logic Upper Block */}
          <motion.rect
            x="145"
            y="32"
            width="82"
            height="42"
            fill="rgba(239,90,42,0.06)"
            stroke={isActive ? '#EF5A2A' : 'rgba(10,10,9,0.25)'}
            strokeWidth="1.2"
            initial={{ opacity: 0.8 }}
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    y: [32, 35, 32],
                  }
            }
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <text
            x="186"
            y="56"
            textAnchor="middle"
            className="font-dosis font-bold text-[8.5px] tracking-[0.12em] fill-[#EF5A2A] uppercase"
          >
            PROTOTYPE v1.2
          </text>

          {/* Component 3: Connecting Alignment Bar */}
          <motion.rect
            x="125"
            y="65"
            width="32"
            height="20"
            fill="#EBE5DB"
            stroke="#0A0A09"
            strokeWidth="1"
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    scale: [0.97, 1.03, 0.97],
                  }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '141px', originY: '75px' }}
          />
          <line
            x1="125"
            y1="75"
            x2="157"
            y2="75"
            stroke="#EF5A2A"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Architectural Alignment Guides */}
          <line
            x1="95"
            y1="20"
            x2="95"
            y2="125"
            stroke="rgba(10,10,9,0.08)"
            strokeWidth="0.75"
            strokeDasharray="2 3"
          />
          <line
            x1="186"
            y1="20"
            x2="186"
            y2="125"
            stroke="rgba(10,10,9,0.08)"
            strokeWidth="0.75"
            strokeDasharray="2 3"
          />
        </svg>
      </div>

      {/* Utility Tags Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-dosis tracking-[0.16em] text-[#0A0A09]/80 border-t border-[rgba(10,10,9,0.08)] pt-1.5 font-semibold">
        <span>PROTOTYPE</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>TEST</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>ITERATE</span>
      </div>
    </div>
  );
};
