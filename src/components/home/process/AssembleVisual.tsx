/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AssembleVisualProps {
  isActive: boolean;
}

export const AssembleVisual: React.FC<AssembleVisualProps> = ({ isActive }) => {
  const shouldReduceMotion = useReducedMotion();

  // 5 disciplinary squad nodes around a central NEXUS point
  const nodes = [
    { id: 'design', label: 'DESIGN', x: 140, y: 35, role: 'CRAFT' },
    { id: 'eng', label: 'ENGINEER', x: 225, y: 70, role: 'CODE' },
    { id: 'research', label: 'RESEARCH', x: 195, y: 135, role: 'INSIGHT' },
    { id: 'product', label: 'PRODUCT', x: 85, y: 135, role: 'STRATEGY' },
    { id: 'hardware', label: 'HARDWARE', x: 55, y: 70, role: 'PHYSICAL' },
  ];

  // Interconnecting mesh lines
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [0, 2],
    [0, 3],
    [1, 4],
  ];

  return (
    <div className="relative w-full h-[190px] sm:h-[210px] bg-[#EBE5DB]/50 border border-[rgba(10,10,9,0.1)] p-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Subtle Tech Dots */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="assemble-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="rgba(10,10,9,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#assemble-dots)" />
      </svg>

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-dosis tracking-[0.2em] text-[#66615A] uppercase border-b border-[rgba(10,10,9,0.08)] pb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
          MULTI-DISCIPLINE MATCHING
        </span>
        <span className="text-[#0A0A09]/60 font-mono text-[9px]">SQUAD: 5/5 LINKED</span>
      </div>

      {/* Main SVG Mesh Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1">
        <svg
          viewBox="0 0 280 155"
          className="w-full h-full max-h-[145px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central Nexus Intersection Guide */}
          <circle
            cx="140"
            cy="88"
            r="28"
            stroke="rgba(239,90,42,0.18)"
            strokeWidth="0.75"
            strokeDasharray="2 3"
          />

          {/* Network Connection Lines */}
          {edges.map(([i1, i2], idx) => {
            const n1 = nodes[i1];
            const n2 = nodes[i2];
            return (
              <motion.line
                key={`edge-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isActive ? 'rgba(239,90,42,0.32)' : 'rgba(10,10,9,0.12)'}
                strokeWidth={isActive ? '1.2' : '0.8'}
                strokeDasharray={idx > 4 ? '3 3' : undefined}
                initial={{ pathLength: 0.3 }}
                animate={
                  shouldReduceMotion
                    ? { pathLength: 1 }
                    : isActive
                    ? { pathLength: [0.4, 1, 0.7], opacity: [0.4, 0.9, 0.6] }
                    : { pathLength: 0.3, opacity: 0.25 }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: idx * 0.1,
                  ease: 'easeInOut',
                }}
              />
            );
          })}

          {/* Lines converging into Central Nexus */}
          {nodes.map((n, idx) => (
            <line
              key={`hub-${idx}`}
              x1={n.x}
              y1={n.y}
              x2="140"
              y2="88"
              stroke="rgba(10,10,9,0.08)"
              strokeWidth="0.75"
              strokeDasharray="2 2"
            />
          ))}

          {/* Central Nexus Core Node */}
          <circle cx="140" cy="88" r="5" fill="#EBE5DB" stroke="#0A0A09" strokeWidth="1" />
          <motion.circle
            cx="140"
            cy="88"
            r="2.5"
            fill="#EF5A2A"
            animate={
              shouldReduceMotion || !isActive
                ? {}
                : {
                    scale: [1, 1.4, 1],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '140px', originY: '88px' }}
          />

          {/* Individual Talent Nodes */}
          {nodes.map((n, idx) => (
            <g key={n.id}>
              {/* Outer halo on active */}
              {isActive && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r="7"
                  stroke="rgba(239,90,42,0.35)"
                  strokeWidth="0.75"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.2 }}
                  style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
                />
              )}

              {/* Node body */}
              <circle
                cx={n.x}
                cy={n.y}
                r="3.5"
                fill={isActive ? '#0A0A09' : 'rgba(10,10,9,0.6)'}
                stroke="#EBE5DB"
                strokeWidth="1"
              />

              {/* Node label */}
              <text
                x={n.x}
                y={n.y > 100 ? n.y + 12 : n.y - 7}
                textAnchor="middle"
                className="font-dosis font-bold text-[8.5px] tracking-[0.14em] fill-[#0A0A09]/75 uppercase"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Utility Tags Footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-dosis tracking-[0.16em] text-[#0A0A09]/80 border-t border-[rgba(10,10,9,0.08)] pt-1.5 font-semibold">
        <span>PEOPLE</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>SKILLS</span>
        <span className="text-[#EF5A2A]">·</span>
        <span>PERSPECTIVES</span>
      </div>
    </div>
  );
};
