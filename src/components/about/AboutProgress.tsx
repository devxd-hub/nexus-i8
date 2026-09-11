/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AboutProgressProps {
  totalSlides: number;
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  disabled?: boolean;
}

/**
 * Editorial progress line with quiet chapter markers.
 * Positioned cleanly with generous whitespace and optical restraint.
 */
export const AboutProgress: React.FC<AboutProgressProps> = ({
  totalSlides,
  activeIndex,
  onSelectSlide,
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="About Chapters Progress"
      className="flex items-center gap-3 sm:gap-4 select-none"
    >
      {Array.from({ length: totalSlides }).map((_, idx) => {
        const isActive = idx === activeIndex;
        const numStr = `0${idx + 1}`;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSlide(idx)}
            disabled={disabled}
            aria-label={`Go to Chapter ${numStr}`}
            aria-current={isActive ? 'step' : undefined}
            className={`group relative flex flex-col items-center py-2 px-1 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] rounded cursor-pointer ${
              disabled ? 'pointer-events-none' : ''
            }`}
          >
            {/* Number Label */}
            <span
              className={`font-dosis font-bold text-xs tracking-[0.2em] transition-colors duration-300 ${
                isActive
                  ? 'text-[#0A0A09]'
                  : 'text-[#0A0A09]/35 group-hover:text-[#0A0A09]/70'
              }`}
            >
              {numStr}
            </span>

            {/* Subtle Pill Indicator */}
            <div className="w-8 sm:w-12 h-[2px] mt-1.5 bg-[#0A0A09]/15 overflow-hidden rounded-full relative">
              {isActive && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : 'about-progress-active'}
                  className="absolute inset-0 bg-[#EF5A2A]"
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default AboutProgress;
