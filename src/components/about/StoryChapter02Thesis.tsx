/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { useStoryScroll } from './ScrollStoryContext.tsx';

export const StoryChapter02Thesis: React.FC = () => {
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 02 (0.12 -> 0.28 timeline)
  const thesisCardY = useTransform(smoothProgress, [0.12, 0.20, 0.28], [24, 0, -12]);
  const orangeGlowOpacity = useTransform(smoothProgress, [0.12, 0.20, 0.28], [0.3, 0.9, 0.4]);
  const quoteScale = useTransform(smoothProgress, [0.14, 0.22, 0.30], [0.98, 1, 0.99]);

  return (
    <section
      id="chapter-02-thesis"
      className="relative py-20 sm:py-28 md:py-36 bg-[#EBE5DB] text-[#0A0A09] border-b border-[rgba(10,10,9,0.12)] overflow-hidden"
    >
      {/* Background Soft Orange Atmospheric Accent */}
      <motion.div
        style={{ opacity: orangeGlowOpacity }}
        className="absolute top-1/4 right-0 w-96 h-96 bg-[#EF5A2A]/5 rounded-full blur-3xl pointer-events-none"
      />

      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 02 // 09
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              WHY NEXUS EXISTS
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            The Core Thesis.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              Where code meets human curiosity.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            We started with a fundamental realization: college campuses possess immense student talent,
            yet institutional structures keep builders in separate departments.
          </p>
        </div>

        {/* Large Editorial Thesis Block with Scroll Reaction */}
        <motion.div
          style={{ y: thesisCardY, scale: quoteScale }}
          className="max-w-4xl mx-auto p-8 sm:p-14 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] shadow-[0_16px_40px_rgba(10,10,9,0.06)] rounded-[2px] space-y-6 mb-16 md:mb-24"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(10,10,9,0.12)]">
            <span className="font-dosis text-xs font-bold tracking-[0.2em] uppercase text-[#EF5A2A]">
              THE 1:00 AM BENCH PRINCIPLE
            </span>
            <NexusIcon size="xs" />
          </div>

          <blockquote className="font-bitter text-2xl sm:text-3xl md:text-4xl text-[#0A0A09] italic leading-snug">
            &ldquo;The most exciting student projects are not born inside a solitary classroom
            exam, but at a shared wooden lab bench at 1:00 AM.&rdquo;
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(10,10,9,0.08)] text-xs font-mono text-[#66615A] uppercase tracking-wider">
            <span>OPEN TO ALL MAJORS & DISCIPLINES</span>
            <span className="text-[#EF5A2A] font-bold">100% STUDENT LED & GOVERNED</span>
          </div>
        </motion.div>

        {/* The Turning Point Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[rgba(10,10,9,0.12)]">
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-[2px] overflow-hidden border border-[rgba(10,10,9,0.18)] shadow-xs bg-[#E2DBCF]">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
              alt="Hardware lab bench with oscilloscope and tactile breadboard prototype"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-105"
            />
            <div className="absolute bottom-3 left-3 bg-[#0A0A09]/85 text-[#F3EEE5] px-3 py-1 font-dosis text-[10px] uppercase tracking-[0.2em]">
              HARDWARE BENCH // 48-HOUR SPRINT
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF5A2A]" />
              <span className="font-dosis text-xs uppercase tracking-[0.24em] text-[#EF5A2A] font-bold">
                THE TURNING POINT
              </span>
            </div>
            <blockquote className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09] leading-snug">
              &ldquo;We realized that the best ideas die in the gap between what one student knows and
              what another student loves to make.&rdquo;
            </blockquote>
            <p className="font-bitter text-sm sm:text-base text-[#66615A] leading-relaxed">
              By giving students a physical floor, common tooling, and a collaborative mandate, we
              turned solitary side projects into campus-defining public artifacts.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
