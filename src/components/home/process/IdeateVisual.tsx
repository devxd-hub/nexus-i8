/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface IdeateVisualProps {
  isActive: boolean;
}

export const IdeateVisual: React.FC<IdeateVisualProps> = ({ isActive }) => {
  const shouldReduceMotion = useReducedMotion();

  // Raw curiosity points distributed across the field
  const rawPoints = [
    { id: 'p1', x: 45, y: 35, targetX: 130, targetY: 82, label: '01.A' },
    { id: 'p2', x: 235, y: 40, targetX: 148, targetY: 84, label: '01.B' },
    { id: 'p3', x: 30, y: 135, targetX: 132, targetY: 96, label: '01.C' },
    { id: 'p4', x: 245, y: 140, targetX: 150, targetY: 94, label: '01.D' },
    { id: 'p5', x: 90, y: 25, targetX: 136, targetY: 80, label: 'INQ' },
    { id: 'p6', x: 195, y: 28, targetX: 144, targetY: 80, label: 'OBS' },
    { id: 'p7', x: 60, y: 155, targetX: 135, targetY: 98, label: 'EXP' },
    { id: 'p8', x: 220, y: 155, targetX: 145, targetY: 98, label: 'HYP' },
  ];

  return (
    <div className="relative w-full h-[190px] sm:h-[210px] bg-[#EBE5DB]/50 border border-[rgba(10,10,9,0.1)] p-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Architectural Coordinate Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ideate-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(10,10,9,0.05)"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ideate-grid)" />
      </svg>

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-dosis tracking-[0.2em] text-[#66615A] uppercase border-b border-[rgba(10,10,9,0.08)] pb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
          IDEA FIELD CONVERGENCE
        </span>
        <span className="text-[#0A0A09]/60 font-mono text-[9px]">FOCUS: 89.4%</span>
      </div>

      {/* Main SVG Convergence Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1">
        <svg
          viewBox="0 0 280 140"
          className="w-full h-full max-h-[140px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Target Focal Crosshairs */}
          <line
            x1="140"
            y1="40"
            x2="140"
            y2="140"
            stroke="rgba(10,10,9,0.12)"
            strokeDasharray="2 3"
            strokeWidth="0.75"
          />
          <line
            x1="80"
            y1="90"
            x2="200"
            y2="90"
            stroke="rgba(10,10,9,0.12)"
            strokeDasharray="2 3"
            strokeWidth="0.75"
          />

          {/* Converging Vectors from raw points toward center (140, 90) */}
          {rawPoints.map((pt, idx) => (
            <g key={pt.id}>
              {/* Converging line */}
              <motion.line
                x1={pt.x}
                y1={pt.y}
                x2={140}
                y2={90}
                stroke={isActive ? 'rgba(239,90,42,0.35)' : 'rgba(10,10,9,0.1)'}
                strokeWidth={isActive ? '1' : '0.75'}
                strokeDasharray="3 3"
                initial={{ pathLength: 0.2, opacity: 0.2 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 0.5, pathLength: 1 }
                    : isActive
                    ? { pathLength: [0.3, 1, 0.8], opacity: [0.3, 0.8, 0.5] }
                    : { pathLength: 0.2, opacity: 0.2 }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: idx * 0.12,
                  ease: 'easeInOut',
                }}
              />

              {/* Raw Curiosity Point */}
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 2.5 : 2}
                fill={isActive ? '#0A0A09' : 'rgba(10,10,9,0.4)'}
                animate={
                  shouldReduceMotion || !isActive
                    ? {}
                    : {
                        cx: [pt.x, (pt.x + 140) / 2, pt.x],
                        cy: [pt.y, (pt.y + 90) / 2, pt.y],
                      }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: idx * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </g>
          ))}

          {/* Focal Concentric Nucleus Rings */}
          <motion.circle
            cx="140"
            cy="90"
            r="16"
            stroke="rgba(239,90,42,0.25)"
            strokeWidth="1"
            strokeDasharray="4 3"
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    scale: [0.95, 1.15, 0.95],
                    rotate: [0, 180, 360],
                  }
            }
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ originX: '140px', originY: '90px' }}
          />

          <circle
            cx="140"
            cy="90"
            r="7"
            fill="#EBE5DB"
            stroke="#0A0A09"
            strokeWidth="1.25"
          />

          {/* Core Orange Seed */}
          <motion.circle
            cx="140"
            cy="90"
            r="3.5"
            fill="#EF5A2A"
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    scale: [1, 1.35, 1],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '140px', originY: '90px' }}
          />
        </svg>
      </div>

      {/* Utility Tags Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-dosis tracking-[0.16em] text-[#0A0A09]/80 border-t border-[rgba(10,10,9,0.08)] pt-1.5 font-semibold">
        <span>QUESTION</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>OBSERVE</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>EXPLORE</span>
      </div>
    </div>
  );
};
