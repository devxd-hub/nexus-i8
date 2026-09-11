/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { Project } from '../../types.ts';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  isDimmed?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
}

/**
 * ProjectCard
 * Premium interactive project card designed with editorial balance.
 *
 * Hover specifications:
 * - Image: scale 1 -> 1.03 inside overflow-hidden container
 * - Title: translateX(4px)
 * - Arrow: translateX(4px)
 * - Accent: subtle orange reveal line
 * - Card: subtle border and elevation change
 * - Duration: 400ms, Easing: cubic-bezier(0.16, 1, 0.3, 1)
 *
 * Touch devices: tap/press response without relying on hover.
 * Accessibility: full keyboard support and visible focus indicator.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  isDimmed = false,
  onHoverStart,
  onHoverEnd,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(project);
    }
  };

  return (
    <article
      data-cursor="project"
      tabIndex={0}
      role="button"
      aria-label={`View project: ${project.title} (${project.projectNumber})`}
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`
        relative flex flex-col justify-between
        bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)]
        transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-[#EF5A2A]/70 hover:bg-white hover:shadow-sm
        active:scale-[0.99]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EEE5]
        cursor-pointer select-none group
        ${isDimmed ? 'opacity-65' : 'opacity-100'}
        ${className}
      `}
    >
      <div>
        {/* Project Image Container (overflow-hidden, clean edges, scales 1 -> 1.03) */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#E8E2D7] border-b border-[rgba(10,10,9,0.12)]">
          {/* Inner Image Surface */}
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
            {/* Geometric Pattern Background */}
            <div
              className="absolute inset-0 opacity-40 bg-[radial-gradient(#0a0a0912_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none"
              aria-hidden="true"
            />

            {/* Emblem and Identifier */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-[#FAF6F0] border border-[rgba(10,10,9,0.15)] mb-3 shadow-2xs group-hover:border-[#EF5A2A]/50 transition-colors duration-300">
                <NexusIcon size="md" className="transform group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="font-dosis text-[11px] font-bold tracking-[0.22em] uppercase text-[#0A0A09]">
                {project.projectNumber}
              </span>
              <span className="font-bitter italic text-[11px] text-[#66615A] mt-0.5 max-w-[200px] truncate">
                {project.disciplines}
              </span>
            </div>

            {/* Architectural Framing Corners */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#0A0A09]/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#0A0A09]/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#0A0A09]/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#0A0A09]/30 pointer-events-none" />
          </div>

          {/* Status badge in top right */}
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#0A0A09]/85 text-white text-[10px] font-dosis font-bold tracking-[0.16em] uppercase border border-[rgba(239,90,42,0.4)] backdrop-blur-xs">
            {project.status.toUpperCase()}
          </div>
        </div>

        {/* Card Content & Metadata */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Metadata Row: Project Number & Year */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,9,0.08)]">
            <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.2em]">
              {project.projectNumber}
            </span>
            <span className="font-dosis text-xs text-[#66615A] tracking-[0.2em] font-semibold">
              {project.year}
            </span>
          </div>

          {/* Project Title (shifts translateX(4px) on desktop hover) */}
          <h3 className="font-bitter text-2xl font-bold uppercase tracking-tight text-[#0A0A09] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[#EF5A2A] flex items-center justify-between">
            <span>{project.title}</span>
            <NexusIcon
              size="xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#EF5A2A]"
            />
          </h3>

          {/* Short Description */}
          <p className="font-bitter text-[#66615A] text-sm leading-relaxed line-clamp-3">
            {project.summary}
          </p>

          {/* Discipline Tags */}
          <div className="pt-2 flex flex-wrap gap-1.5">
            <span className="inline-block font-dosis text-[11px] font-bold tracking-[0.18em] uppercase text-[#0A0A09] px-2.5 py-1 bg-[rgba(10,10,9,0.04)] border border-[rgba(10,10,9,0.1)] group-hover:border-[rgba(239,90,42,0.3)] transition-colors">
              {project.disciplines}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with View Project and Animated Arrow (shifts outward on hover) */}
      <div className="px-6 sm:px-7 pb-6 pt-3 mt-2 border-t border-[rgba(10,10,9,0.06)] flex items-center justify-between">
        <span className="relative font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#0A0A09] group-hover:text-[#0A0A09] transition-colors duration-250">
          VIEW PROJECT
          <span
            className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#EF5A2A] origin-left scale-x-0 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 pointer-events-none"
            aria-hidden="true"
          />
        </span>
        <div className="flex items-center gap-1.5 text-[#EF5A2A] transition-colors duration-250">
          <ArrowRight className="w-4 h-4 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
        </div>
      </div>

      {/* Subtle Orange Reveal Line at bottom border */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#EF5A2A] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
        aria-hidden="true"
      />
    </article>
  );
};
