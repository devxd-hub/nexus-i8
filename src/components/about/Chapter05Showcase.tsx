/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { PROJECTS } from '../../data/nexusData.ts';
import { AppRoute, Project } from '../../types.ts';
import { ArrowUpRight, Code, Layers, Users, ExternalLink, Sparkles } from 'lucide-react';

interface Chapter05ShowcaseProps {
  onRouteChange: (route: AppRoute) => void;
}

export const Chapter05Showcase: React.FC<Chapter05ShowcaseProps> = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Technology', 'Physical Computing', 'Creative Production', 'Research & Software'];

  const filteredProjects = selectedCategory === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.disciplines.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <section
      id="chapter-05"
      className="relative py-24 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase">
              CHAPTER 05 / 07
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
            From algorithmic visualizers to tactile MIDI controllers and campus ecology mesh
            networks, each project is a working testament to what happens when disciplines unite.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-dosis text-xs font-bold uppercase tracking-[0.18em] rounded-[2px] border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-xs'
                  : 'bg-[#FAF6F0] text-[#66615A] border-[rgba(10,10,9,0.16)] hover:border-[#0A0A09] hover:text-[#0A0A09]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Editorial Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 sm:p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-xs flex flex-col justify-between hover:border-[#EF5A2A] hover:bg-white transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Top Badge Line */}
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.1)]">
                  <span className="font-dosis font-bold text-xs text-[#EF5A2A] tracking-[0.2em]">
                    {project.projectNumber}
                  </span>
                  <span className="font-dosis text-[11px] text-[#66615A] uppercase tracking-wider font-semibold">
                    {project.year} // {project.status}
                  </span>
                </div>

                {/* Project Title */}
                <div>
                  <h3 className="font-fraunces font-bold text-2xl text-[#0A0A09] tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {project.title}
                  </h3>
                  <span className="font-dosis text-[11px] font-bold text-[#66615A] uppercase tracking-[0.16em] block mt-1">
                    {project.disciplines}
                  </span>
                </div>

                {/* Summary */}
                <p className="font-bitter text-sm text-[#0A0A09] leading-relaxed">
                  {project.summary}
                </p>

                {/* Lead Students */}
                <div className="pt-2">
                  <span className="font-dosis text-[10px] font-bold uppercase tracking-[0.2em] text-[#66615A] block mb-1">
                    STUDENT SQUAD LEADS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.leadStudents.map((lead) => (
                      <span
                        key={lead}
                        className="px-2 py-0.5 bg-[#EBE5DB] text-[#0A0A09] font-dosis text-xs tracking-wider rounded-[2px]"
                      >
                        {lead}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] font-dosis uppercase tracking-wider text-[#66615A] bg-white border border-[rgba(10,10,9,0.08)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-6 mt-6 border-t border-[rgba(10,10,9,0.1)] flex items-center justify-between">
                <button
                  onClick={() => onRouteChange('/projects')}
                  className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#0A0A09] group-hover:text-[#EF5A2A] flex items-center gap-1 cursor-pointer"
                >
                  <span>VIEW SPECIFICATION</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <NexusIcon size="xs" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Projects Link Banner */}
        <div className="p-8 bg-[#0A0A09] text-[#F3EEE5] rounded-[2px] flex flex-col md:flex-row items-center justify-between gap-6 border border-[rgba(243,238,229,0.16)]">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-dosis text-xs font-bold uppercase tracking-[0.22em] text-[#EF5A2A] block">
              FULL ARCHIVE REPOSITORY
            </span>
            <h3 className="font-fraunces font-bold text-2xl text-white">
              Explore all active cohorts and open schematics.
            </h3>
            <p className="font-bitter text-sm text-[#F3EEE5]/80">
              Browse interactive demos, GitHub repos, and student CAD files in the project index.
            </p>
          </div>

          <button
            onClick={() => onRouteChange('/projects')}
            className="px-6 py-3.5 bg-[#EF5A2A] hover:bg-[#d94e22] text-white font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px] transition-all cursor-pointer shrink-0 shadow-sm"
          >
            OPEN FULL PROJECT INDEX →
          </button>
        </div>
      </Container>
    </section>
  );
};
