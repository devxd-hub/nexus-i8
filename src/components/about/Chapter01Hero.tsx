/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon, InteractiveNexusX } from '../brand/NexusLogo.tsx';
import { ArrowDown, Sparkles, Compass } from 'lucide-react';

interface Chapter01HeroProps {
  onScrollToStory: () => void;
}

export const Chapter01Hero: React.FC<Chapter01HeroProps> = ({ onScrollToStory }) => {
  return (
    <section
      id="chapter-01"
      className="relative pt-6 sm:pt-8 md:pt-10 pb-16 md:pb-24 border-b border-[rgba(10,10,9,0.12)] overflow-hidden bg-[#F3EEE5]"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0A0A09_1px,transparent_1px)] [background-size:24px_24px]" />

      <Container className="relative z-10">
        {/* Editorial Eyebrow Metadata Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[rgba(10,10,9,0.14)] mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
              CHAPTER 01 / 07
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              ORIGIN & FOUNDATION
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-dosis text-[#66615A] tracking-[0.16em]">
            <span>ARCHIVE COHORT // 01</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A]" />
            <span>EST. 2024</span>
          </div>
        </motion.div>

        {/* Large Editorial Statement Moment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-12 lg:mb-16">
          <div className="lg:col-span-8 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-fraunces font-bold text-4xl sm:text-6xl lg:text-7xl text-[#0A0A09] leading-[1.04] tracking-tight"
            >
              Ideas are better together.
              <span className="block italic text-[#EF5A2A] mt-2 font-normal">
                We had questions.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-2xl"
            >
              NEXUS is a student-founded collective that rejects the separation between technical
              engineering and artistic craft. We build software, physical instruments, and digital
              experiences where code meets human curiosity.
            </motion.p>
          </div>

          {/* Key Stat / Anchor Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 p-6 sm:p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold tracking-[0.2em] text-[#0A0A09] uppercase">
                COMMUNITY THESIS
              </span>
              <NexusIcon size="xs" />
            </div>

            <p className="font-bitter text-sm sm:text-base text-[#0A0A09] italic leading-relaxed">
              &ldquo;The most exciting student projects are not born inside a solitary classroom
              exam, but at a shared wooden lab bench at 1:00 AM.&rdquo;
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] font-dosis uppercase tracking-[0.18em] text-[#66615A]">
              <span>OPEN TO ALL MAJORS</span>
              <span className="text-[#EF5A2A] font-bold">100% STUDENT LED</span>
            </div>
          </motion.div>
        </div>

        {/* Narrative Documentary Visual Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-[2px] overflow-hidden border border-[rgba(10,10,9,0.18)] shadow-md group"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#E2DBCF]">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85"
              alt="Students collaborating across design and technology disciplines at the NEXUS studio table"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            {/* Warm Paper-Ink Overlay Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A09]/80 via-transparent to-[#0A0A09]/20 pointer-events-none" />

            {/* In-Image Editorial Badges */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A09]/80 text-[#F3EEE5] backdrop-blur-sm border border-white/10 font-dosis text-[11px] uppercase tracking-[0.2em] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#EF5A2A] animate-pulse" />
              <span>NEXUS OPEN STUDIO ATRIUM // 2026</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-[#F3EEE5]">
              <div className="max-w-xl">
                <span className="font-dosis text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#EF5A2A] font-bold block mb-1">
                  PLATE 01 // INTERDISCIPLINARY BENCH
                </span>
                <p className="font-bitter text-xs sm:text-sm text-[#F3EEE5]/90 leading-relaxed">
                  First semester team formation: Computer Science, Mechanical Engineering, and Visual
                  Communication students outlining first prototype specifications.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-dosis uppercase tracking-widest text-[#F3EEE5]/70 shrink-0">
                <span>LAT 37.4275° N</span>
                <span>LON 122.1697° W</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Narrative Prompt Action */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t border-[rgba(10,10,9,0.1)]">
          <div className="flex items-center gap-3">
            <span className="font-dosis text-xs uppercase tracking-[0.2em] text-[#66615A] font-semibold">
              SCROLL DOWN TO TRACE THE STORY
            </span>
            <div className="w-12 h-[1px] bg-[#EF5A2A]" />
          </div>

          <button
            onClick={onScrollToStory}
            aria-label="Scroll to chapter 2"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6F0] hover:bg-white text-[#0A0A09] border border-[rgba(10,10,9,0.18)] hover:border-[#EF5A2A] font-dosis text-xs font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all duration-200 cursor-pointer group"
          >
            <span>DISCOVER THE PROBLEM</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#EF5A2A] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </Container>
    </section>
  );
};
