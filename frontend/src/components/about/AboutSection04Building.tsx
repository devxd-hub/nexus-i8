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
      className="w-full py-12 sm:py-16 md:py-20 border-b border-[var(--border-subtle)] relative overflow-hidden bg-[var(--bg-primary)] transition-colors duration-250"
    >
      {/* Subtle Scroll Parallax Watermark */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: watermarkY }}
        className="absolute -right-6 md:right-10 top-12 font-fraunces text-8xl sm:text-9xl md:text-[14rem] lg:text-[18rem] font-bold text-[var(--text-primary)]/[0.03] select-none pointer-events-none will-change-transform leading-none z-0"
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
          <span className="font-dosis uppercase text-xs md:text-sm tracking-[0.24em] text-[#F2613F] font-semibold">
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
                    step.accent ? 'text-[#F2613F]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {step.tag}
                </span>

                <h3 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                  {step.title}
                </h3>

                <p className="font-bitter text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Synthesis Statement */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6 border-t border-[var(--border-subtle)]"
          >
            <p className="font-bitter italic text-lg sm:text-xl md:text-2xl text-[var(--text-primary)]/90 max-w-3xl leading-relaxed">
              &ldquo;Building isn&rsquo;t what happens after thinking. It&rsquo;s how we think.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection04Building;
