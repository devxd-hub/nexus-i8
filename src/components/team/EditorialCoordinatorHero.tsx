/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface EditorialCoordinatorHeroProps {
  id?: string;
  member: TeamMember;
  index: number;
  total: number;
  onSelectMember: (member: TeamMember) => void;
}

/**
 * EDITORIAL COORDINATOR HERO
 * 
 * Large photographic compositions with intentional, art-directed overlap
 * between photograph, large display typography, small numeric index, and role.
 * 
 * Paced scroll choreography (500–1200ms cubic bezier easing) without spring bounce.
 */
export const EditorialCoordinatorHero: React.FC<EditorialCoordinatorHeroProps> = ({
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

  // Smooth editorial transitions
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.32, 0.68, 0.92],
    shouldReduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );

  const photoScale = useTransform(
    scrollYProgress,
    [0.08, 0.5, 0.92],
    shouldReduceMotion ? [1, 1, 1] : [0.96, 1.0, 1.02]
  );

  const photoTranslateY = useTransform(
    scrollYProgress,
    [0.08, 0.5, 0.92],
    shouldReduceMotion ? [0, 0, 0] : [32, 0, -20]
  );

  const textTranslateY = useTransform(
    scrollYProgress,
    [0.12, 0.42, 0.85],
    shouldReduceMotion ? [0, 0, 0] : [28, 0, -12]
  );

  const nameRevealOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.38],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );

  const nameParts = member.name.split(' ');
  const firstName = nameParts[0] || member.name;
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div
      ref={containerRef}
      id={id || `coordinator-hero-${member.id}`}
      className="relative w-full min-h-[92vh] lg:min-h-screen py-16 sm:py-24 bg-[#0C0C0C] text-[#F5EFE6] flex items-center justify-center border-b border-[rgba(245,239,230,0.10)] px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden select-none"
    >
      {/* Background Watermark Numerals */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-12 font-dosis font-bold text-[24vw] text-[#F5EFE6]/[0.025] pointer-events-none select-none tracking-tighter"
        aria-hidden="true"
      >
        {paddedIndex}
      </div>

      <motion.div
        style={{ opacity: sceneOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center"
      >
        {/* Large Photographic Composition (Cols 1-7) */}
        <motion.div
          style={{ scale: photoScale, y: photoTranslateY }}
          className="lg:col-span-7 w-full relative"
        >
          <div
            onClick={() => onSelectMember(member)}
            className="group relative w-full aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] bg-[#141414] overflow-hidden border border-[rgba(245,239,230,0.14)] shadow-sm cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Open yearbook dossier for ${member.name}`}
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
                  YEARBOOK PORTRAIT
                </span>
              </div>
            )}

            {/* Corner Precision Pins */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F2613F]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F2613F]" />

            {/* Hover Cue */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#0C0C0C] text-[#F5EFE6] border border-[rgba(245,239,230,0.14)] text-[10px] font-dosis font-bold tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>EXPLORE DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-[#F2613F]" />
            </div>
          </div>
        </motion.div>

        {/* Typographic Composition with Intentional Overlap (Cols 8-12 + Negative Margins on Desktop) */}
        <motion.div
          style={{ y: textTranslateY }}
          className="lg:col-span-5 w-full flex flex-col justify-center space-y-6 lg:-ml-12 lg:relative lg:z-20 pointer-events-auto"
        >
          {/* Index & Section Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="font-fraunces font-bold text-3xl sm:text-4xl text-[#F2613F] tracking-tighter">
              {paddedIndex}
            </span>
            <div className="h-4 w-[1px] bg-[rgba(245,239,230,0.20)]" />
            <span className="font-dosis text-xs font-bold tracking-[0.24em] text-[#857E74] uppercase">
              COORDINATOR [{paddedIndex} / {paddedTotal}]
            </span>
          </div>

          {/* Large Overlapping Display Name */}
          <motion.div
            style={{ opacity: nameRevealOpacity }}
            className="space-y-1 bg-[#181818] lg:p-6 lg:border lg:border-[rgba(245,239,230,0.14)] lg:shadow-md"
          >
            <span className="font-dosis font-bold text-xs sm:text-sm tracking-[0.26em] text-[#F2613F] uppercase block">
              {member.role}
            </span>

            <h3 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-5xl xl:text-6xl text-[#F5EFE6] tracking-tight leading-[0.95] uppercase">
              {firstName}
              {lastName && (
                <>
                  <br />
                  <span className="text-[#C2BBB0]">{lastName}</span>
                </>
              )}
            </h3>

            {member.bio && (
              <p className="font-bitter text-sm sm:text-base text-[#C2BBB0] pt-4 leading-relaxed border-t border-[rgba(245,239,230,0.10)]">
                {member.bio}
              </p>
            )}

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                {member.discipline.split('&')[0].trim()}
              </span>

              <button
                type="button"
                onClick={() => onSelectMember(member)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2613F] text-[#F5EFE6] hover:bg-[#FA7958] transition-colors duration-200 font-dosis font-bold text-xs tracking-[0.2em] uppercase border border-[#F2613F] cursor-pointer"
              >
                <span>DOSSIER</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
