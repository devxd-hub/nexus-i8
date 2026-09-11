/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ShareVisualProps {
  isActive: boolean;
}

export const ShareVisual: React.FC<ShareVisualProps> = ({ isActive }) => {
  const shouldReduceMotion = useReducedMotion();

  // Outward radiating rays into community
  const outboundVectors = [
    { angle: 0, length: 110, label: 'EXHIBIT' },
    { angle: 45, length: 90, label: 'DOCS' },
    { angle: 90, length: 60, label: 'CRIT' },
    { angle: 135, length: 90, label: 'REPO' },
    { angle: 180, length: 110, label: 'COMMUNITY' },
    { angle: 225, length: 75, label: 'PEERS' },
    { angle: 270, length: 55, label: 'FEEDBACK' },
    { angle: 315, length: 85, label: 'ARCHIVE' },
  ];

  return (
    <div className="relative w-full h-[190px] sm:h-[210px] bg-[#EBE5DB]/50 border border-[rgba(10,10,9,0.1)] p-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Radiating Field */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="share-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="rgba(10,10,9,0.05)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#share-dots)" />
      </svg>

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-dosis tracking-[0.2em] text-[#66615A] uppercase border-b border-[rgba(10,10,9,0.08)] pb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
          OPEN DISSEMINATION & LOOP CLOSURE
        </span>
        <span className="text-[#EF5A2A] font-mono text-[9px] font-bold">↺ RECIRCULATING</span>
      </div>

      {/* Main SVG Knowledge Diffusion Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1">
        <svg
          viewBox="0 0 280 145"
          className="w-full h-full max-h-[140px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric Knowledge Diffusion Ripple Waves */}
          {[32, 54, 76, 98].map((radius, i) => (
            <motion.circle
              key={`ripple-${i}`}
              cx="140"
              cy="75"
              r={radius}
              stroke={isActive ? 'rgba(239,90,42,0.22)' : 'rgba(10,10,9,0.08)'}
              strokeWidth="0.75"
              strokeDasharray={i % 2 === 0 ? '3 3' : undefined}
              initial={{ opacity: 0.2 }}
              animate={
                shouldReduceMotion || !isActive
                  ? { opacity: 0.3 }
                  : {
                      opacity: [0.15, 0.45, 0.15],
                      scale: [0.98, 1.03, 0.98],
                    }
              }
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
              style={{ originX: '140px', originY: '75px' }}
            />
          ))}

          {/* Outward Radiating Transmission Vectors */}
          {outboundVectors.map((v, idx) => {
            const rad = (v.angle * Math.PI) / 180;
            const x2 = 140 + Math.cos(rad) * v.length;
            const y2 = 75 + Math.sin(rad) * (v.length * 0.65); // slight aspect flattening
            return (
              <g key={`vector-${idx}`}>
                <motion.line
                  x1="140"
                  y1="75"
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? 'rgba(239,90,42,0.35)' : 'rgba(10,10,9,0.1)'}
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  initial={{ pathLength: 0.3 }}
                  animate={
                    shouldReduceMotion || !isActive
                      ? { pathLength: 1 }
                      : { pathLength: [0.3, 1, 0.5], opacity: [0.2, 0.8, 0.2] }
                  }
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    delay: idx * 0.15,
                    ease: 'easeInOut',
                  }}
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r="1.5"
                  fill={isActive ? '#EF5A2A' : 'rgba(10,10,9,0.3)'}
                />
              </g>
            );
          })}

          {/* LOOP RECIRCULATION TRAJECTORY: Curves from bottom-right back up toward top-left */}
          <motion.path
            d="M 235 95 C 265 125, 220 142, 140 138 C 60 134, 25 110, 35 60 C 42 28, 90 20, 125 35"
            stroke="#EF5A2A"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            fill="none"
            initial={{ opacity: 0.4 }}
            animate={
              shouldReduceMotion || !isActive
                ? { opacity: 0.5 }
                : {
                    opacity: [0.35, 0.9, 0.35],
                  }
            }
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Loop Return Indicator Arrow */}
          <polygon
            points="128,31 133,37 124,39"
            fill="#EF5A2A"
          />

          <text
            x="140"
            y="132"
            textAnchor="middle"
            className="font-dosis font-bold text-[8px] tracking-[0.18em] fill-[#EF5A2A] uppercase"
          >
            CYCLE COMPLETION → SEEDS NEW QUESTION 01
          </text>

          {/* Central Exhibition Source Node */}
          <circle
            cx="140"
            cy="75"
            r="8"
            fill="#EBE5DB"
            stroke="#0A0A09"
            strokeWidth="1.25"
          />
          <motion.circle
            cx="140"
            cy="75"
            r="4"
            fill="#EF5A2A"
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    scale: [1, 1.4, 1],
                  }
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '140px', originY: '75px' }}
          />
        </svg>
      </div>

      {/* Utility Tags Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-dosis tracking-[0.16em] text-[#0A0A09]/80 border-t border-[rgba(10,10,9,0.08)] pt-1.5 font-semibold">
        <span>EXHIBIT</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>DOCUMENT</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>OPEN KNOWLEDGE</span>
      </div>
    </div>
  );
};
