/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface NexusCuriosityPinwheelProps {
  /**
   * Reference to the Curiosity section row element to track scroll progress
   */
  rowRef: React.RefObject<HTMLElement | null>;
}

/**
 * NexusCuriosityPinwheel
 *
 * Micro-interaction beside "01 / CURIOSITY" on the About page.
 * Uses exact supplied SVG geometry and spinTick timing.
 * Outer wrapper moves down and slightly left toward CURIOSITY as the row enters the viewport.
 */
export const NexusCuriosityPinwheel: React.FC<NexusCuriosityPinwheelProps> = ({ rowRef }) => {
  const shouldReduceMotion = useReducedMotion();
  const [burstCount, setBurstCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Track scroll progress specifically for the Curiosity row
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start 90%', 'center 45%'],
  });

  // Smooth interpolation for fluid bidirectional travel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    restDelta: 0.001,
  });

  // Responsive travel transforms:
  // Subtle smooth drift as the Curiosity row enters
  const translateYDesktop = useTransform(smoothProgress, [0, 1], [0, 16]);
  const translateXDesktop = useTransform(smoothProgress, [0, 1], [0, 8]);

  // Click handler to trigger doJumpSpin burst interaction
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
              x: translateXDesktop,
              y: translateYDesktop,
            }
      }
      className="relative inline-flex items-center justify-start -ml-2 sm:-ml-4 md:-ml-8 lg:-ml-12 z-20 pointer-events-auto select-none will-change-transform"
      aria-hidden="true"
    >
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
        title="NEXUS Pinwheel (Click to spin)"
        className={`nexus-pinwheel-card w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 cursor-pointer rounded-[28px] transition-transform duration-300 ${
          isJumping ? '-translate-y-3.5 scale-105' : 'hover:scale-[1.04]'
        }`}
        style={{
          // NEXUS theme colors
          backgroundColor: '#F3EEE5',
        }}
      >
        <svg
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          className="nexus-pinwheel-svg w-full h-full block"
          style={{
            transformOrigin: '50% 50%',
          }}
        >
          {/* Traced pinwheel, recentered so the hole sits at (150,150) */}
          <g transform="translate(12.375,11.936)">
            <g transform="translate(-42.691553,319.297052) scale(0.1,-0.1)">
              <path
                fill="#0A0A09"
                d="M1717 3188 c-221 -26 -418 -165 -522 -370 -39 -76 -75 -195 -75 -250 0 -20 -4 -39 -8 -42 -5 -3 -66 53 -138 125 -71 71 -134 129 -141 129 -19 0 -97 -104 -132 -177 -50 -102 -65 -173 -66 -308 0 -176 41 -296 145 -426 l51 -64 -194 -3 c-142 -2 -198 -6 -205 -15 -13 -15 2 -138 25 -206 61 -183 188 -329 358 -411 69 -34 171 -61 265 -72 21 -3 10 -18 -108 -138 -72 -74 -132 -141 -132 -147 0 -19 95 -90 170 -128 91 -46 161 -65 265 -72 167 -10 310 32 452 134 l73 52 2 -192 3 -192 34 -3 c50 -5 177 26 256 63 222 102 368 308 401 563 l7 54 139 -139 139 -138 36 40 c49 57 108 159 134 235 31 90 38 269 15 373 -22 97 -70 196 -135 277 l-52 65 203 5 203 5 3 31 c4 39 -20 153 -47 224 -43 113 -157 252 -269 326 -70 47 -200 94 -279 101 -35 3 -66 10 -70 16 -3 5 54 69 128 143 153 154 151 138 29 219 -125 83 -234 116 -385 116 -162 0 -291 -44 -420 -141 l-65 -49 0 193 c0 146 -3 195 -12 198 -7 2 -43 0 -81 -4z m164 -1234 c90 -46 116 -169 52 -245 -98 -116 -293 -49 -293 101 0 84 49 143 132 159 46 9 68 6 109 -15z"
              />
            </g>
          </g>
        </svg>
      </div>

      <style>{`
        .nexus-pinwheel-svg {
          animation: nexusSpinTick 2.6s infinite ease-in-out;
        }
        @keyframes nexusSpinTick {
          0%      { transform: rotate(0deg); }
          61.538% { transform: rotate(360deg); }
          100%    { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nexus-pinwheel-svg {
            animation-duration: 13s;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default NexusCuriosityPinwheel;
