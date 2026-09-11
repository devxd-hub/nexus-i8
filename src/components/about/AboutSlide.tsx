/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AboutSlideData } from './AboutCarouselTypes.ts';
import { AboutSlideContent } from './AboutSlideContent.tsx';
import { AboutSlideVisual } from './AboutSlideVisual.tsx';
import { AppRoute } from '../../types.ts';

interface AboutSlideProps {
  slide: AboutSlideData;
  index: number;
  direction: number;
  onRouteChange?: (route: AppRoute) => void;
}

/**
 * Editorial Slide Container adhering to the unified 12-column layout grid.
 *
 * Left: Content (Columns 1–7)
 * Right: Halftone Penguin Visual (Columns 8–12)
 *
 * Responsive Order:
 * Desktop: text + visual side-by-side.
 * Mobile: text then penguin then controls.
 */
export const AboutSlide: React.FC<AboutSlideProps> = ({
  slide,
  direction,
  onRouteChange,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 32 : -32,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -32 : 32,
      opacity: 0,
    }),
  };

  const fullHeadline = slide.headlineLines.join(' ');

  return (
    <motion.div
      key={slide.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      role="group"
      aria-roledescription="slide"
      aria-label={`Chapter ${slide.chapterNumber}: ${fullHeadline}`}
      className="w-full flex-1 flex flex-col justify-center py-4 sm:py-6 lg:py-8"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
        {/* Left Content Column (Cols 1–7) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <AboutSlideContent slide={slide} onRouteChange={onRouteChange} />
        </div>

        {/* Right Halftone Penguin Visual Column (Cols 8–12) */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
          <AboutSlideVisual slide={slide} />
        </div>
      </div>
    </motion.div>
  );
};

export default AboutSlide;
