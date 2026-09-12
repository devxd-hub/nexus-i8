/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';
import { useAboutScroll } from './AboutScrollManager.tsx';

export interface StoryChapter {
  id: string;
  number: string;
  total: string;
  label: string;
  headlineLines: string[];
  textLines: string[];
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'nexus-story-chapter-01',
    number: '01',
    total: '05',
    label: 'WHY NEXUS EXISTS',
    headlineLines: ['GOOD IDEAS', "SHOULDN'T", 'STAY IDEAS.'],
    textLines: [
      'NEXUS gives students a place to take an unfinished thought and begin making something from it.',
    ],
  },
  {
    id: 'nexus-story-chapter-02',
    number: '02',
    total: '05',
    label: 'IDEAS NEED PEOPLE',
    headlineLines: ['THE RIGHT IDEA', 'NEEDS THE RIGHT', 'PEOPLE.'],
    textLines: [
      'Different disciplines.',
      'Different perspectives.',
      'One shared reason to build.',
    ],
  },
  {
    id: 'nexus-story-chapter-03',
    number: '03',
    total: '05',
    label: 'WE BUILD TOGETHER',
    headlineLines: ['THINK.', 'MAKE.', 'LEARN.'],
    textLines: [
      'Ideas become experiments.',
      'Experiments become prototypes.',
      'Prototypes become projects.',
    ],
  },
  {
    id: 'nexus-story-chapter-04',
    number: '04',
    total: '05',
    label: 'WHAT WE MAKE',
    headlineLines: ['FROM', 'QUESTION', 'TO PROJECT.'],
    textLines: [
      'Software. Experiments. Design. Media.',
      'Things that did not exist before someone started.',
    ],
  },
  {
    id: 'nexus-story-chapter-05',
    number: '05',
    total: '05',
    label: 'WHAT WE BELIEVE',
    headlineLines: ['START BEFORE', 'YOU ARE READY.'],
    textLines: [
      'You do not need the perfect plan.',
      'You need a reason to begin.',
    ],
  },
];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function easeOutQuart(t: number): number {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3.5);
}

function easeInQuart(t: number): number {
  const c = clamp(t, 0, 1);
  return Math.pow(c, 2.8);
}

interface NexusStoryScrollProps {
  className?: string;
}

function getNavbarHeight(): number {
  if (typeof window === 'undefined') return 80;
  if (window.innerWidth >= 768) return 112;
  if (window.innerWidth >= 640) return 96;
  return 80;
}

/**
 * NexusStoryScroll
 *
 * Sticky Scroll-Driven Narrative Experience:
 * - Clean chapter progression with fluid dissolve transitions
 * - Pinned below the navbar
 */
export const NexusStoryScroll: React.FC<NexusStoryScrollProps> = ({ className = '' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const { subscribe } = useAboutScroll();

  const updateScrollProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const navHeight = getNavbarHeight();
    const scrollableDistance = section.offsetHeight - (window.innerHeight - navHeight);

    if (scrollableDistance <= 0) {
      setProgress(0);
      return;
    }

    const scrolled = navHeight - rect.top;
    const normalized = clamp(scrolled / scrollableDistance, 0, 1);
    setProgress(normalized);
  }, []);

  useEffect(() => {
    if (!subscribe) return;
    const unsubscribe = subscribe(() => {
      updateScrollProgress();
    });
    return unsubscribe;
  }, [subscribe, updateScrollProgress]);

  useEffect(() => {
    let ticking = false;

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateScrollProgress();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [updateScrollProgress]);

  const activeChapterIndex = useMemo(() => {
    return Math.min(4, Math.max(0, Math.round(progress * 4)));
  }, [progress]);

  const getChapterLayerStyles = (idx: number) => {
    if (shouldReduceMotion) {
      const isActive = activeChapterIndex === idx;
      return {
        container: {
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? ('auto' as const) : ('none' as const),
        },
        label: { opacity: 1, transform: 'none' },
        headline: { opacity: 1, transform: 'none' },
        text: { opacity: 1, transform: 'none' },
      };
    }

    const p = clamp(progress * 4, 0, 4);
    const k = Math.min(3, Math.floor(p));
    const transStart = k + 0.25;
    const transEnd = k + 0.75;

    let opacity = 0;
    let yOffset = 0;

    if (p < transStart) {
      if (idx === k) {
        opacity = 1;
        yOffset = 0;
      }
    } else if (p > transEnd) {
      if (idx === k + 1) {
        opacity = 1;
        yOffset = 0;
      }
    } else {
      const t = (p - transStart) / (transEnd - transStart);
      const smoothT = 0.5 * (1 - Math.cos(Math.PI * t));

      if (idx === k) {
        opacity = 1 - smoothT;
        yOffset = -smoothT * 18;
      } else if (idx === k + 1) {
        opacity = smoothT;
        yOffset = (1 - smoothT) * 18;
      }
    }

    const isVisible = opacity > 0.01;

    return {
      container: {
        opacity: isVisible ? opacity : 0,
        pointerEvents: opacity > 0.5 ? ('auto' as const) : ('none' as const),
      },
      label: {
        transform: isVisible ? `translateY(${(yOffset * 1.1).toFixed(2)}px)` : 'none',
      },
      headline: {
        transform: isVisible ? `translateY(${yOffset.toFixed(2)}px)` : 'none',
      },
      text: {
        transform: isVisible ? `translateY(${(yOffset * 0.75).toFixed(2)}px)` : 'none',
      },
    };
  };

  return (
    <section
      ref={sectionRef}
      id="nexus-story-scroll-section"
      aria-label="NEXUS Narrative Story Scroll"
      className={`nexus-story-scroll relative w-full h-[260svh] bg-[#F3EEE5] text-[#0A0A09] ${className}`}
    >
      <div className="nexus-story-track relative w-full h-full">
        <div className="nexus-story-stage sticky top-20 sm:top-24 md:top-28 w-full h-[calc(100svh-5rem)] sm:h-[calc(100svh-6rem)] md:h-[calc(100svh-7rem)] overflow-hidden flex flex-col justify-center py-4 sm:py-6 border-b border-[#0A0A09]/10">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex-1 min-h-0 flex items-center">
            
            {/* Story Chapter Container */}
            <div className="relative w-full max-w-3xl lg:max-w-4xl min-h-[220px] sm:min-h-[250px] lg:min-h-[270px] flex items-center my-auto">
              {STORY_CHAPTERS.map((ch, idx) => {
                const styles = getChapterLayerStyles(idx);

                return (
                  <div
                    key={ch.id}
                    id={ch.id}
                    style={styles.container}
                    className="absolute inset-0 flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5 will-change-transform"
                    aria-hidden={styles.container.opacity < 0.1}
                  >
                    {/* Chapter Label */}
                    <div style={styles.label} className="will-change-transform">
                      <span className="font-dosis uppercase text-xs sm:text-sm tracking-[0.22em] text-[#EF5A2A] font-bold">
                        {ch.number} / {ch.label}
                      </span>
                    </div>

                    {/* Large Headline */}
                    <div style={styles.headline} className="space-y-0.5 sm:space-y-1 will-change-transform">
                      {ch.headlineLines.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className="font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A09] leading-[1.02] sm:leading-[0.98]"
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    {/* Supporting Text */}
                    <div style={styles.text} className="space-y-1.5 sm:space-y-2 max-w-xl will-change-transform">
                      {ch.textLines.map((tLine, tIdx) => (
                        <p
                          key={tIdx}
                          className="font-bitter text-sm sm:text-base md:text-lg text-[#0A0A09]/70 leading-relaxed"
                        >
                          {tLine}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default NexusStoryScroll;
