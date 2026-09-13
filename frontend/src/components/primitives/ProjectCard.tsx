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
        bg-[var(--bg-surface)] border border-[var(--border-subtle)]
        transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-[#F2613F]/70 hover:bg-[var(--bg-elevated)] hover:shadow-sm
        active:scale-[0.99]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
        cursor-pointer select-none group
        ${isDimmed ? 'opacity-65' : 'opacity-100'}
        ${className}
      `}
    >
      <div>
        {/* Project Image Container (overflow-hidden, clean edges, scales 1 -> 1.03) */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
          {/* Inner Image Surface */}
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
            {/* Geometric Pattern Background */}
            <div
              className="absolute inset-0 opacity-40 bg-[radial-gradient(var(--text-primary)_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none"
              aria-hidden="true"
            />

            {/* Emblem and Identifier */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-3 shadow-2xs group-hover:border-[#F2613F]/50 transition-colors duration-300">
                <NexusIcon size="md" className="transform group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="font-dosis text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--text-primary)]">
                {project.projectNumber}
              </span>
              <span className="font-bitter italic text-[11px] text-[var(--text-secondary)] mt-0.5 max-w-[200px] truncate">
                {project.disciplines}
              </span>
            </div>

            {/* Architectural Framing Corners */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[var(--text-primary)]/30 pointer-events-none" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--text-primary)]/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--text-primary)]/30 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[var(--text-primary)]/30 pointer-events-none" />
          </div>

          {/* Status badge in top right */}
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[var(--bg-primary)] text-[var(--text-primary)] text-[10px] font-dosis font-bold tracking-[0.16em] uppercase border border-[rgba(242,97,63,0.4)]">
            {project.status.toUpperCase()}
          </div>
        </div>

        {/* Card Content & Metadata */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Metadata Row: Project Number & Year */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="font-dosis text-xs font-bold text-[#F2613F] tracking-[0.2em]">
              {project.projectNumber}
            </span>
            <span className="font-dosis text-xs text-[var(--text-muted)] tracking-[0.2em] font-semibold">
              {project.year}
            </span>
          </div>

          {/* Project Title (shifts translateX(4px) on desktop hover) */}
          <h3 className="font-bitter text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-[#F2613F] flex items-center justify-between">
            <span>{project.title}</span>
            <NexusIcon
              size="xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#F2613F]"
            />
          </h3>

          {/* Short Description */}
          <p className="font-bitter text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
            {project.summary}
          </p>

          {/* Discipline Tags */}
          <div className="pt-2 flex flex-wrap gap-1.5">
            <span className="inline-block font-dosis text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--text-primary)] px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] group-hover:border-[rgba(242,97,63,0.3)] transition-colors">
              {project.disciplines}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with View Project and Animated Arrow (shifts outward on hover) */}
      <div className="px-6 sm:px-7 pb-6 pt-3 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="relative font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors duration-250">
          VIEW PROJECT
          <span
            className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#F2613F] origin-left scale-x-0 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 pointer-events-none"
            aria-hidden="true"
          />
        </span>
        <div className="flex items-center gap-1.5 text-[#F2613F] transition-colors duration-250">
          <ArrowRight className="w-4 h-4 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
        </div>
      </div>

      {/* Subtle Orange Reveal Line at bottom border */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#F2613F] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
        aria-hidden="true"
      />
    </article>
  );
};
