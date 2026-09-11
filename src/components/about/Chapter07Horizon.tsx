/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, SecondaryButton } from '../primitives/Button.tsx';
import { NexusIcon, InteractiveNexusX } from '../brand/NexusLogo.tsx';
import { AppRoute } from '../../types.ts';
import { Sparkles, Calendar, Compass, ArrowRight, ShieldCheck, Terminal, MapPin } from 'lucide-react';

interface Chapter07HorizonProps {
  onRouteChange: (route: AppRoute) => void;
}

export const Chapter07Horizon: React.FC<Chapter07HorizonProps> = ({ onRouteChange }) => {
  return (
    <section
      id="chapter-07"
      className="relative py-24 md:py-36 bg-[#F3EEE5] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
              CHAPTER 07 / 07
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE HORIZON & BEYOND
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            This is just the beginning.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              Where we are going next.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            NEXUS is expanding beyond single-semester cohorts into a permanent open-access campus
            innovation lab and enduring digital archive.
          </p>
        </div>

        {/* 3 Pillars of Expansion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">01</span>
              <Terminal className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              ENDURING CODEBASE REPOSITORY
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Every project ships with complete open-source documentation, Git history, and architecture
              blueprints so new students can build upon previous work rather than reinventing the wheel.
            </p>
          </div>

          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">02</span>
              <MapPin className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              DEDICATED MAKER WORKBENCHES
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              We are outfitting permanent rapid-prototyping benches with CNC tooling, soldering
              stations, and variable display monitors accessible to all students across majors.
            </p>
          </div>

          <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">03</span>
              <ShieldCheck className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase tracking-tight text-[#0A0A09]">
              CROSS-CAMPUS COLLABORATIVE NETWORK
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Partnering with sister university clubs to launch regional student hack sprints, design
              critiques, and intercollegiate physical computing exhibitions.
            </p>
          </div>
        </div>

        {/* Community at a Glance Card */}
        <div className="p-8 sm:p-10 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-sm mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[rgba(10,10,9,0.1)] gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <NexusIcon size="xs" />
              <span className="font-dosis text-xs font-bold text-[#0A0A09] uppercase tracking-[0.2em]">
                NEXUS AT A GLANCE // COHORT 2026–2027
              </span>
            </div>
            <span className="font-dosis text-xs text-[#EF5A2A] font-bold tracking-[0.2em]">
              OPEN REGISTRATION
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-dosis text-xs">
            <div className="space-y-1">
              <span className="uppercase text-[#66615A] tracking-wider block">MEMBERSHIP</span>
              <span className="font-bold text-[#0A0A09] text-sm tracking-wide block">
                Open to All Majors
              </span>
            </div>
            <div className="space-y-1">
              <span className="uppercase text-[#66615A] tracking-wider block">STUDIO SESSIONS</span>
              <span className="font-bold text-[#0A0A09] text-sm tracking-wide block">
                Thurs & Sat Labs
              </span>
            </div>
            <div className="space-y-1">
              <span className="uppercase text-[#66615A] tracking-wider block">SPRINT LENGTH</span>
              <span className="font-bold text-[#0A0A09] text-sm tracking-wide block">
                6-Week Sprints
              </span>
            </div>
            <div className="space-y-1">
              <span className="uppercase text-[#66615A] tracking-wider block">GOVERNANCE</span>
              <span className="font-bold text-[#EF5A2A] text-sm tracking-wide block">
                100% Student Led
              </span>
            </div>
          </div>
        </div>

        {/* Final Story Resolution & Primary Action Triggers */}
        <div className="p-8 sm:p-12 bg-[#0A0A09] text-[#F3EEE5] rounded-[2px] border border-[rgba(243,238,229,0.16)] shadow-lg text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <InteractiveNexusX sizeClass="w-14 h-14 mx-auto" />
            <h3 className="font-fraunces font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Ready to build what matters?
            </h3>
            <p className="font-bitter text-sm sm:text-base text-[#F3EEE5]/80 leading-relaxed">
              Whether you have an embryonic idea, a specific technical inquiry, or simply want to
              join a squad as an engineer, designer, or researcher — your bench is ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <PrimaryButton
              label="EXPLORE ALL PROJECTS"
              onClick={() => onRouteChange('/projects')}
              showArrow={true}
            />
            <SecondaryButton
              label="MEET THE SQUAD"
              onClick={() => onRouteChange('/team')}
              showArrow={true}
              className="bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10"
            />
            <button
              onClick={() => onRouteChange('/contact')}
              className="px-6 py-3.5 bg-transparent text-[#EF5A2A] hover:text-white font-dosis font-bold text-xs tracking-[0.2em] uppercase border border-[#EF5A2A] hover:bg-[#EF5A2A] rounded-[2px] transition-all cursor-pointer"
            >
              GET IN TOUCH →
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};
