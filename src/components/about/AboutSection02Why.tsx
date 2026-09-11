/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EditorialWordReveal } from './EditorialWordReveal.tsx';

/**
 * 02 — WHY NEXUS EXISTS
 * Large typographic thesis with word reveal + restrained supporting copy with ample breathing room.
 */
export const AboutSection02Why: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="about-why"
      aria-labelledby="about-why-title"
      className="w-full py-24 md:py-36 lg:py-44 border-b border-[#0A0A09]/10"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Section Label */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="font-dosis uppercase text-xs md:text-sm tracking-[0.24em] text-[#EF5A2A] font-semibold">
            02 / WHY NEXUS EXISTS
          </span>
        </motion.div>

        {/* Large Statement + Supporting Text Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Main Statement (7 cols) with Word Reveal */}
          <div className="lg:col-span-7">
            <EditorialWordReveal
              id="about-why-title"
              as="h2"
              text="GOOD IDEAS SHOULDN’T STAY IDEAS."
              className="font-fraunces text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0A0A09] leading-[1.0]"
              delay={0.1}
              stagger={0.045}
            />
          </div>

          {/* Supporting Statement (5 cols) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 lg:pt-3 space-y-6 max-w-xl"
          >
            <p className="font-bitter text-lg sm:text-xl text-[#0A0A09] leading-relaxed">
              Every campus has notebooks filled with sketches, dorm room conversations full of ambition, and side projects that stall in isolation.
            </p>
            <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed">
              NEXUS exists to provide the shared space, peer momentum, and technical feedback loop required to pull work out of theory and into physical or digital reality.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection02Why;
