/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EditorialWordReveal } from './EditorialWordReveal.tsx';

/**
 * 01 — ABOUT NEXUS HERO
 * Clean editorial composition:
 * Left: Massive typography with word reveal.
 * Right: Crisp community pillars and narrative context with balanced negative space.
 */
export const AboutSection01Hero: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const pillars = [
    {
      num: '01',
      title: 'Multidisciplinary by Design',
      desc: 'Bridging engineering, design, science, and the humanities into collaborative project teams.',
    },
    {
      num: '02',
      title: 'Action Over Theory',
      desc: 'Learning through tangible prototyping, rapid iteration, and real-world deployment.',
    },
    {
      num: '03',
      title: 'Open Knowledge & Craft',
      desc: 'Cultivating curiosity, mutual mentorship, and deep pride in work worth sharing.',
    },
  ];

  return (
    <section
      id="about-hero"
      aria-labelledby="about-hero-title"
      className="w-full flex flex-col justify-center py-12 sm:py-16 md:py-20 border-b border-[#0A0A09]/10"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Subtle Section Label */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 md:mb-8"
        >
          <span className="font-dosis uppercase text-xs md:text-sm tracking-[0.24em] text-[#EF5A2A] font-semibold">
            01 / ABOUT NEXUS
          </span>
        </motion.div>

        {/* Two-Axis Composition Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Primary Typography & Restrained Copy (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
            <EditorialWordReveal
              id="about-hero-title"
              as="h2"
              text="WE START WITH QUESTIONS."
              className="font-fraunces text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0A0A09] leading-[0.98]"
              delay={0.15}
              stagger={0.05}
            />

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 max-w-xl"
            >
              <p className="font-bitter text-base sm:text-lg md:text-xl text-[#0A0A09]/85 leading-relaxed">
                NEXUS is a student-led community where ideas become projects through collaboration, experimentation and making.
              </p>
              <p className="font-bitter text-sm sm:text-base text-[#0A0A09]/60 leading-relaxed">
                Students from different disciplines come together to question, design, engineer and build solutions that matter.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Structured Editorial Pillars (5 cols) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col space-y-6 pt-2 lg:pt-3"
          >
            {pillars.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col pb-5 border-b border-[#0A0A09]/10 last:border-b-0 last:pb-0"
              >
                <div className="flex items-baseline space-x-3 mb-1.5">
                  <span className="font-mono text-xs text-[#EF5A2A] font-bold">
                    {item.num}
                  </span>
                  <h3 className="font-fraunces font-semibold text-base sm:text-lg text-[#0A0A09]">
                    {item.title}
                  </h3>
                </div>
                <p className="font-jakarta text-xs sm:text-sm text-[#0A0A09]/60 leading-relaxed pl-7">
                  {item.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection01Hero;
