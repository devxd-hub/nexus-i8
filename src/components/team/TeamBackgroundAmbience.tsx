/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * TeamBackgroundAmbience
 *
 * Subtle, sophisticated ambient canvas motion for the Team Page:
 * - Ultra-soft drifting warm light pools (orange & warm stone)
 * - Gentle ambient architectural grid movement
 * - Zero distraction, 100% accessible with reduced-motion support
 */
export const TeamBackgroundAmbience: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#EF5A2A]/03 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-[#FFB800]/03 rounded-full filter blur-[90px]" />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Drifting Warm Orb 1 (Top-Right) */}
      <motion.div
        animate={{
          x: [0, 45, -30, 0],
          y: [0, -40, 25, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.035, 0.065, 0.04, 0.035],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[8%] -right-20 w-[550px] h-[550px] rounded-full bg-radial from-[#EF5A2A] to-transparent filter blur-[110px]"
      />

      {/* Drifting Warm Orb 2 (Center-Left) */}
      <motion.div
        animate={{
          x: [0, -50, 35, 0],
          y: [0, 45, -30, 0],
          scale: [1, 1.1, 0.9, 1],
          opacity: [0.03, 0.055, 0.035, 0.03],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[42%] -left-28 w-[600px] h-[600px] rounded-full bg-radial from-[#FFB800] to-transparent filter blur-[120px]"
      />

      {/* Drifting Warm Orb 3 (Bottom-Right) */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -35, 30, 0],
          scale: [0.95, 1.08, 1, 0.95],
          opacity: [0.025, 0.05, 0.03, 0.025],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[15%] right-[5%] w-[480px] h-[480px] rounded-full bg-radial from-[#EF5A2A] to-transparent filter blur-[100px]"
      />

      {/* Subtle Slow Drifting Architectural Blueprint Grid Overlay */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '48px 48px'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0A0A09 1px, transparent 1px),
            linear-gradient(to bottom, #0A0A09 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
