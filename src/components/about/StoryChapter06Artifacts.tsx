/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { PROJECTS } from '../../data/nexusData.ts';
import { AppRoute } from '../../types.ts';
import { ArrowUpRight } from 'lucide-react';
import { useStoryScroll } from './ScrollStoryContext.tsx';

interface StoryChapter06ArtifactsProps {
  onRouteChange: (route: AppRoute) => void;
}

const CATEGORIES = ['ALL', 'Technology', 'Physical Computing', 'Creative Production', 'Research & Software'];

export const StoryChapter06Artifacts: React.FC<StoryChapter06ArtifactsProps> = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 06 (0.54 -> 0.68 timeline)
  const gridElevation = useTransform(smoothProgress, [0.54, 0.60, 0.68], [14, 0, -6]);

  const filteredProjects = selectedCategory === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <section
      id="chapter-06-artifacts"
      className="relative py-20 sm:py-28 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB] text-[#0A0A09] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 06 // 09
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE SHIPPED ARTIFACTS
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            We shared what we made.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              Real projects built by student squads.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            From algorithmic visualizers to tactile MIDI controllers and campus ecology mesh networks,
            each project is a working testament to what happens when disciplines unite.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[rgba(10,10,9,0.12)]">
          <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#66615A] mr-2">
            FILTER ARTIFACTS:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-dosis text-xs font-bold tracking-[0.16em] uppercase rounded-[2px] border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-xs'
                  : 'bg-[#FAF6F0] text-[#66615A] border-[rgba(10,10,9,0.14)] hover:border-[#EF5A2A] hover:text-[#0A0A09]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Shipped Artifacts Grid */}
        <motion.div
          style={{ y: gridElevation }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-6 bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)] rounded-[2px] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#EF5A2A] transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
                  <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">
                    {project.projectNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-dosis text-[11px] text-[#66615A] tracking-wider uppercase">
                      {project.year}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                </div>

                <div>
                  <span className="font-dosis text-[11px] font-bold text-[#66615A] uppercase tracking-widest block">
                    {project.disciplines}
                  </span>
                  <h3 className="font-fraunces font-bold text-2xl text-[#0A0A09] uppercase tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {project.title}
                  </h3>
                </div>

                <p className="font-bitter text-sm text-[#0A0A09] leading-relaxed">
                  {project.summary}
                </p>

                <div className="p-3 bg-[#EBE5DB]/60 border-l-2 border-[#0A0A09] space-y-1">
                  <span className="font-dosis text-[10px] font-bold uppercase tracking-wider text-[#66615A] block">
                    STUDENT SQUAD LEADS:
                  </span>
                  <div className="font-dosis text-xs font-bold text-[#0A0A09] tracking-wide">
                    {project.leadStudents.join(' × ')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white border border-[rgba(10,10,9,0.08)] text-[#66615A] font-dosis text-[10px] tracking-wider uppercase rounded-[2px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(10,10,9,0.1)] flex items-center justify-between">
                <span className="font-dosis text-[11px] uppercase tracking-wider text-[#66615A]">
                  STATUS: {project.status}
                </span>
                <button
                  onClick={() => onRouteChange('/projects')}
                  className="font-dosis text-xs font-bold uppercase tracking-[0.16em] text-[#EF5A2A] group-hover:text-[#0A0A09] flex items-center gap-1 cursor-pointer"
                >
                  <span>VIEW SPECS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Global Projects Repository Trigger */}
        <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#EF5A2A] block">
              CAMPUS ARTIFACT DIRECTORY
            </span>
            <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#0A0A09]">
              Looking for interactive demos, schematics, and code repositories?
            </h3>
            <p className="font-bitter text-xs sm:text-sm text-[#66615A]">
              Browse the dedicated Projects gallery with full technical specifications and live sandbox links.
            </p>
          </div>

          <button
            onClick={() => onRouteChange('/projects')}
            className="px-6 py-3 bg-[#0A0A09] hover:bg-[#EF5A2A] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px] transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            OPEN FULL PROJECT INDEX →
          </button>
        </div>
      </Container>
    </section>
  );
};
