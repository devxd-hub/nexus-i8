/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, TextLink } from '../primitives/Button.tsx';
import { ProjectCard } from '../primitives/ProjectCard.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';
import { PROJECTS } from '../../data/nexusData.ts';

interface ProjectPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * PROJECT PREVIEW
 * Heading: SOME THINGS WE'VE MADE.
 * Shows 3 selected projects with refined hover states, subtle orange reveal,
 * 4px translations, and gentle sibling focus dimming.
 */
export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ onRouteChange }) => {
  // First 3 projects as specified in prompt
  const previewProjects = PROJECTS.slice(0, 3);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <RevealSection
      id="nexus-project-preview"
      className="w-full py-14 sm:py-18 md:py-22 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] transition-colors duration-250"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 pb-4 sm:pb-5 border-b border-[var(--border-subtle)]">
          <div className="space-y-3">
            <SectionLabel number="03" label="SELECTED WORK" />
            <RevealText
              as="h2"
              staggerMs={45}
              className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.08] tracking-tight uppercase"
            >
              SOME THINGS WE'VE MADE.
            </RevealText>
          </div>
          <TextLink
            label="ALL PROJECTS ARCHIVE"
            onClick={() => onRouteChange('/projects')}
          />
        </div>

        {/* 3 Selected Projects with interactive cards and subtle focus dimming */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {previewProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => onRouteChange('/projects')}
              isDimmed={Boolean(hoveredId && hoveredId !== project.id)}
              onHoverStart={() => setHoveredId(project.id)}
              onHoverEnd={() => setHoveredId(null)}
            />
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <PrimaryButton
            label="EXPLORE FULL PROJECT ARCHIVE"
            onClick={() => onRouteChange('/projects')}
            magnetic={true}
          />
        </div>
      </Container>
    </RevealSection>
  );
};
