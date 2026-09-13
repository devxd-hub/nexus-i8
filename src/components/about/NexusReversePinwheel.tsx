/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface NexusReversePinwheelProps {
  /**
   * Reference to the 03 Experimentation row to link settling scroll motion
   */
  rowRef?: React.RefObject<HTMLElement | null>;
}

/**
 * NexusReversePinwheel
 *
 * Micro-interaction beside "03 / EXPERIMENTATION" on the About page.
 * Uses exact supplied SVG geometry, traced reverse pinwheel path, and spinTick animation:
 * 0% { transform: rotate(0deg); }
 * 61.538% { transform: rotate(-360deg); }
 * 100% { transform: rotate(-360deg); }
 * duration: 2.6s (13s on prefers-reduced-motion)
 *
 * Supports interactive tactile jump-spin click burst while maintaining continuous underlying loop.
 * NEXUS colors:
 * fill: #0A0A09 (NEXUS ink)
 * background: #F3EEE5 (NEXUS warm paper)
 */
export const NexusReversePinwheel: React.FC<NexusReversePinwheelProps> = ({ rowRef }) => {
  const shouldReduceMotion = useReducedMotion();
  const [burstCount, setBurstCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start 90%', 'center 45%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Subtle settling transform matching pinwheel & sparkle drift
  const translateY = useTransform(smoothProgress, [0, 1], [0, 16]);
  const translateX = useTransform(smoothProgress, [0, 1], [0, 8]);

  // Click handler to trigger instant tactile jump-spin burst
  const handlePinwheelClick = () => {
    setBurstCount((prev) => prev + 1);
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
    }, 700);
  };

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? undefined
          : {
              x: translateX,
              y: translateY,
            }
      }
      className="nexus-reverse-pinwheel relative inline-flex items-center justify-start z-20 pointer-events-auto select-none will-change-transform"
      aria-hidden="true"
    >
      <style>{`
        @keyframes nexusSpinTickReverse {
          0%      { transform: rotate(0deg); }
          61.538% { transform: rotate(-360deg); }
          100%    { transform: rotate(-360deg); }
        }
        .nexus-reverse-pinwheel-svg {
          transform-origin: 50% 50%;
          animation: nexusSpinTickReverse 2.6s infinite ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .nexus-reverse-pinwheel-svg {
            animation-duration: 13s;
          }
        }
      `}</style>
      <div
        onClick={handlePinwheelClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePinwheelClick();
          }
        }}
        title="Spinning Pinwheel (Reverse - Click to burst spin)"
        className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 cursor-pointer transition-transform duration-300 aspect-square flex items-center justify-center ${
          isJumping ? '-translate-y-3.5 scale-105' : 'hover:scale-[1.04]'
        }`}
      >
        <svg
          key={`burst-${burstCount}`}
          viewBox="-20 -20 340 340"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block nexus-reverse-pinwheel-svg text-[var(--text-primary)] overflow-visible"
        >
          {/* traced pinwheel, recentered so the hole sits at (150,150) */}
          <g transform="translate(12.375,11.936)">
            <g transform="translate(-42.691553,319.297052) scale(0.1,-0.1)">
              <path
                fill="currentColor"
                d="M1717 3188 c-221 -26 -418 -165 -522 -370 -39 -76 -75 -195 -75 -250 0 -20 -4 -39 -8 -42 -5 -3 -66 53 -138 125 -71 71 -134 129 -141 129 -19 0 -97 -104 -132 -177 -50 -102 -65 -173 -66 -308 0 -176 41 -296 145 -426 l51 -64 -194 -3 c-142 -2 -198 -6 -205 -15 -13 -15 2 -138 25 -206 61 -183 188 -329 358 -411 69 -34 171 -61 265 -72 21 -3 10 -18 -108 -138 -72 -74 -132 -141 -132 -147 0 -19 95 -90 170 -128 91 -46 161 -65 265 -72 167 -10 310 32 452 134 l73 52 2 -192 3 -192 34 -3 c50 -5 177 26 256 63 222 102 368 308 401 563 l7 54 139 -139 139 -138 36 40 c49 57 108 159 134 235 31 90 38 269 15 373 -22 97 -70 196 -135 277 l-52 65 203 5 203 5 3 31 c4 39 -20 153 -47 224 -43 113 -157 252 -269 326 -70 47 -200 94 -279 101 -35 3 -66 10 -70 16 -3 5 54 69 128 143 153 154 151 138 29 219 -125 83 -234 116 -385 116 -162 0 -291 -44 -420 -141 l-65 -49 0 193 c0 146 -3 195 -12 198 -7 2 -43 0 -81 -4z m164 -1234 c90 -46 116 -169 52 -245 -98 -116 -293 -49 -293 101 0 84 49 143 132 159 46 9 68 6 109 -15z"
              />
            </g>
          </g>
        </svg>
      </div>
    </motion.div>
  );
};

export default NexusReversePinwheel;
