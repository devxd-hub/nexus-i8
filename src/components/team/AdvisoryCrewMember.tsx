/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { ArrowUpRight } from 'lucide-react';

interface AdvisoryCrewMemberProps {
  id?: string;
  member: TeamMember;
  index: number;
  total: number;
  onSelectMember: (member: TeamMember) => void;
}

/**
 * ADVISORY CREW MEMBER (MENTOR SEQUENCE)
 * 
 * Distinctive, authoritative, and spacious composition.
 * Slower transition, deep editorial framing.
 */
export const AdvisoryCrewMember: React.FC<AdvisoryCrewMemberProps> = ({
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
    [0.15, 0.4, 0.75, 0.95],
    shouldReduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );

  const portraitScale = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [1, 1, 1] : [0.97, 1.0, 1.03]
  );

  const textTranslateY = useTransform(
    scrollYProgress,
    [0.15, 0.45],
    shouldReduceMotion ? [0, 0] : [24, 0]
  );

  return (
    <div
      ref={containerRef}
      id={id || `advisory-crew-${member.id}`}
      className="relative w-full py-16 sm:py-24 lg:py-28 bg-[#0C0C0C] text-[#F5EFE6] flex items-center justify-center border-b border-[rgba(245,239,230,0.10)] px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden"
    >
      <motion.div
        style={{ opacity: sceneOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center"
      >
        {/* Authoritative Editorial Portrait */}
        <motion.div
          style={{ scale: portraitScale }}
          className="lg:col-span-6 w-full flex justify-center"
        >
          <div
            onClick={() => onSelectMember(member)}
            className="group relative w-full max-w-lg aspect-[4/5] bg-[#141414] overflow-hidden border border-[rgba(245,239,230,0.14)] shadow-md cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`View advisory dossier of ${member.name}`}
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
                className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ objectPosition: member.imagePosition || 'center 20%' }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#857E74] bg-[#141414]">
                <NexusIcon size="xl" />
                <span className="mt-4 font-dosis text-xs tracking-[0.24em] uppercase text-[#857E74]">
                  ADVISORY PORTRAIT
                </span>
              </div>
            )}

            {/* Corner Precision Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F2613F]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F2613F]" />

            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#0C0C0C] text-[#F5EFE6] border border-[rgba(245,239,230,0.14)] text-[10px] font-dosis font-bold tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>EXPLORE DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-[#F2613F]" />
            </div>
          </div>
        </motion.div>

        {/* Spacious Advisory Information */}
        <motion.div
          style={{ y: textTranslateY }}
          className="lg:col-span-6 w-full flex flex-col justify-center space-y-6"
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#181818] border border-[rgba(242,97,63,0.3)] text-[#F5EFE6] font-dosis text-xs font-bold tracking-[0.22em] uppercase">
              ADVISORY CREW // {paddedIndex}
            </span>
            <span className="font-dosis text-xs font-medium tracking-[0.2em] text-[#857E74]">
              [{paddedIndex} / {paddedTotal}]
            </span>
          </div>

          <div className="space-y-1">
            <span className="block font-dosis font-bold text-xs sm:text-sm tracking-[0.24em] text-[#F2613F] uppercase">
              {member.role}
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

          {/* Small Metadata Row: AREA | ROLE | YEAR */}
          <div className="grid grid-cols-3 gap-3 border-t border-b border-[rgba(245,239,230,0.10)] py-3 text-left">
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                AREA
              </span>
              <span className="font-dosis font-bold text-xs text-[#F5EFE6] truncate block mt-0.5" title={member.discipline}>
                {member.discipline.split('&')[0].trim()}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                ROLE
              </span>
              <span className="font-dosis font-bold text-xs text-[#F5EFE6] truncate block mt-0.5" title={member.role}>
                {member.role}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                STATUS
              </span>
              <span className="font-dosis font-bold text-xs text-[#F2613F] truncate block mt-0.5">
                {member.yearOfStudy || 'Advisory'}
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
