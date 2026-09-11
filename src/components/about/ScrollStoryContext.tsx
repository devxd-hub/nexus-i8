/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from 'react';
import { MotionValue, useScroll, useSpring, useTransform } from 'motion/react';

export interface StoryPhaseInfo {
  index: number;
  id: string;
  name: string;
  progressRange: [number, number];
}

export const STORY_PHASES: StoryPhaseInfo[] = [
  { index: 0, id: 'chapter-01-intersection', name: 'THE X / INTRODUCTION', progressRange: [0, 0.12] },
  { index: 1, id: 'chapter-02-thesis', name: 'THE ORANGE FIELD', progressRange: [0.12, 0.28] },
  { index: 2, id: 'chapter-03-problem', name: 'TEXT / IDEA EMERGES', progressRange: [0.28, 0.40] },
  { index: 3, id: 'chapter-04-connection', name: 'HARMONIC CONVERGENCE', progressRange: [0.40, 0.54] },
  { index: 4, id: 'chapter-06-artifacts', name: 'SHIPPED ARTIFACTS', progressRange: [0.54, 0.65] },
  { index: 5, id: 'chapter-07-people', name: 'PEOPLE / CONNECTION', progressRange: [0.65, 0.78] },
  { index: 6, id: 'chapter-05-process', name: 'PROCESS & RECURSIVE LOOP', progressRange: [0.78, 0.88] },
  { index: 7, id: 'chapter-08-archive', name: 'PHOTOGRAPHIC ARCHIVE', progressRange: [0.88, 0.94] },
  { index: 8, id: 'chapter-09-horizon', name: 'THE NEXT BEGINNING', progressRange: [0.94, 1.0] },
];

interface StoryScrollContextValue {
  scrollYProgress: MotionValue<number>;
  smoothProgress: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const StoryScrollContext = createContext<StoryScrollContextValue | null>(null);

export const useStoryScroll = () => {
  const context = useContext(StoryScrollContext);
  if (!context) {
    throw new Error('useStoryScroll must be used within a StoryScrollProvider');
  }
  return context;
};

export const StoryScrollProvider: React.FC<{
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ children, containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.0001,
  });

  return (
    <StoryScrollContext.Provider value={{ scrollYProgress, smoothProgress, containerRef }}>
      {children}
    </StoryScrollContext.Provider>
  );
};
