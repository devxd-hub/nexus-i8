/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AboutSlideData } from './AboutCarouselTypes.ts';
import { PenguinCanvas } from './PenguinCanvas.tsx';

interface AboutSlideVisualProps {
  slide: AboutSlideData;
}

/**
 * Editorial Halftone Penguin Visual Stage.
 * Delegates to the persistent, carousel-aware PenguinCanvas.
 */
export const AboutSlideVisual: React.FC<AboutSlideVisualProps> = ({ slide }) => {
  const slideIndex = Math.max(0, parseInt(slide.chapterNumber, 10) - 1);
  return <PenguinCanvas activeSlide={slideIndex} totalSlides={5} />;
};

export default AboutSlideVisual;
