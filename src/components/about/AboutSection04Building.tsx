/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

/**
 * 04 — HOW WE BUILD
 * Editorial breakdown of the dialogue between Ideation and Technical Execution.
 * Structured editorial rhythm with staggered progression and scroll-driven parallax watermark.
 */
export const AboutSection04Building: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  const steps = [
    {
      tag: 'STEP 01 / IMAGINATION',
      title: 'Someone imagines it.',
      description: 'A question, an annoyance, or an ambition begins as a napkin sketch or an open conversation.',
      accent: false,
    },
    {
      tag: 'STEP 02 / ENGINEERING',
      title: 'Someone figures out how it works.',
      description: 'Engineers, designers, and tinkerers dismantle the constraints, map the architecture, and write the first tests.',
      accent: false,
    },
    {
      tag: 'STEP 03 / SYNTHESIS',
      title: 'Together they make it real.',
      description: 'Through rapid iteration, feedback, and shared effort, abstract concepts become shipped, functioning tools.',
      accent: true,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about-building"
      aria-labelledby="about-building-title"
      className="w-full py-12 sm:py-16 md:py-20 border-b border-[#0A0A09]/10 relative overflow-hidden"
    >
      {/* Subtle Scroll Parallax Watermark */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: watermarkY }}
        className="absolute -right-6 md:right-10 top-12 font-fraunces text-8xl sm:text-9xl md:text-[14rem] lg:text-[18rem] font-bold text-[#0A0A09]/[0.035] select-none pointer-events-none will-change-transform leading-none z-0"
        aria-hidden="true"
      >
        04
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 relative z-10">
        {/* Section Label */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-12"
        >
          <span className="font-dosis uppercase text-xs md:text-sm tracking-[0.24em] text-[#EF5A2A] font-semibold">
            04 / HOW WE BUILD
          </span>
          <h2 id="about-building-title" className="sr-only">
            How We Build — Ideation and Execution
          </h2>
        </motion.div>

        {/* Editorial Narrative */}
        <div className="space-y-10 md:space-y-14">
          {/* Tri-part Cadence with Stagger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-2">
            {steps.map((step, idx) => (
              <motion.div
                key={step.tag}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                transition={{
                  duration: 0.75,
                  delay: idx * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="space-y-4"
              >
                <span
                  className={`font-dosis font-bold text-xs tracking-[0.26em] uppercase ${
                    step.accent ? 'text-[#EF5A2A]' : 'text-[#66615A]'
                  }`}
                >
                  {step.tag}
                </span>
                <h3 className="font-fraunces text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A09] leading-snug">
                  {step.title}
                </h3>
                <p className="font-bitter text-base text-[#66615A] leading-relaxed pt-2">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Editorial Pull Quote / Synthesis statement */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pt-12 border-t border-[#0A0A09]/10 max-w-3xl"
          >
            <p className="font-fraunces italic text-2xl sm:text-3xl text-[#0A0A09] leading-relaxed">
              We do not treat engineering as downstream of design, nor design as decoration for code. They are equal partners in discovery.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection04Building;
