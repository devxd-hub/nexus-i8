/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface NexusOrbitingSparkleProps {
  /**
   * Reference to the 02 Collaboration row to link settling scroll motion
   */
  rowRef: React.RefObject<HTMLElement | null>;
}

/**
 * NexusOrbitingSparkle
 *
 * Micro-interaction beside "02 / COLLABORATION" on the About page.
 * Uses exact supplied SVG geometry, traced sparkle path, and orbiting circle
 * with animateTransform (8s rotation, reduced to 40s on prefers-reduced-motion).
 * NEXUS colors:
 * --beige / fill: #F3EEE5
 * --ink: #0A0A09
 */
export const NexusOrbitingSparkle: React.FC<NexusOrbitingSparkleProps> = ({ rowRef }) => {
  const shouldReduceMotion = useReducedMotion();

  // Gentle settling scroll progress when Collaboration enters viewport
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start 90%', 'center 45%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Subtle settling transform matching pinwheel drift
  const translateY = useTransform(smoothProgress, [0, 1], [0, 16]);
  const translateX = useTransform(smoothProgress, [0, 1], [0, 8]);

  const duration = shouldReduceMotion ? '40s' : '8s';

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
      className="nexus-collaboration-sparkle relative inline-flex items-center justify-start z-20 pointer-events-auto select-none will-change-transform"
      aria-hidden="true"
    >
      <div
        title="Orbiting Sparkle"
        className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 transition-transform duration-300 hover:scale-[1.04]"
      >
        <svg
          viewBox="-100 -100 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block text-[var(--text-primary)] overflow-visible"
        >
          <defs>
            {/* Single mathematically uniform petal in top-right quadrant */}
            <path
              id="nexus-sparkle-petal"
              fill="currentColor"
              d="M 4 -46
                 L 4 -86
                 Q 4 -88, 7 -87
                 L 87 -7
                 Q 88 -4, 86 -4
                 L 46 -4
                 C 20 -4, 4 -20, 4 -46 Z"
            />
          </defs>

          {/* 4-fold rotational symmetry: 100% identical petals at 0°, 90°, 180°, 270° */}
          <g>
            <use href="#nexus-sparkle-petal" />
            <use href="#nexus-sparkle-petal" transform="rotate(90)" />
            <use href="#nexus-sparkle-petal" transform="rotate(180)" />
            <use href="#nexus-sparkle-petal" transform="rotate(270)" />
          </g>

          {/* Orbiting dot passing cleanly through the center of each petal */}
          <circle cx="0" cy="-42" r="8.5" fill="var(--bg-primary)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur={duration}
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </motion.div>
  );
};

export default NexusOrbitingSparkle;
