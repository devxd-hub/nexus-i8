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
    return Math.min(4, Math.max(0, Math.floor(progress * 5)));
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

    const boundary = idx * 0.2;
    const halfW = 0.045;

    let enterProgress = 1;
    if (idx > 0) {
      const t = clamp((progress - (boundary - halfW)) / (2 * halfW), 0, 1);
      enterProgress = t;
    }

    let exitProgress = 0;
    if (idx < 4) {
      const nextBoundary = (idx + 1) * 0.2;
      const t = clamp((progress - (nextBoundary - halfW)) / (2 * halfW), 0, 1);
      exitProgress = t;
    }

    const enterAlpha = easeOutQuart(enterProgress);
    const exitAlpha = 1 - easeInQuart(exitProgress);
    const overallOpacity = Math.max(0, Math.min(1, enterAlpha * exitAlpha));

    const labelT = easeOutQuart(clamp((enterProgress - 0.0) / 0.8, 0, 1));
    const labelY = (1 - labelT) * 8 - exitProgress * 8;

    const headT = easeOutQuart(clamp((enterProgress - 0.08) / 0.85, 0, 1));
    const headY = (1 - headT) * 14 - exitProgress * 14;

    const textT = easeOutQuart(clamp((enterProgress - 0.16) / 0.84, 0, 1));
    const textY = (1 - textT) * 10 - exitProgress * 10;

    return {
      container: {
        opacity: overallOpacity,
        pointerEvents: overallOpacity > 0.08 ? ('auto' as const) : ('none' as const),
      },
      label: {
        opacity: Math.max(0, Math.min(1, labelT * exitAlpha)),
        transform: `translateY(${labelY.toFixed(2)}px)`,
      },
      headline: {
        opacity: Math.max(0, Math.min(1, headT * exitAlpha)),
        transform: `translateY(${headY.toFixed(2)}px)`,
      },
      text: {
        opacity: Math.max(0, Math.min(1, textT * exitAlpha)),
        transform: `translateY(${textY.toFixed(2)}px)`,
      },
    };
  };

  return (
    <section
      ref={sectionRef}
      id="nexus-story-scroll-section"
      aria-label="NEXUS Narrative Story Scroll"
      className={`nexus-story-scroll relative w-full h-[450svh] bg-[#F3EEE5] text-[#0A0A09] ${className}`}
    >
      <div className="nexus-story-track relative w-full h-full">
        <div className="nexus-story-stage sticky top-20 sm:top-24 md:top-28 w-full h-[calc(100svh-5rem)] sm:h-[calc(100svh-6rem)] md:h-[calc(100svh-7rem)] overflow-hidden flex flex-col justify-center py-4 sm:py-6 md:py-8 border-b border-[#0A0A09]/10">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex-1 min-h-0 flex items-center">
            <div className="relative w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto py-2 sm:py-4">
              
              {/* Left Column (8 cols): Staggered Editorial Chapter Layers */}
              <div className="lg:col-span-8 relative h-full min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] flex items-center">
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

              {/* Right Column (4 cols): Chapter Progress Indicator & Index Navigation */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-4 lg:border-l lg:border-[#0A0A09]/10 lg:pl-10">
                <div className="text-[11px] font-mono tracking-widest text-[#0A0A09]/40 uppercase">
                  PROGRESSION / 05 CHAPTERS
                </div>
                <div className="flex flex-col space-y-2">
                  {STORY_CHAPTERS.map((ch, idx) => {
                    const isActive = activeChapterIndex === idx;
                    return (
                      <div
                        key={ch.id}
                        className={`flex items-center space-x-3 transition-all duration-300 ${
                          isActive ? 'text-[#EF5A2A]' : 'text-[#0A0A09]/30'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold">{ch.number}</span>
                        <div
                          className={`h-0.5 transition-all duration-300 ${
                            isActive ? 'w-8 bg-[#EF5A2A]' : 'w-3 bg-[#0A0A09]/15'
                          }`}
                        />
                        <span className="font-dosis uppercase text-xs tracking-wider font-semibold">
                          {ch.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NexusStoryScroll;
