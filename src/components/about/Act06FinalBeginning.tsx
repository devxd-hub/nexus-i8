/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { PrimaryButton, SecondaryButton } from '../primitives/Button.tsx';
import { InteractiveNexusX, NexusIcon } from '../brand/NexusLogo.tsx';
import { AppRoute } from '../../types.ts';
import { Terminal, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

interface Act06FinalBeginningProps {
  onRouteChange: (route: AppRoute) => void;
}

export const Act06FinalBeginning: React.FC<Act06FinalBeginningProps> = ({ onRouteChange }) => {
  return (
    <section
      id="act-06-beginning"
      className="relative py-24 md:py-36 bg-[#FAF6F0] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-mono text-xs font-bold uppercase tracking-widest">
              CHAPTER 07 // 07
            </span>
            <span className="font-dosis text-xs uppercase tracking-[0.22em] font-semibold text-[#66615A]">
              THE HORIZON & BEYOND
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-4xl sm:text-6xl lg:text-7xl text-[#0A0A09] leading-[1.04] tracking-tight uppercase">
            This is only the beginning.
            <span className="block italic text-[#EF5A2A] font-normal text-3xl sm:text-5xl mt-2 font-fraunces">
              Where we build next.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            NEXUS is expanding beyond single-semester cohorts into a permanent open-access campus
            innovation lab, hardware workshop, and enduring digital archive.
          </p>
        </div>

        {/* 3 Pillars of Expansion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          <div className="p-8 bg-white border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-mono text-xs font-bold text-[#EF5A2A]">01</span>
              <Terminal className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase text-[#0A0A09]">
              ENDURING REPOSITORY
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Every project ships with full Git documentation and CAD schematics so future students can
              inherit and expand upon previous work.
            </p>
          </div>

          <div className="p-8 bg-white border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-mono text-xs font-bold text-[#EF5A2A]">02</span>
              <MapPin className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase text-[#0A0A09]">
              DEDICATED MAKER WORKBENCHES
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Outfitting permanent student workbenches with CNC tooling, soldering stations, and variable
              display test rigs.
            </p>
          </div>

          <div className="p-8 bg-white border border-[rgba(10,10,9,0.14)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
              <span className="font-mono text-xs font-bold text-[#EF5A2A]">03</span>
              <ShieldCheck className="w-4 h-4 text-[#66615A]" />
            </div>
            <h3 className="font-bitter text-lg font-bold uppercase text-[#0A0A09]">
              COLLABORATIVE SPRINT NETWORK
            </h3>
            <p className="font-bitter text-sm text-[#66615A] leading-relaxed">
              Partnering with sister clubs for intercollegiate student hack marathons and physical
              computing exhibitions.
            </p>
          </div>
        </div>

        {/* Visual Echo / Returning X Callback & Final Action */}
        <div className="p-10 sm:p-16 bg-[#0A0A09] text-[#F3EEE5] rounded-[3px] border border-white/10 relative overflow-hidden flex flex-col items-center text-center space-y-8">
          {/* Subtle Background Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,90,42,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Iconic Returning NEXUS X Visual Echo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative z-10">
            <InteractiveNexusX size="lg" />
          </div>

          <div className="space-y-3 max-w-2xl relative z-10">
            <h3 className="font-fraunces font-bold text-3xl sm:text-4xl text-white tracking-tight">
              The intersection is always open.
            </h3>
            <p className="font-bitter text-base text-[#A6A095]">
              Whether you write kernel code, design variable fonts, or solder synthesizers, your workbench is waiting.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={() => onRouteChange('/projects')}
              className="px-8 py-3.5 bg-[#EF5A2A] hover:bg-[#E34818] text-white font-dosis font-bold text-xs uppercase tracking-[0.2em] rounded-[2px] shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>EXPLORE PROJECTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRouteChange('/team')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-dosis font-bold text-xs uppercase tracking-[0.2em] rounded-[2px] border border-white/15 transition-colors cursor-pointer"
            >
              MEET THE TEAM
            </button>

            <button
              onClick={() => onRouteChange('/contact')}
              className="px-8 py-3.5 bg-transparent hover:bg-white/5 text-[#A6A095] hover:text-white font-dosis font-bold text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              GET IN TOUCH
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};
