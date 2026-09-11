/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AboutSlideData } from './AboutCarouselTypes.ts';
import { AppRoute } from '../../types.ts';

interface AboutSlideContentProps {
  slide: AboutSlideData;
  onRouteChange?: (route: AppRoute) => void;
}

/**
 * Editorial Slide Content (Columns 1–7 in 12-col grid).
 *
 * Exact Typographic Hierarchy:
 * SMALL LABEL
 * ↓
 * LARGE HEADLINE
 * ↓
 * SHORT SUPPORTING COPY (Max 500–600px desktop, 90% mobile)
 * ↓
 * OPTIONAL SMALL CTA (Slide 05 only)
 */
export const AboutSlideContent: React.FC<AboutSlideContentProps> = ({
  slide,
  onRouteChange,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full flex flex-col justify-center space-y-6 sm:space-y-8">
      {/* 1. SMALL LABEL */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-dosis uppercase text-xs sm:text-sm tracking-[0.24em] text-[#EF5A2A] font-semibold">
          {slide.label}
        </span>
      </motion.div>

      {/* 2. LARGE HEADLINE */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-fraunces text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0A0A09] leading-[0.98] text-balance">
          {slide.headlineLines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </h1>
      </motion.div>

      {/* 3. SHORT SUPPORTING COPY */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="w-[90%] sm:w-full max-w-[540px] space-y-3"
      >
        {slide.leadText && (
          <p className="font-bitter text-base sm:text-lg text-[#0A0A09] leading-relaxed">
            {slide.leadText}
          </p>
        )}

        {slide.rhythmicLines && slide.rhythmicLines.length > 0 && (
          <div className="space-y-1 pt-1.5">
            {slide.rhythmicLines.map((line, idx) => (
              <p
                key={idx}
                className="font-bitter text-sm sm:text-base text-[#66615A] leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {slide.secondaryText && (
          <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed pt-1">
            {slide.secondaryText}
          </p>
        )}
      </motion.div>

      {/* 4. OPTIONAL SMALL CTA (Slide 05 only) */}
      {slide.ctaLabel && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pt-2"
        >
          <button
            type="button"
            id="about-slide-cta-btn"
            onClick={() => onRouteChange?.(slide.ctaAction || '/contact')}
            className="group inline-flex items-center gap-3 font-dosis uppercase font-bold text-sm sm:text-base tracking-[0.24em] text-[#0A0A09] hover:text-[#EF5A2A] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] rounded py-1"
          >
            <span>{slide.ctaLabel}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AboutSlideContent;
