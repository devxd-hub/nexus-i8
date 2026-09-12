/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { TeamMember } from '../../types.ts';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface LeadershipShowcaseProps {
  id?: string;
  coordinators: TeamMember[];
  mentors: TeamMember[];
  onSelectMember: (member: TeamMember) => void;
}

/**
 * LEADERSHIP & ADVISORY SHOWCASE
 *
 * Displays Coordinators and Mentors aligned together in the same row,
 * sharing the same visual card grammar as the other team members but
 * proportionately larger and more prominent.
 */
export const LeadershipShowcase: React.FC<LeadershipShowcaseProps> = ({
  id = 'leadership-showcase',
  coordinators,
  mentors,
  onSelectMember,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Combine both into one unified array for consistent row rendering
  const leadershipMembers: { member: TeamMember; badge: string; categoryLabel: string }[] = [
    ...coordinators.map((c) => ({
      member: c,
      badge: c.role === 'COORDINATOR' ? 'COORDINATOR' : c.role,
      categoryLabel: 'STUDIO LEADERSHIP',
    })),
    ...mentors.map((m) => ({
      member: m,
      badge: 'MENTOR',
      categoryLabel: 'ADVISORY & GUIDANCE',
    })),
  ];

  return (
    <section
      id={id}
      className="relative w-full py-12 sm:py-16 bg-[#EBE4D8] text-[#0A0A09] border-b border-[#0A0A09]/20"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-[#0A0A09]/15">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <SectionLabel number="01" label="LEADERSHIP &amp; ADVISORY" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A0A09] text-white text-[10px] font-dosis font-bold tracking-[0.22em] uppercase">
                <NexusIcon size="xs" />
                <span>DIRECTORS</span>
              </span>
            </div>
            <h2 className="font-fraunces font-bold text-3xl sm:text-4xl text-[#0A0A09] tracking-tight uppercase">
              COORDINATOR &amp; MENTOR
            </h2>
            <p className="font-bitter text-sm sm:text-base text-[#66615A] max-w-xl leading-relaxed">
              Guiding studio operations, cross-disciplinary sprint roadmaps, engineering architecture, and squad mentorship.
            </p>
          </div>

          <div className="flex items-center gap-2 font-dosis text-xs font-bold tracking-[0.2em] text-[#66615A] uppercase self-start sm:self-end">
            <span className="font-fraunces text-2xl text-[#0A0A09] font-bold">
              {String(leadershipMembers.length).padStart(2, '0')}
            </span>
            <span>LEADERS</span>
          </div>
        </div>

        {/* Coordinators & Mentors in the Same Row (Grid aligned side-by-side) */}
        <div
          className={`pt-8 sm:pt-10 grid grid-cols-1 md:grid-cols-2 ${
            leadershipMembers.length >= 3
              ? 'lg:grid-cols-3 max-w-5xl lg:max-w-6xl'
              : 'max-w-4xl lg:max-w-5xl'
          } gap-6 sm:gap-8 mx-auto items-stretch`}
          onMouseLeave={() => setHoveredId(null)}
        >
          {leadershipMembers.map(({ member, badge, categoryLabel }) => {
            const isHovered = hoveredId === member.id;
            const isAnyHovered = hoveredId !== null;
            const isDimmed = isAnyHovered && !isHovered;

            return (
              <motion.div
                key={member.id}
                onMouseEnter={() => setHoveredId(member.id)}
                onClick={() => onSelectMember(member)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative bg-[#FAF7F2] border-2 border-[#0A0A09]/20 p-6 sm:p-7 flex flex-col justify-between transition-[transform,opacity,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu cursor-pointer select-none shadow-sm ${
                  isHovered
                    ? 'border-[#0A0A09] bg-white shadow-2xl -translate-y-1 z-10'
                    : isDimmed
                    ? 'opacity-45'
                    : 'hover:border-[#0A0A09]'
                }`}
                role="button"
                tabIndex={0}
                aria-label={`View dossier of ${member.name}, ${badge}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMember(member);
                  }
                }}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#0A0A09]/15 text-xs font-dosis font-bold tracking-[0.2em] uppercase">
                    <span className="text-[#66615A]">{categoryLabel}</span>
                    <span className="px-2 py-0.5 bg-[#EF5A2A] text-white text-[10px] tracking-[0.2em]">
                      {badge}
                    </span>
                  </div>

                  {/* Prominent Portrait (Larger scale than standard cards) */}
                  <div className="relative w-full aspect-[4/5] my-4 bg-[#E5DFD4] overflow-hidden border border-[#0A0A09]/20 shadow-xs">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isHovered ? 'scale-[1.04]' : 'scale-100'
                        }`}
                        style={{ objectPosition: member.imagePosition || 'center 20%' }}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A] bg-[#ECE5D8]">
                        <NexusIcon size="lg" />
                        <span className="mt-2 font-dosis text-xs tracking-widest uppercase">
                          PORTRAIT
                        </span>
                      </div>
                    )}

                    {/* Corner Architectural Pins */}
                    <div
                      className={`absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#EF5A2A] transition-opacity duration-200 ${
                        isHovered ? 'opacity-100' : 'opacity-80'
                      }`}
                    />
                    <div
                      className={`absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#EF5A2A] transition-opacity duration-200 ${
                        isHovered ? 'opacity-100' : 'opacity-80'
                      }`}
                    />
                  </div>

                  {/* Identity & Role Description */}
                  <div className="space-y-2.5 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs font-dosis font-bold tracking-[0.24em] text-[#EF5A2A] uppercase block">
                        {member.role}
                      </span>
                      <h3 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09] tracking-tight leading-tight">
                        {member.name}
                      </h3>
                    </div>

                    {member.discipline && (
                      <p className="font-bitter text-sm sm:text-[15px] font-semibold text-[#0A0A09] leading-snug">
                        {member.discipline}
                      </p>
                    )}

                    {member.bio && (
                      <p className="font-bitter text-xs sm:text-sm text-[#66615A] leading-relaxed line-clamp-3 pt-1">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-5 flex items-center justify-between border-t border-[#0A0A09]/15 text-xs font-dosis font-bold tracking-[0.22em] text-[#0A0A09] group-hover:text-[#EF5A2A] transition-colors duration-200">
                  <span>EXPLORE DOSSIER</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
