/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface EditorialMentorHeroProps {
  id?: string;
  member: TeamMember;
  index: number;
  total: number;
  onSelectMember: (member: TeamMember) => void;
}

/**
 * EDITORIAL MENTOR HERO
 * 
 * Slightly wider portrait framing and spacious negative space,
 * presenting guidance and domain expertise in the editorial yearbook.
 */
export const EditorialMentorHero: React.FC<EditorialMentorHeroProps> = ({
  id,
  member,
  index,
  total,
  onSelectMember,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const paddedIndex = String(index + 1).padStart(2, '0');
  const paddedTotal = String(total).padStart(2, '0');

  const sceneOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.75, 0.95],
    shouldReduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );

  const photoScale = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [1, 1, 1] : [0.97, 1.0, 1.02]
  );

  const textTranslateY = useTransform(
    scrollYProgress,
    [0.12, 0.42],
    shouldReduceMotion ? [0, 0] : [24, 0]
  );

  return (
    <div
      ref={containerRef}
      id={id || `mentor-hero-${member.id}`}
      className="relative w-full min-h-[92vh] lg:min-h-screen py-24 sm:py-32 bg-[#0C0C0C] text-[#F5EFE6] flex items-center justify-center border-b border-[rgba(245,239,230,0.10)] px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden select-none"
    >
      <motion.div
        style={{ opacity: sceneOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-16 items-center"
      >
        {/* Wider Framed Portrait Composition */}
        <motion.div
          style={{ scale: photoScale }}
          className="lg:col-span-6 w-full flex justify-center"
        >
          <div
            onClick={() => onSelectMember(member)}
            className="group relative w-full max-w-lg aspect-[4/5] bg-[#141414] overflow-hidden border border-[rgba(245,239,230,0.14)] shadow-md cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Open advisory yearbook dossier for ${member.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMember(member);
              }
            }}
          >
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ objectPosition: member.imagePosition || 'center 20%' }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#857E74] bg-[#141414]">
                <NexusIcon size="xl" />
                <span className="mt-4 font-dosis text-xs tracking-[0.24em] uppercase text-[#857E74]">
                  MENTOR PORTRAIT
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F2613F]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F2613F]" />

            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#0C0C0C] text-[#F5EFE6] border border-[rgba(245,239,230,0.14)] text-[10px] font-dosis font-bold tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>EXPLORE DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-[#F2613F]" />
            </div>
          </div>
        </motion.div>

        {/* Advisory / Guidance Information */}
        <motion.div
          style={{ y: textTranslateY }}
          className="lg:col-span-6 w-full flex flex-col justify-center space-y-6"
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#181818] border border-[rgba(242,97,63,0.3)] text-[#F5EFE6] font-dosis text-xs font-bold tracking-[0.22em] uppercase">
              STUDIO MENTOR // {paddedIndex}
            </span>
            <span className="font-dosis text-xs font-medium tracking-[0.2em] text-[#857E74]">
              [{paddedIndex} / {paddedTotal}]
            </span>
          </div>

          <div className="space-y-1">
            <span className="block font-dosis font-bold text-xs sm:text-sm tracking-[0.26em] text-[#F2613F] uppercase">
              ADVISORY &amp; GUIDANCE
            </span>
            <h3 className="font-fraunces font-bold text-3xl sm:text-5xl text-[#F5EFE6] tracking-tight leading-[1.05]">
              {member.name}
            </h3>
          </div>

          <div className="w-full h-[1px] bg-[rgba(245,239,230,0.10)]" />

          {member.bio && (
            <p className="font-bitter text-base sm:text-lg text-[#C2BBB0] leading-relaxed">
              {member.bio}
            </p>
          )}

          {/* Small Metadata Block */}
          <div className="grid grid-cols-2 gap-4 border-t border-[rgba(245,239,230,0.10)] pt-4 text-left">
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                AREA OF ADVISORY
              </span>
              <span className="font-dosis font-bold text-xs text-[#F5EFE6] block mt-0.5">
                {member.discipline}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                ROLE
              </span>
              <span className="font-dosis font-bold text-xs text-[#F2613F] block mt-0.5">
                {member.role}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectMember(member)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#F2613F] text-[#F5EFE6] hover:bg-[#FA7958] transition-colors duration-200 font-dosis font-bold text-xs tracking-[0.22em] uppercase border border-[#F2613F] cursor-pointer group"
            >
              <span>VIEW DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
