/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AboutProgress } from './AboutProgress.tsx';

interface AboutCarouselControlsProps {
  totalSlides: number;
  activeIndex: number;
  currentLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onSelectSlide: (index: number) => void;
  isTransitioning: boolean;
}

/**
 * Editorial Carousel Bottom Bar & Navigation Controls.
 *
 * Requirements:
 * - Small page counter (e.g. 01 / 05)
 * - Tiny section label
 * - Thin divider
 * - Small arrow buttons
 * - Zero HUD, telemetry, or fake metrics
 */
export const AboutCarouselControls: React.FC<AboutCarouselControlsProps> = ({
  totalSlides,
  activeIndex,
  currentLabel,
  onPrev,
  onNext,
  onSelectSlide,
  isTransitioning,
}) => {
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === totalSlides - 1;
  const currentChapter = `0${activeIndex + 1}`;
  const totalChapter = `0${totalSlides}`;

  return (
    <div
      id="about-carousel-controls"
      className="w-full border-t border-[#0A0A09]/10 pt-6 sm:pt-7 mt-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 select-none"
    >
      {/* Left: Small Page Counter & Tiny Section Label */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-dosis font-bold text-sm tracking-[0.24em] text-[#EF5A2A]">
            {currentChapter}
          </span>
          <span className="text-xs text-[#0A0A09]/30">/</span>
          <span className="font-dosis text-xs tracking-[0.2em] text-[#66615A]">
            {totalChapter}
          </span>
        </div>

        {currentLabel && (
          <>
            <span className="hidden sm:inline-block w-3 h-[1px] bg-[#0A0A09]/20" />
            <span className="hidden sm:inline-block font-dosis uppercase text-xs tracking-[0.22em] text-[#66615A]">
              {currentLabel}
            </span>
          </>
        )}
      </div>

      {/* Center: Quiet Progress Pips Navigation */}
      <div className="order-3 sm:order-2">
        <AboutProgress
          totalSlides={totalSlides}
          activeIndex={activeIndex}
          onSelectSlide={onSelectSlide}
          disabled={isTransitioning}
        />
      </div>

      {/* Right: Small Arrow Controls */}
      <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-3">
        <button
          type="button"
          id="about-carousel-prev-btn"
          onClick={onPrev}
          disabled={isFirst || isTransitioning}
          aria-label="Previous Chapter"
          className={`min-w-[40px] min-h-[40px] sm:min-w-[34px] sm:min-h-[34px] p-2 sm:p-2.5 rounded-full border border-[#0A0A09]/15 flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] ${
            isFirst
              ? 'opacity-25 cursor-not-allowed text-[#0A0A09]/40 border-[#0A0A09]/10'
              : 'text-[#0A0A09] hover:text-[#EF5A2A] hover:border-[#EF5A2A]/40 hover:bg-[#0A0A09]/5 cursor-pointer active:scale-95'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          id="about-carousel-next-btn"
          onClick={onNext}
          disabled={isLast || isTransitioning}
          aria-label="Next Chapter"
          className={`min-w-[40px] min-h-[40px] sm:min-w-[34px] sm:min-h-[34px] p-2 sm:p-2.5 rounded-full border border-[#0A0A09]/15 flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] ${
            isLast
              ? 'opacity-25 cursor-not-allowed text-[#0A0A09]/40 border-[#0A0A09]/10'
              : 'text-[#0A0A09] hover:text-[#EF5A2A] hover:border-[#EF5A2A]/40 hover:bg-[#0A0A09]/5 cursor-pointer active:scale-95'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AboutCarouselControls;
