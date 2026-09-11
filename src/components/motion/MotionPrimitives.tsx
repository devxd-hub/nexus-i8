/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  staggerMs?: number;
  delayMs?: number;
}

/**
 * Editorial headline text reveal.
 * Splits text into words with staggered translateY, opacity, and subtle blur.
 * Uses primary easing: cubic-bezier(.16, 1, .3, 1)
 */
export const RevealText: React.FC<RevealTextProps> = ({
  children,
  className = '',
  as: Component = 'h1',
  staggerMs = 50,
  delayMs = 100,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = children.split(' ');

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerMs / 1000,
        delayChildren: delayMs / 1000,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        className="inline-block"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={containerVariants}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className="inline-block mr-[0.26em] whitespace-nowrap"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

/**
 * Progressive viewport entrance reveal for major sections.
 * Uses cubic-bezier(.16, 1, .3, 1) easing with no bounce/elasticity.
 */
export const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  className = '',
  id,
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.section>
  );
};

interface OrangeThreadProps {
  className?: string;
}

/**
 * ORANGE THREAD MOTIF
 * Represents IDEA → PEOPLE → PROJECT.
 * Minimal, thin (1.5px), elegant SVG curve crossing behind the hero and moving downward.
 * No neon, no glow, pure restrained graphic precision.
 */
export const OrangeThread: React.FC<OrangeThreadProps> = ({ className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  // Curvature coordinates designed for balanced vertical composition:
  // Starts high (y=38) near top-left, curves gently across, crosses behind NEXUS centerpiece at y=168,
  // then loops down under the description (y=420) and exits towards the process section.
  const trajectoryPath =
    'M -40 38 C 160 34, 360 38, 520 108 C 600 144, 660 168, 720 168 C 780 168, 840 144, 920 108 C 1080 38, 1280 34, 1480 38 C 1320 220, 880 340, 720 420 C 630 465, 720 560, 720 700';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      <svg
        viewBox="0 0 1440 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        {/* Architectural hairline guide ticks at top border margin alignments */}
        <line x1="120" y1="0" x2="120" y2="14" stroke="rgba(10, 10, 9, 0.12)" strokeWidth="1" />
        <line x1="1320" y1="0" x2="1320" y2="14" stroke="rgba(10, 10, 9, 0.12)" strokeWidth="1" />

        {/* Subtle background track */}
        <path
          d={trajectoryPath}
          stroke="rgba(239, 90, 42, 0.12)"
          strokeWidth="1"
          fill="none"
        />

        {/* Active animated thread with restrained elegance */}
        <motion.path
          d={trajectoryPath}
          stroke="#EF5A2A"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
          fill="none"
          initial={
            shouldReduceMotion
              ? { pathLength: 1, opacity: 0.6 }
              : { pathLength: 0.18, pathOffset: 0, opacity: 0.65 }
          }
          animate={
            shouldReduceMotion
              ? {}
              : {
                  pathOffset: [0, 1],
                  opacity: [0.55, 0.8, 0.55],
                }
          }
          transition={{
            duration: 18,
            ease: 'linear',
            repeat: Infinity,
          }}
        />

        {/* Intersection marker nodes representing IDEA → PEOPLE → PROJECT */}
        <g opacity="0.85">
          {/* Node 1: Atmosphere & entry cue, positioned cleanly in upper area */}
          <circle cx="180" cy="36" r="2.5" fill="#EF5A2A" />
          <circle
            cx="180"
            cy="36"
            r="6"
            stroke="#EF5A2A"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            fill="none"
            opacity="0.6"
          />

          {/* Node 2: Behind Hero / Central Nexus wordmark */}
          <circle cx="720" cy="168" r="3.5" fill="#EF5A2A" />
          <circle
            cx="720"
            cy="168"
            r="8"
            stroke="#EF5A2A"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            fill="none"
          />

          {/* Node 3: Downstream transition toward projects */}
          <circle cx="720" cy="420" r="2.5" fill="#EF5A2A" />
        </g>
      </svg>
    </div>
  );
};
