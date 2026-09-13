/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { RevealSection } from '../motion/MotionPrimitives.tsx';
import { ProcessLoopCard } from './process/ProcessLoopCard.tsx';
import { TextLink } from '../primitives/Button.tsx';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  copy: string;
  tag: string;
  shortTag: string;
  pill: string;
}

const STAGES: Stage[] = [
  {
    number: '01',
    name: 'IDEATE',
    copy: 'Bring the question, idea, problem or experiment.',
    tag: 'EXPLORATION & INQUIRY',
    shortTag: 'INQUIRY',
    pill: 'IDEA',
  },
  {
    number: '02',
    name: 'ASSEMBLE',
    copy: 'Find students whose skills and perspective complement yours.',
    tag: 'TEAM & DISCIPLINE MATCH',
    shortTag: 'PEOPLE',
    pill: 'PEOPLE',
  },
  {
    number: '03',
    name: 'BUILD',
    copy: 'Prototype, test, break, redesign and make.',
    tag: 'PROTOTYPE & ITERATION',
    shortTag: 'ITERATION',
    pill: 'BUILD',
  },
  {
    number: '04',
    name: 'SHARE',
    copy: 'Present the result, document the process and let others build on it.',
    tag: 'EXHIBIT & OPEN KNOWLEDGE',
    shortTag: 'KNOWLEDGE',
    pill: 'SHARE',
  },
];

/**
 * THE NEXUS LOOP: FROM IDEA TO SOMETHING REAL.
 * A living, continuous process diagram connecting four stages:
 * IDEA → PEOPLE → BUILD → KNOWLEDGE ↘ back to IDEA.
 */
export const ProcessSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [clickedStage, setClickedStage] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  const handleStageClick = (idx: number) => {
    setActiveStage(idx);
    setClickedStage(idx);
    setTimeout(() => setClickedStage(null), 240);
  };

  return (
    <RevealSection
      id="nexus-how-it-works"
      className="relative w-full py-14 sm:py-18 md:py-22 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] overflow-hidden transition-colors duration-250"
    >
      {/* Background Architectural Watermark Curve (echoes homepage trajectory line) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M -100 240 C 320 180, 560 620, 940 450 C 1220 320, 1420 680, 1600 580"
          stroke="rgba(242, 97, 63, 0.06)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
        <path
          d="M -80 720 C 380 780, 680 320, 1100 520 C 1320 620, 1500 420, 1620 400"
          stroke="rgba(245, 239, 230, 0.03)"
          strokeWidth="1.5"
        />
      </svg>

      <Container className="relative z-10">
        {/* Section Header with Staggered Entrance */}
        <div className="max-w-4xl mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionLabel number="02" label="METHOD & PROGRESSION" />
            
            {/* The Loop Concept Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 text-xs font-dosis tracking-[0.18em] text-[var(--text-muted)] uppercase select-none">
              <span>THE NEXUS LOOP</span>
              <span className="opacity-40">/</span>
              <span className="text-[var(--text-primary)] font-semibold">IDEA → PEOPLE → BUILD → SHARE ↺</span>
            </div>
          </div>

          {/* Heading with restrained typographic accent */}
          <h2 className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.08] tracking-tight uppercase">
            <span>FROM IDEA TO SOMETHING </span>
            <span className="text-[var(--text-primary)]">REAL</span>
            <span className="text-[#F2613F]">.</span>
          </h2>

          <p className="font-bitter text-[var(--text-secondary)] max-w-2xl text-base sm:text-lg pt-1 leading-relaxed">
            A continuous loop from raw curiosity to functional, shared student work.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* THE PROCESS COMPOSITION: STAGES TIMELINE + CREATIVE FLOATING PANEL       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Left Column: Interactive Stages Spine & Rows (7 Columns) */}
          <div
            ref={listRef}
            className="lg:col-span-7 xl:col-span-7 relative"
            role="tablist"
            aria-label="NEXUS Process Stages"
          >
            {/* Background Spine Guideline (Desktop) */}
            <div
              className="hidden sm:block absolute left-3 md:left-4 top-10 bottom-12 w-[1px] bg-[var(--border-subtle)] pointer-events-none"
              aria-hidden="true"
            />

            {/* Active Process Signal traveling down the spine */}
            {!shouldReduceMotion && (
              <motion.div
                className="hidden sm:block absolute left-[11px] md:left-[15px] w-1.5 h-1.5 rounded-full bg-[#F2613F] pointer-events-none z-20 shadow-[0_0_8px_rgba(242,97,63,0.8)]"
                animate={{
                  top: ['8%', '34%', '62%', '88%', '8%'],
                }}
                transition={{
                  duration: 11,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              />
            )}

            {/* Editorial Stages Rows */}
            <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)]">
              {STAGES.map((stage, idx) => {
                const isActive = activeStage === idx;
                const isClicked = clickedStage === idx;

                return (
                  <div
                    key={stage.number}
                    id={`process-stage-${stage.number}`}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    onMouseEnter={() => setActiveStage(idx)}
                    onFocus={() => setActiveStage(idx)}
                    onClick={() => handleStageClick(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStageClick(idx);
                      }
                    }}
                    className={`relative py-5 sm:py-7 md:py-8 px-3 sm:px-6 md:pl-10 group transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none cursor-pointer select-none ${
                      isActive
                        ? 'bg-[var(--bg-surface)] sm:translate-x-1.5'
                        : 'hover:bg-[var(--bg-surface)]/50'
                    } ${isClicked ? 'scale-[0.99]' : 'scale-100'}`}
                  >
                    {/* Process Spine Node Marker */}
                    <div
                      className="hidden sm:flex absolute left-2 md:left-3 top-10 -translate-x-1/2 items-center justify-center pointer-events-none z-10"
                      aria-hidden="true"
                    >
                      <div
                        className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                          isActive
                            ? 'border-[#F2613F] bg-[#F2613F] shadow-[0_0_0_3px_rgba(242,97,63,0.2)]'
                            : 'border-[var(--border-strong)] bg-[var(--bg-primary)] group-hover:border-[var(--text-primary)]'
                        }`}
                      />
                    </div>

                    {/* Active Left Border Accent */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? 'w-1 bg-[#F2613F]' : 'w-0 bg-transparent'
                      }`}
                      aria-hidden="true"
                    />

                    {/* Content Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-12 gap-3 md:gap-6 items-baseline">
                      {/* Stage Number */}
                      <div className="col-span-1 md:col-span-2 flex items-baseline gap-2">
                        <span
                          className={`font-dosis text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider transition-all duration-300 ${
                            isActive
                              ? 'text-[var(--text-primary)]'
                              : 'text-[var(--text-primary)]/30 group-hover:text-[var(--text-primary)]/60'
                          }`}
                        >
                          {stage.number}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#F2613F] shrink-0 self-center"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      {/* Stage Name & Tag */}
                      <div className="col-span-3 md:col-span-4">
                        <h3
                          className={`font-bitter text-2xl sm:text-3xl font-bold uppercase tracking-wide flex items-center gap-2.5 transition-all duration-300 ${
                            isActive
                              ? 'text-[var(--text-primary)] translate-x-1'
                              : 'text-[var(--text-primary)]/80 group-hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <span>{stage.name}</span>
                          <NexusIcon
                            size="xs"
                            className={`transition-opacity duration-300 text-[#F2613F] ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                            }`}
                          />
                        </h3>
                        <span
                          className={`font-dosis text-[11px] font-semibold uppercase tracking-[0.2em] mt-1.5 block transition-colors duration-300 ${
                            isActive ? 'text-[#F2613F]' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {stage.tag}
                        </span>
                      </div>

                      {/* Stage Description */}
                      <div className="col-span-4 md:col-span-6 md:pl-2">
                        <p
                          className={`font-bitter text-base sm:text-lg leading-relaxed transition-all duration-300 ${
                            isActive
                              ? 'text-[var(--text-primary)] opacity-100 font-medium'
                              : 'text-[var(--text-secondary)] opacity-80 group-hover:opacity-95'
                          }`}
                        >
                          {stage.copy}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Inline Micro-Visual Card */}
                    <div className="lg:hidden mt-5">
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <ProcessLoopCard
                              activeIndex={activeStage}
                              onSelectStage={setActiveStage}
                              isInlineMobile={true}
                              className="w-full mt-2"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subtle Progress Bar on Active Row */}
                    <div
                      className={`mt-4 h-[1.5px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? 'w-full bg-[#F2613F]' : 'w-0 bg-transparent'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>

            {/* Continuous Loop Return Arc below Stage 04 */}
            <div className="pt-6 pb-2 flex items-center justify-between text-xs font-dosis tracking-[0.2em] text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-[#F2613F]" aria-hidden="true" />
                <span className="hidden sm:inline">CONTINUOUS LOOP: SHARE (04) RE-SEEDS NEW IDEA (01)</span>
                <span className="sm:hidden">CONTINUOUS LOOP</span>
              </div>
              <TextLink
                label="CYCLE LOOP"
                onClick={() => setActiveStage((prev) => (prev + 1) % 4)}
                showArrow={true}
                arrowType="right"
              />
            </div>
          </div>

          {/* Right Column: Floating Creative Process Card (Desktop: Sticky 5 Columns) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-28">
            <ProcessLoopCard
              activeIndex={activeStage}
              onSelectStage={setActiveStage}
              className="w-full"
            />

            {/* Supporting Editorial Caption beneath the Card */}
            <div className="mt-4 px-2 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F2613F] mt-1 shrink-0" />
              <p className="font-bitter text-xs text-[var(--text-secondary)] leading-relaxed">
                Every completed NEXUS project documents its source code, design decisions, and prototype iterations—providing a launching pad for the next cohort.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </RevealSection>
  );
};

