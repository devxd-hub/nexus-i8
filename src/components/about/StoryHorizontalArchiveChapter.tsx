/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { Compass, Sparkles, ArrowRight, Eye, Layers } from 'lucide-react';

export interface VisualArchiveMoment {
  id: string;
  number: string;
  step: string;
  category: string;
  title: string;
  subtitle: string;
  caption: string;
  location: string;
  timeline: string;
  imageUrl: string;
  tag: string;
}

export const VISUAL_ARCHIVE_MOMENTS: VisualArchiveMoment[] = [
  {
    id: 'moment-01-question',
    number: '01',
    step: 'QUESTION',
    category: 'THE INITIAL INQUIRY',
    title: 'Questioning Academic Boundaries',
    subtitle: 'RAW WHITEBOARD INQUIRIES',
    caption: 'Late afternoon critique: debating interface metaphors, algorithmic proofs, and ergonomic constraints across disciplines.',
    location: 'Critique Hall 2B',
    timeline: 'OCT 2026 // SPRINT 01',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=85',
    tag: 'IDEATION & CRITIQUE',
  },
  {
    id: 'moment-02-connection',
    number: '02',
    step: 'CONNECTION',
    category: 'MULTIDISCIPLINARY SQUAD MATCHING',
    title: 'Complementary Minds Matching',
    subtitle: 'CROSS-DISCIPLINE TEAM FORMATION',
    caption: 'Software engineers pairing with interaction designers and hardware prototypers at the main studio bench.',
    location: 'Nexus Central Atrium',
    timeline: 'SEP 2026 // COHORT FORMATION',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85',
    tag: 'PEOPLE & SQUADS',
  },
  {
    id: 'moment-03-experiment',
    number: '03',
    step: 'EXPERIMENT',
    category: 'HARDWARE & CODE TELEMETRY',
    title: 'Oscilloscopes & Variable Glyphs',
    subtitle: 'TACTILE SENSORS & TYPOGRAPHY',
    caption: 'Testing ESP32 sensor telemetry and inspecting OpenType variable font axes under real optical bench conditions.',
    location: 'Lab 4B Hardware Bench',
    timeline: 'OCT 2026 // HARDWARE SPRINT',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=85',
    tag: 'EXPERIMENTATION',
  },
  {
    id: 'moment-04-build',
    number: '04',
    step: 'BUILD',
    category: 'PHYSICAL FABRICATION & CODE',
    title: 'Crafting at the 1:00 AM Bench',
    subtitle: 'WOODSHOP MILLING & PIPELINES',
    caption: 'CNC milling solid walnut MIDI faceplates and pair-programming core Canvas rendering pipelines late into the night.',
    location: 'Makerspace Woodshop',
    timeline: 'NOV 2026 // FABRICATION',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=85',
    tag: 'PHYSICAL FABRICATION',
  },
  {
    id: 'moment-05-iterate',
    number: '05',
    step: 'ITERATE',
    category: 'TESTING & STRESS CRITIQUE',
    title: 'Breaking, Testing & Refining',
    subtitle: 'THE RAPID PROTOTYPING LOOP',
    caption: 'Stress-testing latency thresholds on real-time WebSockets and tuning capacitive sensor responsiveness.',
    location: 'Studio Bench 08',
    timeline: 'DEC 2026 // SPRINT TUNING',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=85',
    tag: 'ITERATION & REFINEMENT',
  },
  {
    id: 'moment-06-share',
    number: '06',
    step: 'SHARE',
    category: 'CAMPUS DEMONSTRATION',
    title: 'Courtyard Demonstrations',
    subtitle: 'PUBLIC DEMO EXHIBITION',
    caption: 'Presenting live tactile hardware instruments and web software to hundreds of visiting students and faculty.',
    location: 'Engineering Courtyard',
    timeline: 'JAN 2027 // DEMO NIGHT',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85',
    tag: 'PUBLIC DEMONSTRATION',
  },
  {
    id: 'moment-07-community',
    number: '07',
    step: 'COMMUNITY',
    category: 'THE ENDURING REPOSITORY',
    title: 'The Permanent Studio Bench',
    subtitle: 'OPEN-SOURCE COLLECTIVE ARCHIVE',
    caption: 'Open-sourcing every schematic and repository for upcoming cohorts to inherit, build upon, and remix.',
    location: 'Nexus Studio Hall',
    timeline: 'FEB 2027 // ENDURING ARCHIVE',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',
    tag: 'ENDURING COMMUNITY',
  },
];

export const StoryHorizontalArchiveChapter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMomentIndex, setActiveMomentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Local scroll progress across the tall scroll track (0.0 -> 1.0)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Track progress to update the current active moment indicator (01/07 to 07/07)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Map scroll progress in the active horizontal window (0.12 -> 0.88) to index 0..6
    const normalized = Math.max(0, Math.min(1, (latest - 0.10) / 0.78));
    const targetIdx = Math.min(
      VISUAL_ARCHIVE_MOMENTS.length - 1,
      Math.floor(normalized * VISUAL_ARCHIVE_MOMENTS.length)
    );
    setActiveMomentIndex(targetIdx);
  });

  // =========================================================================
  // SCROLL-DRIVEN TRANSFORMS
  // =========================================================================

  // 1. Entrance: Transition from Chapter 02 text into the expanding horizontal frame
  const introTextOpacity = useTransform(scrollYProgress, [0.0, 0.08, 0.16], [1, 1, 0.05]);
  const introTextY = useTransform(scrollYProgress, [0.0, 0.14], [0, -20]);
  const frameExpandScale = useTransform(scrollYProgress, [0.02, 0.14], [0.88, 1]);

  // 2. Horizontal Translation: 7 large plates translate smoothly across the screen
  // Total horizontal travel spans across the plates
  const horizontalTranslate = useTransform(
    scrollYProgress,
    [0.10, 0.86],
    ['0%', '-76%']
  );

  // 3. Exit Transition: As 7th plate finishes, frame scales slightly and exposes Chapter 03
  const exitScale = useTransform(scrollYProgress, [0.86, 0.98, 1.0], [1, 0.96, 0.92]);
  const exitOpacity = useTransform(scrollYProgress, [0.90, 0.99, 1.0], [1, 0.85, 0.6]);

  // Handle gentle desktop pointer parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 12; // -6px to +6px
    const y = (clientY / innerHeight - 0.5) * 12; // -6px to +6px
    setMousePosition({ x, y });
  };

  const currentMoment = VISUAL_ARCHIVE_MOMENTS[activeMomentIndex] || VISUAL_ARCHIVE_MOMENTS[0];

  return (
    <div
      ref={containerRef}
      id="chapter-horizontal-journey"
      onMouseMove={handleMouseMove}
      className="relative w-full h-[380vh] bg-[#0A0A09] text-[#F3EEE5] select-none"
    >
      {/* Sticky Viewport Container: 100vh height locked in view while user scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-8">
        
        {/* =========================================================================
            TOP EDITORIAL METADATA & PROGRESS BAR
            ========================================================================= */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#EF5A2A] text-[#0A0A09] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
                VISUAL ARCHIVE
              </span>
              <span className="font-dosis text-xs text-[#F3EEE5]/70 uppercase tracking-[0.22em] font-semibold">
                CHRONOLOGY OF CRAFT (01–07)
              </span>
            </div>

            {/* Continuous Progress Indicator: 01 / 07 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[#F3EEE5]/80">
                <span className="text-[#EF5A2A] font-bold text-sm">
                  {currentMoment.number}
                </span>
                <span className="text-white/40">/</span>
                <span>07</span>
                <span className="hidden sm:inline font-dosis text-xs uppercase tracking-wider text-[#F3EEE5]/60 pl-1">
                  // {currentMoment.step}
                </span>
              </div>

              {/* Minimal Progress Hairline */}
              <div className="w-20 sm:w-32 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  style={{
                    width: `${((activeMomentIndex + 1) / VISUAL_ARCHIVE_MOMENTS.length) * 100}%`,
                  }}
                  className="h-full bg-[#EF5A2A] transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            INTRODUCTORY THESIS TRANSITION OVERLAY (Fades as scroll reaches horizontal strip)
            "These ideas are not abstract. They become people. They become experiments. They become things."
            ========================================================================= */}
        <motion.div
          style={{
            opacity: introTextOpacity,
            y: introTextY,
          }}
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 text-center"
        >
          <div className="max-w-2xl space-y-4 bg-[#0A0A09]/90 backdrop-blur-sm p-8 rounded-[2px] border border-white/10 shadow-2xl">
            <span className="font-dosis text-xs font-bold text-[#EF5A2A] uppercase tracking-[0.24em] block">
              FROM ABSTRACT THOUGHT TO TACTILE REALITY
            </span>
            <h2 className="font-fraunces font-bold text-3xl sm:text-5xl text-white leading-tight">
              These ideas are not abstract.
            </h2>
            <div className="font-bitter text-base sm:text-xl text-[#F3EEE5]/85 italic space-y-1">
              <p>They become people.</p>
              <p>They become experiments.</p>
              <p className="text-[#EF5A2A] font-medium not-italic font-dosis tracking-wider uppercase text-sm sm:text-base pt-1">
                They become shipped things.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 font-dosis text-xs text-[#F3EEE5]/50 tracking-widest uppercase">
              <span>SCROLL TO TRAVEL THE ARCHIVE</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EF5A2A]" />
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            MAIN HORIZONTAL TRAVEL TRACK
            Images are ~62–70vw wide, ~58–66vh tall with generous editorial breathing room
            ========================================================================= */}
        <motion.div
          style={{
            scale: frameExpandScale,
          }}
          className="relative flex-1 flex items-center overflow-hidden z-10 my-auto"
        >
          <motion.div
            style={{
              x: horizontalTranslate,
              scale: exitScale,
              opacity: exitOpacity,
            }}
            className="flex items-center gap-8 sm:gap-12 md:gap-16 pl-4 sm:pl-12 lg:pl-24 pr-24 will-change-transform"
          >
            {VISUAL_ARCHIVE_MOMENTS.map((moment, idx) => {
              const isActive = idx === activeMomentIndex;
              const isNearby = Math.abs(idx - activeMomentIndex) <= 1;

              return (
                <div
                  key={moment.id}
                  className={`shrink-0 transition-all duration-500 ease-out flex flex-col justify-between select-none ${
                    isActive
                      ? 'w-[82vw] sm:w-[68vw] lg:w-[58vw] max-w-4xl opacity-100 scale-100'
                      : isNearby
                      ? 'w-[78vw] sm:w-[64vw] lg:w-[54vw] max-w-3xl opacity-65 scale-[0.98]'
                      : 'w-[74vw] sm:w-[60vw] lg:w-[50vw] max-w-2xl opacity-40 scale-[0.96]'
                  }`}
                >
                  {/* Top Editorial Label Bar Outside Image */}
                  <div className="flex items-center justify-between pb-2 mb-2 text-xs font-dosis">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#EF5A2A] tracking-[0.2em]">
                        PLATE {moment.number} // {moment.step}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-[#F3EEE5]/70 tracking-wider uppercase font-semibold hidden sm:inline">
                        {moment.category}
                      </span>
                    </div>
                    <span className="text-[#F3EEE5]/60 tracking-widest font-mono text-[11px] uppercase">
                      {moment.timeline}
                    </span>
                  </div>

                  {/* Main Large Visual Frame with Subtle Parallax on Hover */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[2px] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#121210] group">
                    <motion.div
                      style={{
                        transform: isActive
                          ? `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
                          : 'none',
                      }}
                      className="w-full h-full relative"
                    >
                      <img
                        src={moment.imageUrl}
                        alt={moment.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                      {/* Rich Paper-Ink & Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* In-Image Editorial Badge */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 bg-black/80 backdrop-blur-xs border border-white/15 text-[#F3EEE5] font-dosis text-[10px] sm:text-xs uppercase tracking-[0.18em]">
                        <span className="text-[#EF5A2A] font-bold mr-1.5">●</span>
                        <span>{moment.location}</span>
                      </div>

                      {/* In-Image Tag */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-0.5 bg-[#EF5A2A]/90 text-[#0A0A09] font-dosis text-[10px] uppercase font-bold tracking-widest rounded-[1px]">
                        {moment.tag}
                      </div>

                      {/* Bottom Image Headline Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                        <h3 className="font-fraunces font-bold text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-tight drop-shadow-md">
                          {moment.title}
                        </h3>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Editorial Caption Outside Image */}
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-xs">
                    <p className="font-bitter text-[#F3EEE5]/80 text-xs sm:text-sm leading-relaxed max-w-2xl">
                      {moment.caption}
                    </p>
                    <span className="font-dosis uppercase tracking-[0.18em] text-[#EF5A2A] font-bold shrink-0">
                      {moment.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* =========================================================================
            BOTTOM NAVIGATION HINT & SCROLL CAROUSEL SYNC
            ========================================================================= */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs font-dosis text-[#F3EEE5]/60 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF5A2A] animate-pulse" />
              <span>CONTINUOUS VERTICAL SCROLL DRIVES HORIZONTAL TRAVEL</span>
            </div>
            <div className="flex items-center gap-2 text-[#F3EEE5]">
              <span>SCROLL TO UNCOVER NEXT CHAPTER</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EF5A2A]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
