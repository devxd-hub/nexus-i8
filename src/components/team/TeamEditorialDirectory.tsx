/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUpRight, Filter } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface TeamEditorialDirectoryProps {
  id?: string;
  members: TeamMember[];
  onSelectMember: (member: TeamMember) => void;
}

/**
 * THE CAST — EDITORIAL MOSAIC
 * An intentionally composed editorial mosaic with mixed portrait sizes,
 * crops, alignments, and rhythmic spacing.
 * 
 * Each member cleanly presents Name and Role.
 * Additional information emerges on hover and through direct click.
 */
export const TeamEditorialDirectory: React.FC<TeamEditorialDirectoryProps> = ({
  id = 'the-cast-mosaic',
  members,
  onSelectMember,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('ALL');

  const groups = ['ALL', 'COORDINATOR & MENTOR', 'MANAGEMENT', 'IDEATION', 'CONTENT'];

  const filteredMembers =
    activeGroup === 'ALL'
      ? members
      : members.filter((m) => {
          if (activeGroup === 'COORDINATOR & MENTOR') {
            return (
              m.group === 'COORDINATOR & MENTOR' ||
              m.role.includes('COORDINATOR') ||
              m.role.includes('MENTOR')
            );
          }
          return m.group === activeGroup;
        });

  return (
    <section
      id={id}
      className="relative w-full py-24 sm:py-32 bg-[#EFE9DF] text-[#0A0A09] border-t-2 border-[#0A0A09]"
    >
      <Container>
        {/* Section Header: Understated Editorial Typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#0A0A09]/15">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <SectionLabel number="03" label="COMPLETE ROSTER" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A0A09] text-white text-[10px] font-dosis tracking-[0.2em] uppercase">
                <NexusIcon size="xs" />
                <span>COMMUNITY</span>
              </span>
            </div>
            <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] tracking-tight leading-[1.05]">
              THE CAST
            </h2>
            <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed">
              The full collective of students collaborating across hardware fabrication, software systems, visual identities, and editorial research.
            </p>
          </div>

          {/* Member Count Indicator */}
          <div className="flex items-center gap-3 font-dosis text-xs tracking-[0.2em] text-[#66615A] uppercase">
            <span className="font-bold text-[#0A0A09] text-2xl font-fraunces">
              {filteredMembers.length}
            </span>
            <span>MEMBERS</span>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#0A0A09]/10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2 text-xs font-dosis font-bold tracking-[0.2em] text-[#66615A]">
              <Filter className="w-3.5 h-3.5 text-[#EF5A2A]" />
              <span>FILTER:</span>
            </div>
            {groups.map((group) => {
              const isActive = activeGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`px-3 py-1 text-xs font-dosis font-bold tracking-[0.18em] uppercase transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-[#0A0A09] text-white border-[#0A0A09]'
                      : 'bg-[#E5DFD4]/80 text-[#0A0A09] border-[#0A0A09]/15 hover:border-[#0A0A09] hover:bg-[#E5DFD4]'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {/* The Cast: Intentionally Composed Editorial Mosaic */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {filteredMembers.map((member, idx) => {
            // Curate asymmetrical grid layout rhythm based on index:
            // Large anchor cards: span 6 cols (e.g. idx 0, 7)
            // Medium tall cards: span 4 cols (e.g. idx 1, 2, 5, 6)
            // Compact cards: span 3 cols or 4 cols
            const isFocal = idx === 0 || idx === 6;
            const isMedium = idx % 4 === 1 || idx % 4 === 2;

            let colSpan = 'lg:col-span-4';
            let aspectCrop = 'aspect-[4/5]';

            if (isFocal) {
              colSpan = 'lg:col-span-6';
              aspectCrop = 'aspect-[16/11]';
            } else if (isMedium) {
              colSpan = 'lg:col-span-4';
              aspectCrop = 'aspect-[4/5]';
            } else {
              colSpan = 'lg:col-span-3';
              aspectCrop = 'aspect-square';
            }

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`group relative bg-[#F7F3EB] border border-[#0A0A09]/15 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#0A0A09] hover:bg-white hover:shadow-md cursor-pointer select-none ${colSpan}`}
                role="button"
                tabIndex={0}
                aria-label={`View dossier for ${member.name}, ${member.role}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMember(member);
                  }
                }}
              >
                {/* Metatag Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#0A0A09]/10 text-[10px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                  <span>{member.group}</span>
                  <span className="text-[#EF5A2A]">{member.yearOfStudy}</span>
                </div>

                {/* Portrait */}
                <div
                  className={`relative w-full my-4 bg-[#E3DDD1] overflow-hidden border border-[#0A0A09]/10 ${aspectCrop}`}
                >
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale contrast-105 group-hover:scale-[1.03] group-hover:grayscale-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ objectPosition: member.imagePosition || 'center 20%' }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A]">
                      <NexusIcon size="md" />
                      <span className="mt-2 font-dosis text-[10px] tracking-widest uppercase">
                        NEXUS
                      </span>
                    </div>
                  )}

                  {/* Corner Accent Line */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#EF5A2A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#EF5A2A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Typography: Name + Role */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-dosis font-bold tracking-[0.22em] text-[#EF5A2A] uppercase block">
                      {member.role}
                    </span>
                    <h3 className="font-fraunces font-bold text-lg sm:text-xl text-[#0A0A09] tracking-tight group-hover:translate-x-0.5 transition-transform duration-200">
                      {member.name}
                    </h3>
                  </div>

                  {/* Additional information on hover/focus */}
                  <p className="font-bitter text-xs text-[#66615A] line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 group-hover:text-[#0A0A09] transition-colors duration-200">
                    {member.discipline}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#0A0A09]/10 text-[10px] font-dosis font-bold tracking-[0.2em] text-[#0A0A09] group-hover:text-[#EF5A2A] transition-colors duration-200">
                    <span>VIEW DOSSIER</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
