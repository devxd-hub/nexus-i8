/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IdeateVisual } from './IdeateVisual.tsx';
import { AssembleVisual } from './AssembleVisual.tsx';
import { BuildVisual } from './BuildVisual.tsx';
import { ShareVisual } from './ShareVisual.tsx';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { NexusDirectionalButton } from '../../primitives/Button.tsx';

interface ProcessLoopCardProps {
  activeIndex: number;
  onSelectStage: (index: number) => void;
  className?: string;
  isInlineMobile?: boolean;
}

const STAGE_METAS = [
  {
    number: '01',
    name: 'IDEATE',
    tag: 'EXPLORATION & INQUIRY',
    descriptor: 'RAW CURIOSITY → HYPOTHESIS',
    cycleRole: 'STAGE 01 — SEED',
    actionText: 'NEXT: ASSEMBLE SQUAD',
  },
  {
    number: '02',
    name: 'ASSEMBLE',
    tag: 'TEAM & DISCIPLINE MATCH',
    descriptor: 'STUDENTS · TALENTS · DISCIPLINES',
    cycleRole: 'STAGE 02 — COHESION',
    actionText: 'NEXT: ENTER BUILD SPRINT',
  },
  {
    number: '03',
    name: 'BUILD',
    tag: 'PROTOTYPE & ITERATION',
    descriptor: 'RAPID SYNTHESIS → FUNCTIONAL ARTIFACT',
    cycleRole: 'STAGE 03 — SYNTHESIS',
    actionText: 'NEXT: SHARE WITH WORLD',
  },
  {
    number: '04',
    name: 'SHARE',
    tag: 'EXHIBIT & OPEN KNOWLEDGE',
    descriptor: 'OPEN ACCESS → COMMUNITY FEEDBACK',
    cycleRole: 'STAGE 04 — LOOP CLOSURE',
    actionText: 'LOOP: RECIRCULATE TO IDEATE',
  },
];

export const ProcessLoopCard: React.FC<ProcessLoopCardProps> = ({
  activeIndex,
  onSelectStage,
  className = '',
  isInlineMobile = false,
}) => {
  const meta = STAGE_METAS[activeIndex] || STAGE_METAS[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectStage((activeIndex + 1) % 4);
  };

  return (
    <div
      className={`relative bg-[#F3EEE5] border border-[rgba(10,10,9,0.14)] p-5 sm:p-6 shadow-[0_12px_36px_rgba(10,10,9,0.06)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[rgba(10,10,9,0.1)]">
          <span className="font-dosis font-bold text-xs tracking-[0.24em] text-[#0A0A09] uppercase">
            THE NEXUS LOOP // {meta.number}
          </span>
          <span className="font-dosis font-semibold text-[11px] tracking-[0.18em] text-[#66615A] uppercase">
            {meta.cycleRole}
          </span>
        </div>

        {/* Stage Name & Tag */}
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <div>
            <h4 className="font-fraunces font-bold text-2xl text-[#0A0A09] tracking-tight uppercase">
              {meta.name}
            </h4>
            <span className="font-dosis font-medium text-[11px] tracking-[0.16em] text-[#66615A] uppercase block mt-0.5">
              {meta.tag}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#0A0A09]/40 tracking-wider">
            0{activeIndex + 1} / 04
          </span>
        </div>
      </div>

      {/* Interactive Micro-Visual Container with smooth transition */}
      <div className="my-2 relative min-h-[190px] sm:min-h-[210px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {activeIndex === 0 && <IdeateVisual isActive={true} />}
            {activeIndex === 1 && <AssembleVisual isActive={true} />}
            {activeIndex === 2 && <BuildVisual isActive={true} />}
            {activeIndex === 3 && <ShareVisual isActive={true} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Loop Progression & Step Action */}
      <div className="pt-3 mt-1 border-t border-[rgba(10,10,9,0.1)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Continuous 4-stage Loop Segment Bar */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="NEXUS Loop Stages">
          {STAGE_METAS.map((stage, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={stage.number}
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Jump to stage ${stage.number}: ${stage.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStage(idx);
                }}
                className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#EF5A2A] ${
                  isCurrent
                    ? 'w-7 bg-[#EF5A2A]'
                    : 'w-3.5 bg-[rgba(10,10,9,0.18)] hover:bg-[rgba(10,10,9,0.4)]'
                }`}
              />
            );
          })}
        </div>

        {/* Advance or Recirculate Button */}
        <NexusDirectionalButton
          label={meta.actionText}
          onClick={handleNext}
          icon={
            activeIndex === 3 ? (
              <RotateCcw className="w-3.5 h-3.5 text-[#EF5A2A]" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-[#EF5A2A]" />
            )
          }
        />
      </div>
    </div>
  );
};
