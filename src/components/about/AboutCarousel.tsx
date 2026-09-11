/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AboutSlideData, AboutCarouselProps } from './AboutCarouselTypes.ts';
import { AboutSlideContent } from './AboutSlideContent.tsx';
import { PenguinCanvas } from './PenguinCanvas.tsx';
import { AboutCarouselControls } from './AboutCarouselControls.tsx';

/**
 * Five Editorial Chapters Data
 *
 * 01 / 05 — WHY NEXUS EXISTS
 * 02 / 05 — IDEAS NEED PEOPLE
 * 03 / 05 — HOW WE WORK
 * 04 / 05 — WHAT WE BUILD
 * 05 / 05 — WHAT WE BELIEVE
 */
const ABOUT_SLIDES: AboutSlideData[] = [
  {
    id: 'chapter-01',
    chapterNumber: '01',
    chapterTotal: '05',
    label: 'WHY NEXUS EXISTS',
    headlineLines: [
      'GOOD IDEAS',
      "SHOULDN'T",
      'STAY IDEAS.',
    ],
    leadText:
      'NEXUS exists to give students a place where unfinished ideas can become real projects.',
    rhythmicLines: [
      'Bring a question.',
      'Bring a sketch.',
      'Bring a problem.',
      'Bring something you want to make.',
    ],
    penguinPose: {
      offsetX: 15,
      offsetY: -15,
      scale: 0.95,
      rotation: -0.02,
      poseType: 'poised',
      caption: 'FIG. 01 — POISED SILHOUETTE',
    },
  },
  {
    id: 'chapter-02',
    chapterNumber: '02',
    chapterTotal: '05',
    label: 'IDEAS NEED PEOPLE',
    headlineLines: [
      'THE RIGHT IDEA',
      'NEEDS THE RIGHT',
      'PEOPLE.',
    ],
    leadText:
      'NEXUS brings students across technology, engineering, design, media and other disciplines together to find collaborators, form teams and see problems differently.',
    penguinPose: {
      offsetX: -30,
      offsetY: 0,
      scale: 0.98,
      rotation: 0.035,
      poseType: 'inquisitive',
      caption: 'FIG. 02 — INQUISITIVE PERSPECTIVE',
    },
  },
  {
    id: 'chapter-03',
    chapterNumber: '03',
    chapterTotal: '05',
    label: 'HOW WE WORK',
    headlineLines: [
      'THINK.',
      'MAKE.',
      'LEARN.',
    ],
    leadText:
      'We move from conversation into experimentation.',
    rhythmicLines: [
      'Ideas are tested.',
      'Prototypes are built.',
      'Things fail.',
      'Things improve.',
    ],
    penguinPose: {
      offsetX: 0,
      offsetY: 18,
      scale: 1.0,
      rotation: -0.015,
      poseType: 'active',
      caption: 'FIG. 03 — ACTIVE EXPERIMENTATION',
    },
  },
  {
    id: 'chapter-04',
    chapterNumber: '04',
    chapterTotal: '05',
    label: 'WHAT WE BUILD',
    headlineLines: [
      'FROM',
      'QUESTION',
      'TO PROJECT.',
    ],
    leadText:
      'NEXUS gives teams the space to turn curiosity into useful software, experiments, media, prototypes and other work.',
    penguinPose: {
      offsetX: 40,
      offsetY: -5,
      scale: 0.97,
      rotation: 0.04,
      poseType: 'transit',
      caption: 'FIG. 04 — TRANSIT THROUGH WORK',
    },
  },
  {
    id: 'chapter-05',
    chapterNumber: '05',
    chapterTotal: '05',
    label: 'WHAT WE BELIEVE',
    headlineLines: [
      'START BEFORE',
      'YOU ARE READY.',
    ],
    leadText:
      'The best project is rarely the perfect one.',
    secondaryText:
      'It is the one someone decided to begin.',
    ctaLabel: 'JOIN NEXUS →',
    ctaAction: '/contact',
    penguinPose: {
      offsetX: 10,
      offsetY: 20,
      scale: 1.04,
      rotation: 0.0,
      poseType: 'settled',
      caption: 'FIG. 05 — FINAL POSITION',
    },
  },
];

/**
 * Editorial About Carousel with Persistent Halftone Penguin Mascot.
 *
 * Requirements:
 * - Persistent PenguinCanvas: Preserves dot identities across slide transitions.
 * - Point correspondence: old pose -> morph -> new pose without recreating point clouds.
 * - Physics-inspired walking between chapters (waddle, foot alternation, step bob, flipper counterbalance).
 * - Drag velocity influence with exponential decay (no rubber-banding).
 * - Desktop: text + visual side-by-side.
 * - Mobile: text then penguin then controls.
 * - 30–50% intentional negative space.
 */
export const AboutCarousel: React.FC<AboutCarouselProps> = ({
  onRouteChange,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [dragInfluence, setDragInfluence] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoverEdge, setHoverEdge] = useState<'prev' | 'next' | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const transitionTimerRef = useRef<number | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragHistoryRef = useRef<Array<{ x: number; time: number }>>([]);
  const lastWheelTimeRef = useRef<number>(0);
  const capturedPointerIdRef = useRef<number | null>(null);

  const totalSlides = ABOUT_SLIDES.length;

  // Change slide with robust transition locking
  const goToSlide = useCallback(
    (nextIdx: number, newDirection: number) => {
      if (isTransitioningRef.current) return;
      if (nextIdx < 0 || nextIdx >= totalSlides) return;
      if (nextIdx === activeIndex) return;

      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setDirection(newDirection);
      setActiveIndex(nextIdx);
      setDragOffset(0);
      setDragInfluence(0);

      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }

      transitionTimerRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }, 750);
    },
    [activeIndex, totalSlides]
  );

  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (activeIndex < totalSlides - 1) {
      goToSlide(activeIndex + 1, 1);
    }
  }, [activeIndex, goToSlide, totalSlides]);

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1, -1);
    }
  }, [activeIndex, goToSlide]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Home, End
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check if carousel or window is active context
      const container = containerRef.current;
      const isWithinCarousel =
        container && (container.contains(target) || document.activeElement === container);

      if (!isWithinCarousel && target !== document.body) {
        return;
      }

      if (e.key === 'ArrowRight') {
        if (activeIndex < totalSlides - 1) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeIndex > 0) {
          e.preventDefault();
          handlePrev();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0, -1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleNext, handlePrev, goToSlide, totalSlides]);

  // Unified Pointer Drag & Swipe
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTransitioningRef.current) return;
    if (e.button !== 0) return; // Only primary button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    dragStartXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
    capturedPointerIdRef.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    dragHistoryRef.current = [{ x: e.clientX, time: performance.now() }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;

    // Detect subtle edge proximity for directional feedback when not dragging
    if (!isDraggingRef.current && container) {
      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      if (relX < 85 && activeIndex > 0) {
        setHoverEdge('prev');
      } else if (relX > rect.width - 85 && activeIndex < totalSlides - 1) {
        setHoverEdge('next');
      } else {
        setHoverEdge(null);
      }
      return;
    }

    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    const deltaX = e.clientX - dragStartXRef.current;
    const now = performance.now();

    // Rolling velocity tracking buffer (keep within last 120ms)
    dragHistoryRef.current.push({ x: e.clientX, time: now });
    dragHistoryRef.current = dragHistoryRef.current.filter(
      (pt) => now - pt.time <= 120
    );

    // Apply boundary resistance at start/end
    let resistance = 0.78;
    if (activeIndex === 0 && deltaX > 0) {
      resistance = 0.22; // High resistance when dragging right on first slide
    } else if (activeIndex === totalSlides - 1 && deltaX < 0) {
      resistance = 0.22; // High resistance when dragging left on last slide
    }

    const effectiveOffset = deltaX * resistance;
    setDragOffset(effectiveOffset);

    // Dynamic drag influence passed to the penguin director (-1 to 1)
    const normalizedInfluence = Math.max(-1, Math.min(1, effectiveOffset / 130));
    setDragInfluence(normalizedInfluence);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    if (capturedPointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(capturedPointerIdRef.current);
      } catch {
        // Ignore
      }
      capturedPointerIdRef.current = null;
    }

    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;

    // Compute velocity (px/ms)
    let velocity = 0;
    const history = dragHistoryRef.current;
    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const dt = last.time - first.time;
      if (dt > 15) {
        velocity = (last.x - first.x) / dt;
      }
    }
    dragHistoryRef.current = [];

    // Subtle distance (55px) and velocity (0.42 px/ms) thresholds
    const isForwardSwipe = deltaX < -55 || velocity < -0.42;
    const isBackwardSwipe = deltaX > 55 || velocity > 0.42;

    if (!isTransitioningRef.current) {
      if (isForwardSwipe && activeIndex < totalSlides - 1) {
        handleNext();
      } else if (isBackwardSwipe && activeIndex > 0) {
        handlePrev();
      } else {
        // Snap back to current slide
        setDragOffset(0);
        setDragInfluence(0);
      }
    } else {
      setDragOffset(0);
      setDragInfluence(0);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerUp(e);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setHoverEdge(null);
    }
  };

  // Controlled horizontal wheel only (vertical scroll preserved natively)
  const handleWheel = (e: React.WheelEvent) => {
    if (isTransitioningRef.current) return;

    // Only respond to deliberate horizontal trackpad/wheel gestures
    const isHorizontalDominant =
      Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 2.0;

    if (isHorizontalDominant) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 750) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const currentSlide = ABOUT_SLIDES[activeIndex];

  // Layered transition: content reveals from direction of movement
  const slideVariants = {
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

  return (
    <section
      ref={containerRef}
      id="about-editorial-carousel"
      role="region"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="About NEXUS Editorial Chapters"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      className={`relative w-full min-h-[100svh] flex flex-col justify-between pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-8 bg-[#F3EEE5] text-[#0A0A09] selection:bg-[#EF5A2A] selection:text-white overflow-hidden touch-pan-y focus:outline-none focus-visible:ring-1 focus-visible:ring-[#EF5A2A]/40 ${
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
      } ${className}`}
    >
      {/* Subtle Edge Directional Hint (Optical Restraint) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-1/3 bottom-1/3 w-[3px] bg-[#EF5A2A] transition-opacity duration-300 rounded-r ${
          hoverEdge === 'prev' ? 'opacity-35' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-1/3 bottom-1/3 w-[3px] bg-[#EF5A2A] transition-opacity duration-300 rounded-l ${
          hoverEdge === 'next' ? 'opacity-35' : 'opacity-0'
        }`}
      />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex-1 flex flex-col justify-between">
        {/* Main Stage Grid: Text Content + Persistent Halftone Mascot */}
        <div
          className="w-full flex-1 flex flex-col justify-center relative min-h-[460px] sm:min-h-[500px] my-auto"
          style={{
            transform: `translateX(${dragOffset * 0.35}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
            {/* Left Content Column (Cols 1–7): Text transitions with AnimatePresence */}
            <div className="lg:col-span-7 flex flex-col justify-center min-h-[300px] sm:min-h-[360px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Chapter ${currentSlide.chapterNumber}: ${currentSlide.headlineLines.join(' ')}`}
                  className="w-full flex flex-col justify-center py-2 sm:py-4"
                >
                  <AboutSlideContent
                    slide={currentSlide}
                    onRouteChange={onRouteChange}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Halftone Penguin Visual Column (Cols 8–12): PERSISTENT Canvas with stable points */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <PenguinCanvas
                activeSlide={activeIndex}
                totalSlides={totalSlides}
                isTransitioning={isTransitioning}
                dragInfluence={dragInfluence}
              />
            </div>
          </div>
        </div>

        {/* Carousel Controls with Small Page Counter, Section Label, and Small Arrows */}
        <AboutCarouselControls
          totalSlides={totalSlides}
          activeIndex={activeIndex}
          currentLabel={currentSlide.label}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectSlide={(idx) => goToSlide(idx, idx > activeIndex ? 1 : -1)}
          isTransitioning={isTransitioning}
        />
      </div>
    </section>
  );
};

export default AboutCarousel;
