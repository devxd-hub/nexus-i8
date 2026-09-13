/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { AppRoute } from '../../types.ts';
import { EditorialWordReveal } from './EditorialWordReveal.tsx';

interface AboutSection06StatementProps {
  onRouteChange?: (route: AppRoute) => void;
}

/**
 * 06 — FINAL STATEMENT
 * Spacious, quiet closing statement with word reveal, parallax depth watermark and clean editorial CTA.
 */
export const AboutSection06Statement: React.FC<AboutSection06StatementProps> = ({
  onRouteChange,
}) => {
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
      id="about-final-statement"
      aria-labelledby="about-final-title"
      className="w-full py-14 sm:py-18 md:py-24 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden transition-colors duration-250"
    >
      {/* Subtle Scroll Parallax Watermark */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: watermarkY }}
        className="absolute -right-6 md:right-10 top-16 font-fraunces text-8xl sm:text-9xl md:text-[14rem] lg:text-[18rem] font-bold text-[var(--text-primary)]/[0.03] select-none pointer-events-none will-change-transform leading-none z-0"
        aria-hidden="true"
      >
        06
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
            06 / FINAL STATEMENT
          </span>
        </motion.div>

        {/* Closing Monumental Headline */}
        <div className="space-y-8 md:space-y-12 max-w-5xl">
          <EditorialWordReveal
            id="about-final-title"
            as="h2"
            text="THERE IS ALWAYS ROOM FOR ONE MORE IDEA."
            className="font-fraunces text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--text-primary)] leading-[0.98]"
            delay={0.1}
            stagger={0.04}
          />

          {/* Editorial CTA */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4"
          >
            {onRouteChange ? (
              <button
                type="button"
                id="about-cta-join"
                onClick={() => onRouteChange('/contact')}
                className="group inline-flex items-center gap-3 font-dosis uppercase font-bold text-sm sm:text-base tracking-[0.24em] text-[var(--text-primary)] hover:text-[#F2613F] transition-colors cursor-pointer"
              >
                <span>JOIN NEXUS</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2 text-[#F2613F]">
                  →
                </span>
              </button>
            ) : (
              <a
                href="#/contact"
                id="about-cta-join-link"
                className="group inline-flex items-center gap-3 font-dosis uppercase font-bold text-sm sm:text-base tracking-[0.24em] text-[var(--text-primary)] hover:text-[#F2613F] transition-colors cursor-pointer"
              >
                <span>JOIN NEXUS</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2 text-[#F2613F]">
                  →
                </span>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection06Statement;
