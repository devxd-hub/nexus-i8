/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { TEAM_MEMBERS } from '../../data/nexusData.ts';
import { AppRoute, TeamMember } from '../../types.ts';
import { Users, ArrowUpRight, GraduationCap, Compass } from 'lucide-react';

interface Chapter06PeopleProps {
  onRouteChange: (route: AppRoute) => void;
}

export const Chapter06People: React.FC<Chapter06PeopleProps> = ({ onRouteChange }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const groups = ['ALL', 'MANAGEMENT', 'IDEATION', 'CONTENT', 'COORDINATOR & MENTOR'];

  const filteredMembers = selectedGroup === 'ALL'
    ? TEAM_MEMBERS
    : TEAM_MEMBERS.filter((m) => m.group === selectedGroup);

  return (
    <section
      id="chapter-06"
      className="relative py-24 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
              CHAPTER 06 / 07
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE STUDENT COLLECTIVE
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            We grew into a community.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              The builders behind the benches.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            NEXUS is powered entirely by curious undergraduate and graduate students with faculty
            mentorship. No corporate intermediaries, no gatekeeping — just dedicated craft.
          </p>
        </div>

        {/* Group Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-12">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 font-dosis text-xs font-bold uppercase tracking-[0.18em] rounded-[2px] border transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-xs'
                  : 'bg-[#FAF6F0] text-[#66615A] border-[rgba(10,10,9,0.16)] hover:border-[#0A0A09] hover:text-[#0A0A09]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="p-6 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-xs flex flex-col justify-between hover:border-[#EF5A2A] hover:bg-white transition-all duration-300 group"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(10,10,9,0.1)]">
                  <span className="font-dosis text-[10px] font-bold text-[#EF5A2A] uppercase tracking-[0.2em]">
                    {member.group}
                  </span>
                  <span className="font-dosis text-[10px] text-[#66615A] uppercase tracking-wider">
                    {member.yearOfStudy}
                  </span>
                </div>

                {/* Name & Role */}
                <div>
                  <h3 className="font-fraunces font-bold text-xl text-[#0A0A09] tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {member.name}
                  </h3>
                  <span className="font-dosis text-xs font-bold text-[#66615A] uppercase tracking-[0.16em] block mt-0.5">
                    {member.role}
                  </span>
                  <span className="font-bitter text-xs text-[#66615A] italic block mt-0.5">
                    {member.discipline}
                  </span>
                </div>

                {/* Bio */}
                <p className="font-bitter text-xs text-[#0A0A09] leading-relaxed pt-2 border-t border-[rgba(10,10,9,0.06)]">
                  {member.bio}
                </p>
              </div>

              {/* Bottom Decorative Mark */}
              <div className="pt-4 mt-4 border-t border-[rgba(10,10,9,0.08)] flex items-center justify-between">
                <span className="font-dosis text-[10px] uppercase tracking-widest text-[#66615A]">
                  COHORT MEMBER
                </span>
                <NexusIcon size="xs" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Direct Link to Full Team Roster */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-[#0A0A09] text-[#EF5A2A] rounded-[2px]">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-fraunces font-bold text-lg text-[#0A0A09]">
                Want to meet the entire student organization?
              </h4>
              <p className="font-bitter text-xs text-[#66615A]">
                Explore member portfolios, research specialties, and faculty mentor backgrounds.
              </p>
            </div>
          </div>

          <button
            onClick={() => onRouteChange('/team')}
            className="px-5 py-2.5 bg-[#0A0A09] hover:bg-[#EF5A2A] text-[#F3EEE5] hover:text-white font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px] transition-colors cursor-pointer shrink-0"
          >
            VIEW COMPLETE TEAM ROSTER →
          </button>
        </div>
      </Container>
    </section>
  );
};
