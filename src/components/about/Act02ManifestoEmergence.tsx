/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Container } from '../primitives/Container.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { Split, Layers, Flame } from 'lucide-react';

export const Act02ManifestoEmergence: React.FC = () => {
  return (
    <section
      id="act-02-orange-field"
      className="relative py-24 sm:py-32 md:py-40 bg-[#F3EEE5] text-[#0A0A09] border-b border-[rgba(10,10,9,0.12)]"
    >
      <Container>
        {/* Large Editorial Thesis Block */}
        <div className="max-w-4xl mx-auto p-8 sm:p-14 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] shadow-[0_16px_40px_rgba(10,10,9,0.06)] rounded-[2px] space-y-6 mb-24 md:mb-36">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(10,10,9,0.12)]">
            <span className="font-dosis text-xs font-bold tracking-[0.2em] uppercase text-[#EF5A2A]">
              THE CORE THESIS
            </span>
            <NexusIcon size="xs" />
          </div>

          <blockquote className="font-bitter text-2xl sm:text-3xl md:text-4xl text-[#0A0A09] italic leading-snug">
            &ldquo;The most exciting student projects are not born inside a solitary classroom
            exam, but at a shared wooden lab bench at 1:00 AM.&rdquo;
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(10,10,9,0.08)] text-xs font-mono text-[#66615A] uppercase tracking-wider">
            <span>OPEN TO ALL MAJORS & DISCIPLINES</span>
            <span className="text-[#EF5A2A] font-bold">100% STUDENT LED</span>
          </div>
        </div>

        {/* The Structural Problem: Silos vs Squads */}
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#EF5A2A] font-bold uppercase tracking-widest">
              <span>02 //</span>
              <span>THE STRUCTURAL PROBLEM</span>
            </div>
            <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-tight">
              Classrooms build silos, not squads.
            </h2>
            <p className="font-bitter text-base sm:text-xl text-[#66615A] max-w-3xl leading-relaxed">
              Higher education excels at teaching theoretical rigor, but departmental architecture
              inadvertently walls students into isolated micro-communities.
            </p>
          </div>

          {/* 3 Core Friction Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs hover:border-[#EF5A2A] transition-colors group">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
                <span className="font-mono text-xs font-bold text-[#EF5A2A]">01</span>
                <Split className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
              </div>
              <h3 className="font-bitter text-base font-bold uppercase text-[#0A0A09]">
                DEPARTMENTAL ISLANDS
              </h3>
              <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
                Software engineers debug algorithmic proofs without ever consulting an interaction
                designer. Designers craft wireframes that never touch real hardware or code.
              </p>
            </div>

            <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs hover:border-[#EF5A2A] transition-colors group">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
                <span className="font-mono text-xs font-bold text-[#EF5A2A]">02</span>
                <Layers className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
              </div>
              <h3 className="font-bitter text-base font-bold uppercase text-[#0A0A09]">
                THE SYLLABUS DISCARD CYCLE
              </h3>
              <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
                Class projects are submitted for a grade in week 12 and abandoned in week 13.
                Without continuity, students lack an enduring archive to iterate and build momentum.
              </p>
            </div>

            <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs hover:border-[#EF5A2A] transition-colors group">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
                <span className="font-mono text-xs font-bold text-[#EF5A2A]">03</span>
                <Flame className="w-4 h-4 text-[#66615A] group-hover:text-[#EF5A2A] transition-colors" />
              </div>
              <h3 className="font-bitter text-base font-bold uppercase text-[#0A0A09]">
                THE MISSING BUILD BENCH
              </h3>
              <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
                When a student has a wild technical or aesthetic inquiry, there is rarely a physical
                workbench, microcontrollers, or peers ready to spend the weekend prototyping.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
