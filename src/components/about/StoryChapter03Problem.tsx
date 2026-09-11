/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { Split, Layers, Flame, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStoryScroll } from './ScrollStoryContext.tsx';

export const StoryChapter03Problem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'silo' | 'nexus'>('nexus');
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 03 (0.28 -> 0.40 timeline)
  const pillarsStaggerY = useTransform(smoothProgress, [0.28, 0.35, 0.42], [20, 0, -10]);
  const comparisonCardElevation = useTransform(smoothProgress, [0.30, 0.36, 0.44], [0, 4, 0]);

  return (
    <section
      id="chapter-03-problem"
      className="relative py-20 sm:py-28 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5] text-[#0A0A09] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 03 // 09
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE STRUCTURAL PROBLEM
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            Why does this exist?
            <span className="block italic text-[#EF5A2A] font-normal lowercase first-letter:uppercase text-2xl sm:text-4xl mt-2 font-fraunces">
              Because classrooms build silos, not squads.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            Higher education excels at teaching theoretical rigor, but departmental architecture
            inadvertently walls students into isolated micro-communities.
          </p>
        </div>

        {/* 3 Core Friction Points Grid with Subtle Scroll Depth */}
        <motion.div
          style={{ y: pillarsStaggerY }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs transition-all duration-300 hover:border-[#EF5A2A] hover:bg-white group rounded-[2px]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">01</span>
              <Split className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              DEPARTMENTAL ISLANDS
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Software engineers spend semesters debugging algorithmic proofs without ever
              collaborating with an interaction designer. Meanwhile, design students create wireframes
              that never get wired to a database.
            </p>
          </div>

          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs transition-all duration-300 hover:border-[#EF5A2A] hover:bg-white group rounded-[2px]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">02</span>
              <Layers className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              THE SYLLABUS DISCARD CYCLE
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Class projects are submitted for a grade in week 12 and abandoned in week 13.
              Without continuity, students lack an enduring archive to test, iterate, and build real
              long-term technical momentum.
            </p>
          </div>

          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs transition-all duration-300 hover:border-[#EF5A2A] hover:bg-white group rounded-[2px]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">03</span>
              <Flame className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              THE MISSING BUILD BENCH
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              When a student has a wild technical or aesthetic inquiry, there is rarely a physical
              workbench, a supply of microcontrollers, or a peer community ready to spend the
              weekend prototyping it together.
            </p>
          </div>
        </motion.div>

        {/* Interactive Contrast: The Traditional Model vs. The NEXUS Studio Model */}
        <motion.div
          style={{ y: comparisonCardElevation }}
          className="p-6 sm:p-10 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(10,10,9,0.12)] mb-8">
            <div>
              <span className="font-dosis text-xs font-bold tracking-[0.22em] text-[#EF5A2A] uppercase block">
                STRUCTURAL ARCHITECTURE
              </span>
              <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#0A0A09] uppercase">
                From Fragmentation to Synthesis
              </h3>
            </div>

            {/* Toggle Controls */}
            <div className="inline-flex p-1 bg-[#EBE5DB] rounded-[2px] border border-[rgba(10,10,9,0.12)]">
              <button
                onClick={() => setActiveTab('silo')}
                className={`px-4 py-2 font-dosis text-xs font-bold tracking-[0.16em] uppercase rounded-[2px] transition-all cursor-pointer ${
                  activeTab === 'silo'
                    ? 'bg-[#0A0A09] text-[#F3EEE5] shadow-xs'
                    : 'text-[#66615A] hover:text-[#0A0A09]'
                }`}
              >
                The Traditional Model
              </button>
              <button
                onClick={() => setActiveTab('nexus')}
                className={`px-4 py-2 font-dosis text-xs font-bold tracking-[0.16em] uppercase rounded-[2px] transition-all cursor-pointer ${
                  activeTab === 'nexus'
                    ? 'bg-[#EF5A2A] text-white shadow-xs'
                    : 'text-[#66615A] hover:text-[#0A0A09]'
                }`}
              >
                The NEXUS Studio Model
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'silo' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-dosis font-bold text-xs tracking-[0.2em] uppercase">
                  <AlertCircle className="w-4 h-4" />
                  <span>FRAGMENTED WORKFLOW</span>
                </div>
                <h4 className="font-fraunces font-bold text-2xl text-[#0A0A09]">
                  Single-Discipline Isolation
                </h4>
                <p className="font-bitter text-[#66615A] leading-relaxed text-sm sm:text-base">
                  Assignments are strictly graded by isolated rubric criteria. Students write code
                  solely for unit test assertions, sketch designs purely for static slide decks, and
                  graduate without ever experiencing genuine cross-functional product shipping.
                </p>
                <div className="p-4 bg-[#EBE5DB]/70 border-l-2 border-rose-600 text-xs font-dosis uppercase tracking-wider text-[#0A0A09] space-y-1">
                  <div>• No cross-department team pairing</div>
                  <div>• Discarded repos after semester end</div>
                  <div>• High barrier for beginner physical computing</div>
                </div>
              </div>

              <div className="p-6 bg-[#EBE5DB] border border-[rgba(10,10,9,0.12)] space-y-3 font-dosis text-xs uppercase tracking-widest text-[#66615A]">
                <div className="flex items-center justify-between p-3 bg-white/60 border border-[rgba(10,10,9,0.08)]">
                  <span>CS / ENGINEERING</span>
                  <span className="text-rose-600 font-bold">SILO A</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 border border-[rgba(10,10,9,0.08)]">
                  <span>DESIGN & ART</span>
                  <span className="text-rose-600 font-bold">SILO B</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 border border-[rgba(10,10,9,0.08)]">
                  <span>RESEARCH & LABS</span>
                  <span className="text-rose-600 font-bold">SILO C</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#EF5A2A] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SYNTHETIC STUDIO ECOSYSTEM</span>
                </div>
                <h4 className="font-fraunces font-bold text-2xl text-[#0A0A09]">
                  Cross-Disciplinary Cohorts
                </h4>
                <p className="font-bitter text-[#66615A] leading-relaxed text-sm sm:text-base">
                  NEXUS squads pair a software engineer, an interaction designer, and a media or
                  hardware specialist from day one. Ideas move rapidly through tactile breadboarding,
                  weekly critique sessions, and live campus exhibitions.
                </p>
                <div className="p-4 bg-[#EBE5DB]/70 border-l-2 border-[#EF5A2A] text-xs font-dosis uppercase tracking-wider text-[#0A0A09] space-y-1">
                  <div>✓ Balanced 3-5 person multidisciplinary squads</div>
                  <div>✓ Permanent open-source campus archive</div>
                  <div>✓ Shared lab benches, tools & mentorship</div>
                </div>
              </div>

              <div className="p-6 bg-[#0A0A09] text-[#F3EEE5] border border-[rgba(243,238,229,0.18)] space-y-3 font-dosis text-xs uppercase tracking-widest">
                <div className="flex items-center justify-between p-3 bg-white/10 border border-white/10">
                  <span className="font-bold text-white">NEXUS MULTIDISCIPLINARY SQUAD</span>
                  <span className="text-[#EF5A2A] font-bold">ACTIVE BENCH</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 space-y-1 text-[#F3EEE5]/80">
                  <div className="flex justify-between">
                    <span>1. LEAD ARCHITECT (CS)</span>
                    <span className="text-[#EF5A2A]">SYSTEMS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. INTERACTION DESIGNER (ART)</span>
                    <span className="text-[#EF5A2A]">TYPOGRAPHY</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. HARDWARE PROTOTYPER (ECE)</span>
                    <span className="text-[#EF5A2A]">PHYSICAL FAB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};
