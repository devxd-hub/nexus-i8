/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, Compass, Sparkles } from 'lucide-react';

interface StoryChapter01IntersectionProps {
  onScrollToNext: () => void;
}

/**
 * SIGNATURE NEXUS OPENING STORY SEQUENCE:
 * X → APPROACH → ORANGE FIELD → NEGATIVE SPACE X → TEXT EMERGENCE → ORANGE RELEASES
 *
 * Designed as a continuous, 100% reversible scroll track.
 */
export const StoryChapter01Intersection: React.FC<StoryChapter01IntersectionProps> = ({ onScrollToNext }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Local scroll progress for this opening sequence track (0.0 to 1.0 across the scroll track)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // =========================================================================
  // SCROLL-DRIVEN TRANSFORMATION MAPPINGS
  // =========================================================================

  // 1. SCENE 1 & 2: Initial Hero state → Approach (0.00 -> 0.40)
  // X scales up smoothly from 1.0 to ~2.2 as user scrolls down
  const xScale = useTransform(scrollYProgress, [0.0, 0.22, 0.45, 0.70], [1.0, 1.45, 2.2, 2.4]);
  const xTranslateY = useTransform(scrollYProgress, [0.0, 0.35, 0.60], [0, -20, -40]);
  const xOpacity = useTransform(scrollYProgress, [0.0, 0.35, 0.48, 0.58, 0.75], [1, 1, 0.85, 0.2, 0]);

  // Initial hero metadata fades back as user approaches the X
  const heroMetaOpacity = useTransform(scrollYProgress, [0.0, 0.18, 0.32], [1, 0.4, 0]);
  const heroMetaY = useTransform(scrollYProgress, [0.0, 0.25], [0, -16]);

  // 2. SCENE 2 & 3: Orange begins spreading outward FROM the X (0.30 -> 0.60)
  // Orange burst originates directly from the X center along its diagonal geometric axes
  const orangeBurstScale = useTransform(scrollYProgress, [0.28, 0.42, 0.58], [0.08, 0.85, 3.2]);
  const orangeBurstOpacity = useTransform(scrollYProgress, [0.28, 0.38, 0.55, 0.85, 1.0], [0, 0.95, 1, 1, 0.15]);
  const orangeBurstRotate = useTransform(scrollYProgress, [0.28, 0.58], [0, 15]);

  // 3. SCENE 4: X becomes Negative-Space Silhouette inside the orange field (0.45 -> 0.65)
  const silhouetteOpacity = useTransform(scrollYProgress, [0.42, 0.50, 0.62, 0.75], [0, 0.95, 0.45, 0.08]);
  const silhouetteScale = useTransform(scrollYProgress, [0.42, 0.60, 0.80], [1.8, 2.3, 2.6]);

  // 4. SCENE 5: Text Emerges FROM the Orange Field (0.55 -> 0.88)
  // Staggered hierarchy: chapter label -> primary statement -> supporting text -> archival plate -> CTA
  const textLabelOpacity = useTransform(scrollYProgress, [0.52, 0.60, 0.88], [0, 1, 1]);
  const textLabelY = useTransform(scrollYProgress, [0.52, 0.60], [14, 0]);

  const statementOpacity = useTransform(scrollYProgress, [0.56, 0.65, 0.90], [0, 1, 1]);
  const statementY = useTransform(scrollYProgress, [0.56, 0.65], [20, 0]);

  const supportingCopyOpacity = useTransform(scrollYProgress, [0.60, 0.70, 0.92], [0, 1, 1]);
  const supportingCopyY = useTransform(scrollYProgress, [0.60, 0.70], [18, 0]);

  const plateOpacity = useTransform(scrollYProgress, [0.66, 0.76, 0.95], [0, 1, 1]);
  const plateY = useTransform(scrollYProgress, [0.66, 0.76], [22, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0.72, 0.82], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.72, 0.82], [14, 0]);

  // 5. SCENE 6: Orange Releases into the next chapter background (0.85 -> 1.0)
  const releaseGradientOpacity = useTransform(scrollYProgress, [0.80, 0.96, 1.0], [0, 0.85, 1]);

  return (
    <div
      ref={sectionRef}
      id="chapter-01-intersection"
      className="relative w-full h-[260vh] bg-[#F3EEE5] text-[#0A0A09]"
    >
      {/* Pinned / Sticky Viewport Stage (100vh height, sticky at top) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* =========================================================================
            BACKGROUND LAYER & SUBTLE ARCHITECTURAL GRID
            ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0A0A09_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* =========================================================================
            SCENE 2 & 3: ORANGE EXPANSION ORIGINATING FROM THE X
            Composed as an expanding geometric diamond/X polygon that bursts from center
            ========================================================================= */}
        <motion.div
          style={{
            scale: orangeBurstScale,
            opacity: orangeBurstOpacity,
            rotate: orangeBurstRotate,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] sm:w-[100vw] sm:h-[100vw] max-w-none pointer-events-none z-10 flex items-center justify-center origin-center"
          aria-hidden="true"
        >
          {/* Layered Orange Geometry radiating along the 45° X axes */}
          <div className="w-full h-full bg-[#EF5A2A] rounded-full sm:rounded-[38%] shadow-[0_0_120px_rgba(239,90,42,0.6)] relative overflow-hidden">
            {/* Fine texture grain overlay on orange field */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* Subtle tonal gradient highlighting center radiation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D64416] via-[#EF5A2A] to-[#F26E43] opacity-90" />
          </div>
        </motion.div>

        {/* =========================================================================
            SCENE 4: X AS NEGATIVE-SPACE SILHOUETTE INSIDE ORANGE
            ========================================================================= */}
        <motion.div
          style={{
            opacity: silhouetteOpacity,
            scale: silhouetteScale,
            y: xTranslateY,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 pointer-events-none z-15 flex items-center justify-center select-none"
          aria-hidden="true"
        >
          {/* Negative Space White/Cream Cutout of the actual authentic X */}
          <img
            src="/NEXUS-removebg-preview-1.png"
            alt="NEXUS X Silhouette"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain brightness-0 invert opacity-95 filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        {/* =========================================================================
            SCENE 1: INITIAL HERO STATE WITH THE AUTHENTIC NEXUS X
            ========================================================================= */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col h-full justify-between">
          
          {/* Top Metadata Header Bar */}
          <motion.div
            style={{
              opacity: heroMetaOpacity,
              y: heroMetaY,
            }}
            className="flex items-center justify-between pb-4 border-b border-[rgba(10,10,9,0.14)]"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
                CHAPTER 01 // 09
              </span>
              <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
                THE INTERSECTION POINT
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-dosis text-[#66615A] tracking-[0.16em]">
              <span>ORIGIN // EST. 2024</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A]" />
              <span>NEXUS STUDIO COLLECTIVE</span>
            </div>
          </motion.div>

          {/* Central Hero Stage: The Approaching Authentic X Artwork */}
          <div className="relative flex-1 flex flex-col items-center justify-center text-center my-auto">
            <motion.div
              style={{
                scale: xScale,
                y: xTranslateY,
                opacity: xOpacity,
              }}
              className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-68 md:h-68 lg:w-76 lg:h-76 flex items-center justify-center select-none transition-transform"
            >
              {/* The Canonical Orange X Artwork */}
              <img
                src="/NEXUS-removebg-preview-1.png"
                alt="NEXUS X"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_8px_32px_rgba(239,90,42,0.22)]"
              />
            </motion.div>

            {/* Initial Hero Subtitle (fades as user approaches) */}
            <motion.div
              style={{
                opacity: heroMetaOpacity,
                y: heroMetaY,
              }}
              className="mt-6 space-y-2 max-w-md mx-auto"
            >
              <h2 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09] uppercase tracking-tight">
                THE INTERSECTION
              </h2>
              <p className="font-bitter text-xs sm:text-sm text-[#66615A] leading-relaxed">
                Scroll down to approach the mark and uncover the inception manifesto.
              </p>
            </motion.div>
          </div>

          {/* Bottom Initial Scroll Prompt Indicator */}
          <motion.div
            style={{
              opacity: heroMetaOpacity,
              y: heroMetaY,
            }}
            className="pb-6 sm:pb-8 flex items-center justify-between text-xs font-dosis text-[#66615A] tracking-[0.2em] uppercase"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF5A2A] animate-pulse" />
              <span>SCROLL TO APPROACH</span>
            </div>
            <div className="flex items-center gap-2">
              <span>EXPLORE STORY</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#EF5A2A] animate-bounce" />
            </div>
          </motion.div>
        </div>

        {/* =========================================================================
            SCENE 5: TEXT EMERGENCE FROM THE ORANGE FIELD
            Strict hierarchy & high-contrast cream/white typography on orange
            ========================================================================= */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-center overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pointer-events-auto">
            
            {/* 1. Small Chapter Label */}
            <motion.div
              style={{
                opacity: textLabelOpacity,
                y: textLabelY,
              }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/30 rounded-full text-[#FAF6F0] font-mono text-xs uppercase tracking-widest font-bold mb-4 backdrop-blur-xs"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>CHAPTER 01 // THE MANIFESTO</span>
            </motion.div>

            {/* 2. Large Primary Statement */}
            <motion.div
              style={{
                opacity: statementOpacity,
                y: statementY,
              }}
              className="space-y-2 mb-6 max-w-4xl"
            >
              <h1 className="font-fraunces font-bold text-4xl sm:text-6xl lg:text-7xl text-[#FAF6F0] leading-[1.04] tracking-tight drop-shadow-xs">
                Ideas are better together.
                <span className="block italic text-white font-normal mt-1 font-fraunces">
                  We had questions.
                </span>
              </h1>
            </motion.div>

            {/* 3. Supporting Copy & Specifications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start mb-8">
              <motion.div
                style={{
                  opacity: supportingCopyOpacity,
                  y: supportingCopyY,
                }}
                className="lg:col-span-7 space-y-4"
              >
                <p className="font-bitter text-lg sm:text-xl text-[#F3EEE5] leading-relaxed font-light drop-shadow-xs">
                  NEXUS is a student-founded collective that rejects the separation between technical
                  engineering and artistic craft. We build software, physical instruments, and digital
                  experiences where code meets human curiosity.
                </p>
                
                <div className="p-4 bg-black/20 border border-white/20 rounded-[2px] backdrop-blur-xs text-[#FAF6F0] flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                  <span>WHERE DISCIPLINES CONVERGE</span>
                  <span className="text-white font-bold">100% STUDENT LED</span>
                </div>
              </motion.div>

              {/* 4. Archival Documentary Plate */}
              <motion.div
                style={{
                  opacity: plateOpacity,
                  y: plateY,
                }}
                className="lg:col-span-5 relative aspect-[16/10] rounded-[2px] overflow-hidden border border-white/30 shadow-lg bg-[#0A0A09]/40 group"
              >
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85"
                  alt="Students collaborating across design and technology disciplines at the studio bench"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[#FAF6F0] font-dosis text-[10px] sm:text-[11px] uppercase tracking-wider">
                  <span>PLATE 01 // INTERDISCIPLINARY BENCH</span>
                  <span className="text-white font-bold">EST. 2026</span>
                </div>
              </motion.div>
            </div>

            {/* 5. Navigation & Next Chapter Trigger */}
            <motion.div
              style={{
                opacity: ctaOpacity,
                y: ctaY,
              }}
              className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/20 text-[#FAF6F0]"
            >
              <div className="flex items-center gap-2 text-xs font-dosis uppercase tracking-[0.2em] font-semibold">
                <Compass className="w-3.5 h-3.5 text-white" />
                <span>CONTINUE SCROLLING TO TRACE WHY WE EXIST</span>
              </div>

              <button
                onClick={onScrollToNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0A0A09] hover:bg-[#FAF6F0] font-dosis text-xs font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all duration-200 cursor-pointer shadow-md group"
              >
                <span>EXPLORE WHY WE EXIST</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#EF5A2A] group-hover:translate-y-0.5 transition-transform" />
              </button>
            </motion.div>

          </div>
        </div>

        {/* =========================================================================
            SCENE 6: ORANGE FIELD RELEASES INTO CHAPTER 02 BACKGROUND
            ========================================================================= */}
        <motion.div
          style={{ opacity: releaseGradientOpacity }}
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#EBE5DB]/60 to-[#EBE5DB] pointer-events-none z-35"
        />
      </div>
    </div>
  );
};
