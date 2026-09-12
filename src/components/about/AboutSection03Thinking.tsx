/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { NexusCuriosityPinwheel } from './NexusCuriosityPinwheel.tsx';
import { NexusOrbitingSparkle } from './NexusOrbitingSparkle.tsx';
import { NexusReversePinwheel } from './NexusReversePinwheel.tsx';

/**
 * 03 — HOW WE THINK
 * Four core principles presented purely through large typography, subtle rules, and negative space.
 * Features subtle scroll-driven parallax watermark and staggered appearance.
 */
export const AboutSection03Thinking: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const curiosityRowRef = useRef<HTMLDivElement>(null);
  const collaborationRowRef = useRef<HTMLDivElement>(null);
  const experimentationRowRef = useRef<HTMLDivElement>(null);
  const craftRowRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const principles = [
    {
      number: '01',
      name: 'CURIOSITY',
      tagline: 'Ask better questions.',
    },
    {
      number: '02',
      name: 'COLLABORATION',
      tagline: 'Find people who think differently.',
    },
    {
      number: '03',
      name: 'EXPERIMENTATION',
      tagline: 'Build before everything is figured out.',
    },
    {
      number: '04',
      name: 'CRAFT',
      tagline: 'Make it worth sharing.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about-thinking"
      aria-labelledby="about-thinking-title"
      className="w-full py-12 sm:py-16 md:py-20 border-b border-[#0A0A09]/10 relative overflow-hidden"
    >
      {/* Subtle Scroll Parallax Watermark */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: watermarkY }}
        className="absolute -right-6 md:right-10 top-12 font-fraunces text-8xl sm:text-9xl md:text-[14rem] lg:text-[18rem] font-bold text-[#0A0A09]/[0.035] select-none pointer-events-none will-change-transform leading-none z-0"
        aria-hidden="true"
      >
        03
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
            03 / HOW WE THINK
          </span>
          <h2 id="about-thinking-title" className="sr-only">
            How We Think — Core Principles
          </h2>
        </motion.div>

        {/* Typographic Matrix with Staggered Entrance */}
        <div className="space-y-0 divide-y divide-[#0A0A09]/15">
          {principles.map((p, idx) => {
            const rowPadding =
              idx === 1
                ? 'pt-8 sm:pt-10 md:pt-12 pb-14 sm:pb-16 md:pb-20'
                : idx === 2
                ? 'py-14 sm:py-16 md:py-20'
                : idx === 3
                ? 'pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-10 md:pb-12'
                : 'py-8 sm:py-10 md:py-12';

            return (
                <motion.div
                  key={p.name}
                  ref={
                    idx === 0
                      ? curiosityRowRef
                      : idx === 1
                      ? collaborationRowRef
                      : idx === 2
                      ? experimentationRowRef
                      : idx === 3
                      ? craftRowRef
                      : undefined
                  }
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                  transition={{
                    duration: 0.75,
                    delay: idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`${rowPadding} grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 relative items-center`}
                >
              {/* Index marker (Curiosity Pinwheel, Collaboration Orbiting Sparkle, Experimentation Reverse Pinwheel, Craft Orbiting Sparkle) */}
              <div className="md:col-span-2 relative flex items-center">
                {p.number === '01' ? (
                  <NexusCuriosityPinwheel rowRef={curiosityRowRef} />
                ) : p.number === '02' ? (
                  <NexusOrbitingSparkle rowRef={collaborationRowRef} />
                ) : p.number === '03' ? (
                  <NexusReversePinwheel rowRef={experimentationRowRef} />
                ) : p.number === '04' ? (
                  <NexusOrbitingSparkle rowRef={craftRowRef} />
                ) : (
                  <span className="font-dosis font-bold text-xs md:text-sm tracking-[0.28em] text-[#EF5A2A]">
                    {p.number}
                  </span>
                )}
              </div>

              {/* Principle Name */}
              <div className="md:col-span-5">
                <h3 className="font-fraunces text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A09]">
                  {p.name}
                </h3>
              </div>

              {/* Tagline / Statement */}
              <div className="md:col-span-5 md:text-right lg:text-left">
                <p className="font-bitter italic text-xl sm:text-2xl md:text-2xl text-[#66615A] leading-snug">
                  {p.tagline}
                </p>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection03Thinking;
