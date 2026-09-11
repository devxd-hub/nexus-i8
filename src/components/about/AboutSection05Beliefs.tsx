/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EditorialWordReveal } from './EditorialWordReveal.tsx';

/**
 * 05 — WHAT WE BELIEVE
 * Massive typographic conviction with word reveal and ample negative space.
 * Enriched with subtle scroll-driven parallax watermark.
 */
export const AboutSection05Beliefs: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={sectionRef}
      id="about-beliefs"
      aria-labelledby="about-beliefs-title"
      className="w-full py-12 sm:py-16 md:py-20 border-b border-[#0A0A09]/10 relative overflow-hidden"
    >
      {/* Subtle Scroll Parallax Watermark */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: watermarkY }}
        className="absolute -right-6 md:right-10 top-16 font-fraunces text-8xl sm:text-9xl md:text-[14rem] lg:text-[18rem] font-bold text-[#0A0A09]/[0.035] select-none pointer-events-none will-change-transform leading-none z-0"
        aria-hidden="true"
      >
        05
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 relative z-10">
        {/* Section Label */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-10"
        >
          <span className="font-dosis uppercase text-xs md:text-sm tracking-[0.24em] text-[#EF5A2A] font-semibold">
            05 / WHAT WE BELIEVE
          </span>
        </motion.div>

        {/* Large Typographic Conviction */}
        <div className="space-y-8 md:space-y-10 max-w-4xl">
          <EditorialWordReveal
            id="about-beliefs-title"
            as="h2"
            text="START BEFORE YOU ARE READY."
            className="font-fraunces text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-[#0A0A09] leading-[0.98]"
            delay={0.1}
            stagger={0.045}
          />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed">
              Waiting for complete clarity is a delay tactic. The most valuable insights, skills, and partnerships are discovered in the middle of building—not before.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection05Beliefs;
