/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { ArrowRight, Lightbulb, Users, Hammer, Share2, Check, Clock } from 'lucide-react';

interface ProcessStep {
  stepNumber: string;
  title: string;
  tagline: string;
  duration: string;
  description: string;
  deliverables: string[];
  imageUrl: string;
  imageCaption: string;
  icon: React.ElementType;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'IDEATE',
    tagline: 'Raw inquiries over polished pitches',
    duration: 'WEEKS 01–02',
    description:
      'We open the floor to genuine questions rather than pre-packaged startup ideas. Students pin whiteboard inquiries, debate interface metaphors, and dissect whether a proposed project solves a real curiosity.',
    deliverables: [
      'Problem definition document',
      'Initial feasibility matrix',
      'Cross-disciplinary inquiry brief',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ideation critique: examining typographic scales and hardware ergonomics.',
    icon: Lightbulb,
  },
  {
    stepNumber: '02',
    title: 'ASSEMBLE',
    tagline: 'Forming complementary squads',
    duration: 'WEEKS 02–03',
    description:
      'A software developer matches with an interaction designer and a hardware prototyper. Squads agree on a 6-week roadmap, define clear ownership zones, and set up shared repositories and lab benches.',
    deliverables: [
      '3-to-4 member squad roster',
      'System architecture map',
      'Sprint milestone roadmap',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Squad assembly: matching complementary software and hardware skills.',
    icon: Users,
  },
  {
    stepNumber: '03',
    title: 'BUILD',
    tagline: 'Pairing, soldering, and iterative crits',
    duration: 'WEEKS 03–06',
    description:
      'Weekly sprints are dedicated to rapid prototyping. We pair-program on core rendering engines, mill physical wood and acrylic enclosures in the makerspace, and run peer reviews every Thursday evening.',
    deliverables: [
      'Working functional prototype',
      'Open-source Git repository',
      'CAD schematics & BOM list',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Building in the woodshop: milling walnut faceplates with capacitive touch sensors.',
    icon: Hammer,
  },
  {
    stepNumber: '04',
    title: 'SHARE',
    tagline: 'Public demo night & permanent archive',
    duration: 'WEEK 06 & BEYOND',
    description:
      'Projects are not locked away in Google Drives. We present live demos in the engineering courtyard, publish open-source documentation, and permanently archive the artifacts for future cohorts to build upon.',
    deliverables: [
      'Live campus public demonstration',
      'Published documentation archive',
      'Community release package',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Campus demo night: demonstrating interactive knowledge graphs to visiting peers.',
    icon: Share2,
  },
];

export const Chapter04Process: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const currentStep = PROCESS_STEPS[activeStepIndex];

  return (
    <section
      id="chapter-04"
      className="relative py-24 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
              CHAPTER 04 / 07
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE SPRINT CADENCE
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            We started building.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              A 6-week cycle from raw spark to shipped artifact.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            Our build framework is structured yet nimble. It ensures ideas develop the momentum
            needed to survive past initial enthusiasm.
          </p>
        </div>

        {/* Process Step Selector Rail */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {PROCESS_STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const StepIcon = step.icon;

            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 sm:p-6 text-left border rounded-[2px] transition-all duration-250 cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-md -translate-y-1'
                    : 'bg-[#FAF6F0] text-[#0A0A09] border-[rgba(10,10,9,0.16)] hover:border-[#0A0A09] hover:bg-white'
                }`}
              >
                {/* Active Orange Top Bar */}
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-[3px] bg-[#EF5A2A]" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-dosis font-bold text-xs tracking-[0.2em] ${
                      isActive ? 'text-[#EF5A2A]' : 'text-[#66615A]'
                    }`}
                  >
                    STAGE {step.stepNumber}
                  </span>
                  <StepIcon
                    className={`w-4 h-4 ${isActive ? 'text-[#EF5A2A]' : 'text-[#66615A]'}`}
                  />
                </div>

                <h3 className="font-fraunces font-bold text-lg sm:text-xl uppercase tracking-tight mb-1">
                  {step.title}
                </h3>

                <span
                  className={`font-dosis text-[11px] uppercase tracking-wider block ${
                    isActive ? 'text-[#F3EEE5]/70' : 'text-[#66615A]'
                  }`}
                >
                  {step.duration}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown & Visual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.stepNumber}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 bg-[#FAF6F0] border border-[rgba(10,10,9,0.18)] rounded-[2px] shadow-sm items-center"
          >
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#EF5A2A] text-white font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
                  STAGE {currentStep.stepNumber} // {currentStep.title}
                </span>
                <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.16em] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#EF5A2A]" />
                  {currentStep.duration}
                </span>
              </div>

              <h3 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09]">
                {currentStep.tagline}
              </h3>

              <p className="font-bitter text-[#0A0A09] text-base leading-relaxed">
                {currentStep.description}
              </p>

              <div className="pt-4 border-t border-[rgba(10,10,9,0.1)] space-y-3">
                <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#0A0A09] block">
                  STAGE DELIVERABLES
                </span>
                <ul className="space-y-2">
                  {currentStep.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 font-bitter text-sm text-[#66615A]"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#EF5A2A]/10 text-[#EF5A2A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden border border-[rgba(10,10,9,0.18)] shadow-xs bg-[#E2DBCF]">
                <img
                  src={currentStep.imageUrl}
                  alt={currentStep.imageCaption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale contrast-105"
                />
                <div className="absolute top-3 left-3 bg-[#0A0A09]/85 text-[#F3EEE5] px-2.5 py-1 font-dosis text-[10px] uppercase tracking-[0.2em]">
                  DOCUMENTATION RECORD
                </div>
              </div>
              <p className="font-dosis text-xs text-[#66615A] tracking-wider uppercase text-right">
                {currentStep.imageCaption}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(10,10,9,0.12)]">
          <button
            onClick={() => setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : PROCESS_STEPS.length - 1))}
            className="font-dosis text-xs font-bold tracking-[0.2em] uppercase text-[#66615A] hover:text-[#0A0A09] cursor-pointer"
          >
            ← PREVIOUS STAGE
          </button>

          <span className="font-dosis text-xs text-[#EF5A2A] font-bold tracking-[0.2em]">
            0{activeStepIndex + 1} / 04
          </span>

          <button
            onClick={() => setActiveStepIndex((prev) => (prev < PROCESS_STEPS.length - 1 ? prev + 1 : 0))}
            className="font-dosis text-xs font-bold tracking-[0.2em] uppercase text-[#0A0A09] hover:text-[#EF5A2A] flex items-center gap-1.5 cursor-pointer"
          >
            <span>NEXT STAGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Container>
    </section>
  );
};
