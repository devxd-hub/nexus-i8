/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { TEAM_MEMBERS } from '../../data/nexusData.ts';
import { AppRoute } from '../../types.ts';
import { useStoryScroll } from './ScrollStoryContext.tsx';

interface StoryChapter07PeopleProps {
  onRouteChange: (route: AppRoute) => void;
}

const GROUPS = ['ALL', 'MANAGEMENT', 'IDEATION', 'CONTENT', 'COORDINATOR & MENTOR'];

export const StoryChapter07People: React.FC<StoryChapter07PeopleProps> = ({ onRouteChange }) => {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 07 (0.65 -> 0.78 timeline)
  const rosterElevation = useTransform(smoothProgress, [0.65, 0.72, 0.78], [12, 0, -6]);

  const filteredMembers = selectedGroup === 'ALL'
    ? TEAM_MEMBERS
    : TEAM_MEMBERS.filter((m) => m.group === selectedGroup);

  return (
    <section
      id="chapter-07-people"
      className="relative py-20 sm:py-28 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5] text-[#0A0A09] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 07 // 09
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

        {/* Group Filter Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[rgba(10,10,9,0.12)]">
          <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#66615A] mr-2">
            COLLECTIVE ROSTER:
          </span>
          {GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3.5 py-1.5 font-dosis text-xs font-bold tracking-[0.16em] uppercase rounded-[2px] border transition-all cursor-pointer ${
                selectedGroup === group
                  ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-xs'
                  : 'bg-[#FAF6F0] text-[#66615A] border-[rgba(10,10,9,0.14)] hover:border-[#EF5A2A] hover:text-[#0A0A09]'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Team Members Grid */}
        <motion.div
          style={{ y: rosterElevation }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16"
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-6 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] rounded-[2px] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0A0A09] transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(10,10,9,0.08)] text-[11px] font-dosis">
                  <span className="font-bold text-[#EF5A2A] uppercase tracking-wider">
                    {member.group}
                  </span>
                  <span className="text-[#66615A] tracking-wider uppercase">
                    {member.yearOfStudy}
                  </span>
                </div>

                <div>
                  <h3 className="font-fraunces font-bold text-xl text-[#0A0A09] uppercase tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {member.name}
                  </h3>
                  <span className="font-dosis text-xs font-bold uppercase tracking-[0.18em] text-[#0A0A09] block mt-0.5">
                    {member.role}
                  </span>
                  <span className="font-dosis text-[11px] text-[#66615A] uppercase tracking-wider block">
                    {member.discipline}
                  </span>
                </div>

                <p className="font-bitter text-xs text-[#66615A] leading-relaxed pt-2">
                  {member.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-[rgba(10,10,9,0.08)] flex items-center justify-between text-[10px] font-mono text-[#66615A] uppercase tracking-widest">
                <span>COHORT 2026</span>
                <span className="text-[#0A0A09] font-bold">STUDIO ACTIVE</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Full Team Roster Trigger */}
        <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#EF5A2A] block">
              COMMUNITY DIRECTORY
            </span>
            <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#0A0A09]">
              Want to see individual portfolio links and research disciplines?
            </h3>
            <p className="font-bitter text-xs sm:text-sm text-[#66615A]">
              Visit the dedicated Team & Contributors directory for full biographies and contact details.
            </p>
          </div>

          <button
            onClick={() => onRouteChange('/team')}
            className="px-6 py-3 bg-[#0A0A09] hover:bg-[#EF5A2A] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px] transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            VIEW COMPLETE TEAM ROSTER →
          </button>
        </div>
      </Container>
    </section>
  );
};
