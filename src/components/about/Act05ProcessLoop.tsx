/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { Lightbulb, Users, Hammer, Share2, RefreshCw, ArrowRight } from 'lucide-react';

interface SprintStage {
  step: string;
  name: string;
  tagline: string;
  duration: string;
  description: string;
  deliverables: string[];
  icon: React.ElementType;
}

const STAGES: SprintStage[] = [
  {
    step: '01',
    name: 'IDEATE',
    tagline: 'Raw inquiries over polished pitches',
    duration: 'WEEKS 01–02',
    description:
      'We open the floor to genuine questions rather than pre-packaged startup ideas. Students pin whiteboard inquiries, debate interface metaphors, and dissect whether a proposed project solves a real curiosity.',
    deliverables: ['Problem definition document', 'Initial feasibility matrix', 'Cross-disciplinary brief'],
    icon: Lightbulb,
  },
  {
    step: '02',
    name: 'ASSEMBLE',
    tagline: 'Forming complementary squads',
    duration: 'WEEKS 02–03',
    description:
      'A software developer matches with an interaction designer and a hardware prototyper. Squads agree on a 6-week roadmap, define clear ownership zones, and set up shared repositories and lab benches.',
    deliverables: ['3-to-4 member squad roster', 'System architecture map', 'Milestone roadmap'],
    icon: Users,
  },
  {
    step: '03',
    name: 'BUILD',
    tagline: 'Pairing, soldering, and iterative crits',
    duration: 'WEEKS 03–06',
    description:
      'Weekly sprints are dedicated to rapid prototyping. We pair-program on core rendering engines, mill physical wood and acrylic enclosures in the makerspace, and run peer reviews every Thursday evening.',
    deliverables: ['Functional working prototype', 'Open-source Git repository', 'CAD schematics & BOM'],
    icon: Hammer,
  },
  {
    step: '04',
    name: 'SHARE',
    tagline: 'Public demo night & permanent archive',
    duration: 'WEEK 06 & BEYOND',
    description:
      'Projects are not locked away in Google Drives. We present live demos in the engineering courtyard, publish open-source documentation, and permanently archive the artifacts for future cohorts to build upon.',
    deliverables: ['Live campus demonstration', 'Published documentation archive', 'Community release package'],
    icon: Share2,
  },
];

export const Act05ProcessLoop: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const currentStage = STAGES[activeStageIndex];

  return (
    <section
      id="act-05-process-loop"
      className="relative py-24 md:py-36 bg-[#F3EEE5] border-b border-[rgba(10,10,9,0.12)] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-mono text-xs font-bold uppercase tracking-widest">
              CHAPTER 06 // 07
            </span>
            <span className="font-dosis text-xs uppercase tracking-[0.22em] font-semibold text-[#66615A]">
              THE 4-STAGE CADENCE & LIVING LOOP
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            How ideas become reality.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              The living sprint cadence.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            We run an iterative 6-week studio cycle designed to ship tangible working artifacts.
            Crucially: sharing an artifact does not end the journey — it seeds the next inquiry.
          </p>
        </div>

        {/* The Interactive Process Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = idx === activeStageIndex;
            return (
              <button
                key={stg.step}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-6 border text-left rounded-[2px] transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-lg scale-[1.02]'
                    : 'bg-[#FAF6F0] text-[#0A0A09] border-[rgba(10,10,9,0.14)] hover:border-[#EF5A2A]'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-current/15 mb-4">
                  <span className="font-mono text-xs font-bold text-[#EF5A2A]">{stg.step}</span>
                  <span className="font-mono text-[10px] opacity-70 uppercase">{stg.duration}</span>
                </div>

                <div className="space-y-1 my-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#EF5A2A]" />
                    <h3 className="font-fraunces font-bold text-xl tracking-tight">{stg.name}</h3>
                  </div>
                  <p className="font-bitter text-xs opacity-75">{stg.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown */}
        <div className="p-8 sm:p-12 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-sm mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#EF5A2A] uppercase">
                STAGE {currentStage.step} // {currentStage.name}
              </span>
              <span className="font-mono text-xs text-[#66615A] uppercase">• {currentStage.duration}</span>
            </div>

            <h3 className="font-fraunces font-bold text-2xl sm:text-4xl text-[#0A0A09]">
              {currentStage.tagline}
            </h3>

            <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed">
              {currentStage.description}
            </p>
          </div>

          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-[rgba(10,10,9,0.12)] pt-6 lg:pt-0 lg:pl-8 space-y-3">
            <span className="font-mono text-xs font-bold text-[#0A0A09] uppercase tracking-wider block">
              KEY DELIVERABLES:
            </span>
            <ul className="space-y-2">
              {currentStage.deliverables.map((deliv) => (
                <li key={deliv} className="flex items-center gap-2 font-bitter text-sm text-[#66615A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] shrink-0" />
                  <span>{deliv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The Loop Payoff: SHARE loops back to IDEATE */}
        <div className="p-8 sm:p-12 bg-[#0A0A09] text-[#F3EEE5] rounded-[3px] border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-[#EF5A2A] font-mono text-xs font-bold uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 animate-spin [animation-duration:8s]" />
                <span>THE RECURSIVE ARCHIVE</span>
              </div>
              <h3 className="font-fraunces font-bold text-2xl sm:text-3xl text-white">
                Share is not an exit. It is the beginning of the next cycle.
              </h3>
              <p className="font-bitter text-sm sm:text-base text-[#A6A095] leading-relaxed">
                When a cohort presents their work at demo night, future builders don't start from zero.
                They fork the codebase, examine the circuit schematics, and pose deeper questions.
              </p>
            </div>

            {/* Visual SVG Trajectory Vector Loop */}
            <div className="lg:col-span-4 flex items-center justify-center p-4">
              <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs font-bold text-white uppercase">
                <span className="px-2.5 py-1 bg-white/10 rounded-[2px]">IDEATE</span>
                <span className="text-[#EF5A2A]">→</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-[2px]">BUILD</span>
                <span className="text-[#EF5A2A]">→</span>
                <span className="px-2.5 py-1 bg-[#EF5A2A] text-[#0A0A09] rounded-[2px]">SHARE</span>
                <span className="text-[#EF5A2A] animate-pulse">↺</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
