/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { ArrowUpRight } from 'lucide-react';

interface LeadCrewMemberProps {
  id?: string;
  member: TeamMember;
  index: number;
  total: number;
  onSelectMember: (member: TeamMember) => void;
}

/**
 * LEAD CREW MEMBER (COORDINATOR SEQUENCE)
 * 
 * Strict Composition:
 * Left: Portrait (Cinematic, high-contrast, authentic)
 * Right:
 *   - 01 / 02 / 03
 *   - NAME
 *   - COORDINATOR / LEAD ROLE
 *   - SHORT BIO (from source data only)
 *   - Small metadata row: AREA, ROLE, YEAR
 * 
 * Scroll Interaction:
 *   - Native scroll with transforms on portrait scale (0.96 -> 1.02), reveal, and text translation.
 */
export const LeadCrewMember: React.FC<LeadCrewMemberProps> = ({
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

  // Motion transforms
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.35, 0.7, 0.95],
    shouldReduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );

  const portraitScale = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [1, 1, 1] : [0.96, 1.0, 1.02]
  );

  const portraitTranslateY = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [0, 0, 0] : [24, 0, -16]
  );

  const textTranslateY = useTransform(
    scrollYProgress,
    [0.12, 0.45, 0.85],
    shouldReduceMotion ? [0, 0, 0] : [28, 0, -10]
  );

  const textOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.4],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );

  return (
    <div
      ref={containerRef}
      id={id || `lead-crew-${member.id}`}
      className="relative w-full py-16 sm:py-24 lg:py-28 bg-[#F3EEE5] text-[#0A0A09] flex items-center justify-center border-b border-[#0A0A09]/15 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden"
    >
      {/* Background Watermark Index */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-16 font-dosis font-bold text-[20vw] text-[#0A0A09]/[0.025] pointer-events-none select-none tracking-tighter"
        aria-hidden="true"
      >
        {paddedIndex}
      </div>

      <motion.div
        style={{ opacity: sceneOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-16 items-center"
      >
        {/* LEFT: Portrait Photograph */}
        <motion.div
          style={{ scale: portraitScale, y: portraitTranslateY }}
          className="lg:col-span-6 w-full flex justify-center"
        >
          <div
            onClick={() => onSelectMember(member)}
            className="group relative w-full max-w-lg aspect-[4/5] bg-[#E3DDD1] overflow-hidden border-2 border-[#0A0A09] shadow-md cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`View dossier of ${member.name}, ${member.role}`}
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
                className="w-full h-full object-cover grayscale contrast-105 group-hover:scale-[1.03] group-hover:grayscale-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ objectPosition: member.imagePosition || 'center 20%' }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A] bg-[#E5DFD3]">
                <NexusIcon size="xl" />
                <span className="mt-4 font-dosis text-xs tracking-[0.24em] uppercase text-[#66615A]">
                  PORTRAIT
                </span>
              </div>
            )}

            {/* Corner Architectural Pins */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#EF5A2A]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#EF5A2A]" />

            {/* Hover Cue */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A09] text-white text-[10px] font-dosis font-bold tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>EXPLORE DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Sequential Data */}
        <motion.div
          style={{ y: textTranslateY, opacity: textOpacity }}
          className="lg:col-span-6 w-full flex flex-col justify-center space-y-6"
        >
          {/* Index & Header Marker */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-white font-dosis text-xs font-bold tracking-[0.22em] uppercase">
              LEAD CREW // {paddedIndex}
            </span>
            <span className="font-dosis text-xs font-medium tracking-[0.2em] text-[#66615A]">
              [{paddedIndex} / {paddedTotal}]
            </span>
          </div>

          {/* Role & Name */}
          <div className="space-y-1">
            <span className="block font-dosis font-bold text-xs sm:text-sm tracking-[0.24em] text-[#F97316] uppercase">
              {member.role}
            </span>
            <h3 className="font-fraunces font-bold text-3xl sm:text-4xl md:text-5xl text-[#0A0A09] tracking-tight leading-[1.08]">
              {member.name}
            </h3>
          </div>

          {/* Architectural Rule */}
          <div className="w-full h-[1px] bg-[#0A0A09]/15" />

          {/* Short Bio (Authentic source data only) */}
          {member.bio && (
            <p className="font-bitter text-base sm:text-lg text-[#0A0A09]/85 leading-relaxed max-w-lg">
              {member.bio}
            </p>
          )}

          {/* Small Metadata Row: AREA | ROLE | YEAR */}
          <div className="pt-2 grid grid-cols-3 gap-2 border-t border-b border-[#0A0A09]/10 py-3 text-left">
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                AREA
              </span>
              <span className="font-dosis font-bold text-xs text-[#0A0A09] truncate block mt-0.5" title={member.discipline}>
                {member.discipline.split('&')[0].trim()}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                ROLE
              </span>
              <span className="font-dosis font-bold text-xs text-[#0A0A09] truncate block mt-0.5" title={member.role}>
                {member.role}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                YEAR
              </span>
              <span className="font-dosis font-bold text-xs text-[#F97316] truncate block mt-0.5">
                {member.yearOfStudy || '—'}
              </span>
            </div>
          </div>

          {/* Direct Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectMember(member)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0A0A09] text-white hover:bg-[#F97316] transition-colors duration-200 font-dosis font-bold text-xs tracking-[0.22em] uppercase border border-[#0A0A09] cursor-pointer group"
            >
              <span>VIEW PROFILE</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
