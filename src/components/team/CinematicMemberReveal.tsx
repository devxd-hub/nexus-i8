/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { ArrowUpRight } from 'lucide-react';

interface CinematicMemberRevealProps {
  id?: string;
  member: TeamMember;
  index: number;
  categoryLabel: string; // e.g. "COORDINATOR" or "MENTOR"
  totalCount: number;
  imageOnRight?: boolean;
  isMentor?: boolean;
  descriptor?: string;
  onSelectMember: (member: TeamMember) => void;
}

/**
 * CINEMATIC MEMBER REVEAL (OPENING CREDITS SCENE)
 * 
 * Controlled choreography:
 * - Image scale: 0.96 -> 1.02
 * - Text translateY: 30px -> 0
 * - Name opacity: 0 -> 1
 * - Role opacity: 0 -> 1
 * - Independent portrait & text motion
 * - Restrained, editorial, film-like stillness
 */
export const CinematicMemberReveal: React.FC<CinematicMemberRevealProps> = ({
  id,
  member,
  index,
  categoryLabel,
  totalCount,
  imageOnRight = false,
  isMentor = false,
  descriptor,
  onSelectMember,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Choreographed transforms: 
  // Slower transitions and more breathing room if isMentor
  const entranceThreshold = isMentor ? [0.15, 0.4, 0.7, 0.95] : [0.1, 0.35, 0.65, 0.9];

  const sceneOpacity = useTransform(
    scrollYProgress,
    entranceThreshold,
    shouldReduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );

  // Image scale: 0.96 -> 1.02
  const imageScale = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [1, 1, 1] : [0.96, 1.0, 1.02]
  );

  // Independent small Y translation for portrait
  const imageTranslateY = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    shouldReduceMotion ? [0, 0, 0] : [20, 0, -15]
  );

  // Text Y translation: 30px -> 0
  const textTranslateY = useTransform(
    scrollYProgress,
    [0.12, 0.42, 0.85],
    shouldReduceMotion ? [0, 0, 0] : [30, 0, -10]
  );

  // Name opacity: 0 -> 1
  const nameOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.38],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );

  // Role opacity: 0 -> 1
  const roleOpacity = useTransform(
    scrollYProgress,
    [0.18, 0.42],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );

  const descriptorOpacity = useTransform(
    scrollYProgress,
    [0.22, 0.48],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );

  const paddedIndex = String(index + 1).padStart(2, '0');
  const paddedTotal = String(totalCount).padStart(2, '0');

  // Fallback descriptor if not provided
  const oneLineDescriptor =
    descriptor ||
    member.discipline ||
    'Spearheading studio systems, physical tooling, and cross-disciplinary project cohorts.';

  return (
    <div
      ref={containerRef}
      id={id || `cinematic-scene-${member.id}`}
      className={`relative w-full flex items-center justify-center overflow-hidden border-b border-[#0A0A09]/10 ${
        isMentor
          ? 'min-h-[95vh] lg:min-h-[105vh] py-24 sm:py-32 bg-[#EBE4D8]'
          : 'min-h-[90vh] lg:min-h-screen py-16 sm:py-24 bg-[#F3EEE5]'
      } px-4 sm:px-8 md:px-12 lg:px-16`}
    >
      {/* Background Subtle Watermark Index */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-16 font-dosis font-bold text-[22vw] text-[#0A0A09]/[0.025] pointer-events-none select-none tracking-tighter"
        aria-hidden="true"
      >
        {paddedIndex}
      </div>

      <motion.div
        style={{ opacity: sceneOpacity }}
        className={`relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center ${
          imageOnRight ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Large Portrait (45-55vw Desktop) */}
        <motion.div
          style={{ scale: imageScale, y: imageTranslateY }}
          className={`lg:col-span-7 w-full ${imageOnRight ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <div
            onClick={() => onSelectMember(member)}
            className="group relative w-full aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] bg-[#E3DDD1] overflow-hidden border border-[#0A0A09]/20 shadow-sm cursor-pointer"
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
            {/* Portrait Image */}
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
                  STUDIO PORTRAIT
                </span>
              </div>
            )}

            {/* Corner Architectural Pins */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#EF5A2A]" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#EF5A2A]" />

            {/* Subtle Hover Cue */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#0A0A09] text-white text-[10px] font-dosis font-bold tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>EXPLORE DOSSIER</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </motion.div>

        {/* Editorial Text Scene Information */}
        <motion.div
          style={{ y: textTranslateY }}
          className={`lg:col-span-5 w-full flex flex-col justify-center space-y-6 ${
            imageOnRight ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          {/* Index & Role Marker */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-white font-dosis text-xs font-bold tracking-[0.22em] uppercase">
              {categoryLabel} // {paddedIndex}
            </span>
            <span className="font-dosis text-xs font-medium tracking-[0.2em] text-[#66615A]">
              [{paddedIndex} / {paddedTotal}]
            </span>
          </div>

          {/* Designation / Role */}
          <motion.div style={{ opacity: roleOpacity }} className="space-y-1">
            <span className="block font-dosis font-bold text-xs sm:text-sm tracking-[0.24em] text-[#EF5A2A] uppercase">
              {member.role}
            </span>
            {/* Name */}
            <motion.h3
              style={{ opacity: nameOpacity }}
              className="font-fraunces font-bold text-3xl sm:text-4xl md:text-5xl text-[#0A0A09] tracking-tight leading-[1.08]"
            >
              {member.name}
            </motion.h3>
          </motion.div>

          {/* Thin Architectural Rule */}
          <div className="w-full h-[1px] bg-[#0A0A09]/15" />

          {/* One-line Descriptor */}
          <motion.p
            style={{ opacity: descriptorOpacity }}
            className="font-bitter text-base sm:text-lg text-[#0A0A09]/85 leading-relaxed max-w-lg"
          >
            {oneLineDescriptor}
          </motion.p>

          {/* Direct Profile Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectMember(member)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0A0A09] text-white hover:bg-[#EF5A2A] transition-colors duration-200 font-dosis font-bold text-xs tracking-[0.22em] uppercase border border-[#0A0A09] cursor-pointer group"
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
