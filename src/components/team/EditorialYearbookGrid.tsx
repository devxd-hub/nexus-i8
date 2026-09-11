/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Search, Shuffle, Grid, LayoutTemplate, Rows } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface EditorialYearbookGridProps {
  id?: string;
  members: TeamMember[];
  onSelectMember: (member: TeamMember) => void;
}

type YearbookComposition = 'broadsheet' | 'index' | 'cohorts';

/**
 * EDITORIAL YEARBOOK GRID (YEARBOOK REVEAL)
 * 
 * - Screen expands into full editorial yearbook presentation
 * - Multiple portraits progressively populate the grid
 * - Hover: portrait crop shifts slightly, name reveals, role appears
 * - Click: triggers side-drawer profile
 * - "VIEW DIFFERENTLY" control toggles between 3 predefined intentional compositions
 */
export const EditorialYearbookGrid: React.FC<EditorialYearbookGridProps> = ({
  id = 'team-yearbook-collective',
  members,
  onSelectMember,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [composition, setComposition] = useState<YearbookComposition>('broadsheet');
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  const groups = ['ALL', 'MANAGEMENT', 'IDEATION', 'CONTENT', 'COORDINATOR & MENTOR'];

  // Composition Cycle for "VIEW DIFFERENTLY"
  const compositionNames: Record<YearbookComposition, { label: string; index: string }> = {
    broadsheet: { label: 'BROADSHEET MOSAIC', index: '01' },
    index: { label: 'COLLECTIVE INDEX', index: '02' },
    cohorts: { label: 'COHORT FOLIO', index: '03' },
  };

  const handleToggleComposition = () => {
    setComposition((prev) => {
      if (prev === 'broadsheet') return 'index';
      if (prev === 'index') return 'cohorts';
      return 'broadsheet';
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesGroup =
      activeGroup === 'ALL'
        ? true
        : activeGroup === 'COORDINATOR & MENTOR'
        ? member.group === 'COORDINATOR & MENTOR' ||
          member.role.toUpperCase().includes('COORDINATOR') ||
          member.role.toUpperCase().includes('MENTOR')
        : member.group === activeGroup;

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query === '' ||
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.discipline.toLowerCase().includes(query);

    return matchesGroup && matchesQuery;
  });

  return (
    <section
      id={id}
      className="relative w-full py-24 sm:py-32 bg-[#EFE9DF] text-[#0A0A09] border-t-2 border-[#0A0A09]"
    >
      <Container>
        {/* Yearbook Title & Meta Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[#0A0A09]/15">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <SectionLabel number="03" label="ARCHIVE" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A0A09] text-white text-[10px] font-dosis font-bold tracking-[0.2em] uppercase">
                <NexusIcon size="xs" />
                <span>STUDIO YEARBOOK</span>
              </span>
            </div>
            <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] tracking-tight leading-[1.05] uppercase">
              TEAM YEARBOOK
            </h2>
            <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed">
              The complete collective of students across design systems, engineering operations, conceptual prototyping, and written editorial archives.
            </p>
          </div>

          {/* Composition Switcher ("VIEW DIFFERENTLY") */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start md:self-end">
            <button
              type="button"
              onClick={handleToggleComposition}
              className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#0A0A09] text-white hover:bg-[#EF5A2A] transition-all duration-300 font-dosis font-bold text-xs tracking-[0.22em] uppercase border border-[#0A0A09] cursor-pointer shadow-sm group"
              aria-label={`Cycle composition: currently ${compositionNames[composition].label}`}
            >
              <Shuffle className="w-3.5 h-3.5 text-[#EF5A2A] group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
              <span>VIEW DIFFERENTLY</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-white/20 text-white font-mono">
                {compositionNames[composition].index}/03
              </span>
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search */}
        <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0A0A09]/10">
          {/* Department Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {groups.map((group) => {
              const isActive = activeGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`px-3 py-1.5 text-xs font-dosis font-bold tracking-[0.16em] uppercase transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-[#0A0A09] text-white border-[#0A0A09]'
                      : 'bg-[#E5DFD4]/70 text-[#0A0A09] border-[#0A0A09]/15 hover:border-[#0A0A09] hover:bg-[#E5DFD4]'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH YEARBOOK..."
              className="w-full bg-[#E5DFD4]/70 border border-[#0A0A09]/20 px-3 py-1.5 pl-8 text-xs font-dosis font-bold tracking-[0.15em] text-[#0A0A09] placeholder:text-[#66615A]/60 focus:outline-none focus:border-[#0A0A09] focus:bg-white transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#66615A]" />
          </div>
        </div>

        {/* Active Composition Badge */}
        <div className="pt-6 flex items-center justify-between text-[10px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
          <div className="flex items-center gap-2">
            {composition === 'broadsheet' && <LayoutTemplate className="w-3.5 h-3.5 text-[#EF5A2A]" />}
            {composition === 'index' && <Grid className="w-3.5 h-3.5 text-[#EF5A2A]" />}
            {composition === 'cohorts' && <Rows className="w-3.5 h-3.5 text-[#EF5A2A]" />}
            <span>LAYOUT: {compositionNames[composition].label}</span>
          </div>
          <span>
            {filteredMembers.length} PORTRAITS
          </span>
        </div>

        {/* ========================================================================= */}
        {/* COMPOSITION 01: BROADSHEET MOSAIC (Asymmetric editorial pacing)           */}
        {/* ========================================================================= */}
        {composition === 'broadsheet' && (
          <motion.div
            key="comp-broadsheet"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
          >
            {filteredMembers.map((member, idx) => {
              const isFocal = idx === 0 || idx === 5 || idx === 11;
              const isMedium = idx % 3 === 1;

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

              const isHovered = hoveredMemberId === member.id;

              return (
                <div
                  key={member.id}
                  onMouseEnter={() => setHoveredMemberId(member.id)}
                  onMouseLeave={() => setHoveredMemberId(null)}
                  onClick={() => onSelectMember(member)}
                  className={`group relative bg-[#F7F3EB] border border-[#0A0A09]/15 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#0A0A09] hover:bg-white hover:shadow-md cursor-pointer select-none ${colSpan}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open yearbook dossier for ${member.name}, ${member.role}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectMember(member);
                    }
                  }}
                >
                  {/* Meta Label */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#0A0A09]/10 text-[10px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                    <span>{member.group}</span>
                    <span className="text-[#EF5A2A]">{member.yearOfStudy}</span>
                  </div>

                  {/* Photo Plate: subtle crop shift on hover */}
                  <div
                    className={`relative w-full my-4 bg-[#E3DDD1] overflow-hidden border border-[#0A0A09]/10 ${aspectCrop}`}
                  >
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className={`w-full h-full object-cover grayscale contrast-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isHovered
                            ? 'scale-[1.05] grayscale-0 object-top'
                            : 'scale-100 object-center'
                        }`}
                        style={{ objectPosition: member.imagePosition || 'center 20%' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A]">
                        <NexusIcon size="md" />
                        <span className="mt-2 font-dosis text-[10px] tracking-widest uppercase">
                          PORTRAIT
                        </span>
                      </div>
                    )}

                    {/* Corner Accent Line */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#EF5A2A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#EF5A2A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  {/* Name and Role Reveal */}
                  <div className="space-y-2 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-dosis font-bold tracking-[0.22em] text-[#EF5A2A] uppercase block">
                        {member.role}
                      </span>
                      <h3 className="font-fraunces font-bold text-lg sm:text-xl text-[#0A0A09] tracking-tight group-hover:translate-x-0.5 transition-transform duration-200">
                        {member.name}
                      </h3>
                    </div>

                    <p className="font-bitter text-xs text-[#66615A] line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 group-hover:text-[#0A0A09] transition-colors duration-200">
                      {member.discipline}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-[#0A0A09]/10 text-[10px] font-dosis font-bold tracking-[0.2em] text-[#0A0A09] group-hover:text-[#EF5A2A] transition-colors duration-200">
                      <span>OPEN DOSSIER</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* COMPOSITION 02: COLLECTIVE INDEX (4-column rhythmic portrait gallery)     */}
        {/* ========================================================================= */}
        {composition === 'index' && (
          <motion.div
            key="comp-index"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          >
            {filteredMembers.map((member) => {
              const isHovered = hoveredMemberId === member.id;

              return (
                <div
                  key={member.id}
                  onMouseEnter={() => setHoveredMemberId(member.id)}
                  onMouseLeave={() => setHoveredMemberId(null)}
                  onClick={() => onSelectMember(member)}
                  className="group relative bg-[#F7F3EB] border border-[#0A0A09]/15 p-4 flex flex-col justify-between transition-all duration-300 hover:border-[#0A0A09] hover:bg-white hover:shadow-md cursor-pointer select-none"
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
                  <div className="relative w-full aspect-[4/5] bg-[#E3DDD1] overflow-hidden border border-[#0A0A09]/10">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className={`w-full h-full object-cover grayscale contrast-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isHovered ? 'scale-[1.04] grayscale-0' : 'scale-100'
                        }`}
                        style={{ objectPosition: member.imagePosition || 'center 20%' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A]">
                        <NexusIcon size="md" />
                      </div>
                    )}
                  </div>

                  <div className="pt-3 space-y-1">
                    <span className="text-[10px] font-dosis font-bold tracking-[0.2em] text-[#EF5A2A] uppercase block">
                      {member.role}
                    </span>
                    <h3 className="font-fraunces font-bold text-base text-[#0A0A09] tracking-tight">
                      {member.name}
                    </h3>
                    <p className="font-bitter text-xs text-[#66615A] line-clamp-1">
                      {member.discipline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#0A0A09]/10 flex items-center justify-between text-[10px] font-dosis font-bold tracking-[0.2em] text-[#0A0A09] group-hover:text-[#EF5A2A]">
                    <span>DOSSIER</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* COMPOSITION 03: COHORT FOLIO (Grouped by authentic departments)           */}
        {/* ========================================================================= */}
        {composition === 'cohorts' && (
          <motion.div
            key="comp-cohorts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pt-10 space-y-16"
          >
            {['COORDINATOR & MENTOR', 'MANAGEMENT', 'IDEATION', 'CONTENT'].map((dept) => {
              const deptMembers = filteredMembers.filter((m) => {
                if (dept === 'COORDINATOR & MENTOR') {
                  return (
                    m.group === 'COORDINATOR & MENTOR' ||
                    m.role.toUpperCase().includes('COORDINATOR') ||
                    m.role.toUpperCase().includes('MENTOR')
                  );
                }
                return m.group === dept;
              });

              if (deptMembers.length === 0) return null;

              return (
                <div key={dept} className="space-y-6">
                  {/* Cohort Divider Header */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#0A0A09]">
                    <div className="flex items-center gap-3">
                      <span className="p-1 bg-[#0A0A09] text-white">
                        <NexusIcon size="xs" />
                      </span>
                      <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#0A0A09] uppercase tracking-tight">
                        {dept}
                      </h3>
                    </div>
                    <span className="font-dosis font-bold text-xs tracking-[0.2em] text-[#EF5A2A]">
                      {deptMembers.length} MEMBERS
                    </span>
                  </div>

                  {/* Grid for this cohort */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deptMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => onSelectMember(member)}
                        className="group bg-[#F7F3EB] border border-[#0A0A09]/15 p-4 flex flex-col justify-between hover:border-[#0A0A09] hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative w-full aspect-[4/5] bg-[#E3DDD1] overflow-hidden border border-[#0A0A09]/10">
                          {member.imageUrl && (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
                              style={{ objectPosition: member.imagePosition || 'center 20%' }}
                            />
                          )}
                        </div>

                        <div className="pt-3 space-y-1">
                          <span className="text-[10px] font-dosis font-bold tracking-[0.2em] text-[#EF5A2A] uppercase block">
                            {member.role}
                          </span>
                          <h4 className="font-fraunces font-bold text-base text-[#0A0A09]">
                            {member.name}
                          </h4>
                          <p className="font-bitter text-xs text-[#66615A] line-clamp-1">
                            {member.discipline}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-20 text-[#66615A] font-bitter text-base">
            No yearbook entries found matching your search.
          </div>
        )}
      </Container>
    </section>
  );
};
