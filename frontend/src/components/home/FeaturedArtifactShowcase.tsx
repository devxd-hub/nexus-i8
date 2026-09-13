/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { GridDistortion } from '../motion/GridDistortion.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { Project } from '../../types.ts';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedArtifactShowcaseProps {
  project: Project;
  onSelectProject: (project: Project) => void;
}

/**
 * FeaturedArtifactShowcase
 *
 * Dedicated interactive exhibition piece featuring the GridDistortion component.
 * Framed like an editorial artwork adhering strictly to the NEXUS design language:
 * warm neutral tones, black, NEXUS orange, thin rules, editorial typography.
 */
export const FeaturedArtifactShowcase: React.FC<FeaturedArtifactShowcaseProps> = ({
  project,
  onSelectProject,
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <RevealSection
      id="nexus-featured-artifact"
      className="w-full py-16 md:py-24 border-b border-[rgba(245,239,230,0.10)] bg-[#0C0C0C]"
    >
      <Container>
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[rgba(245,239,230,0.10)]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SectionLabel number="02.1" label="EXHIBIT IN MOTION" />
              <span className="font-dosis text-[11px] font-bold tracking-[0.2em] uppercase text-[#F2613F]">
                // TACTILE ARTIFACT
              </span>
            </div>
            <RevealText
              as="h2"
              staggerMs={35}
              className="font-fraunces font-bold text-3xl sm:text-4xl lg:text-5xl text-[#F5EFE6] leading-[1.1] tracking-tight uppercase"
            >
              IDEAS TAKE PHYSICAL FORM.
            </RevealText>
            <p className="font-bitter text-[#C2BBB0] text-base md:text-lg max-w-2xl leading-relaxed">
              An interactive study of the {project.title} modular tactile controller — glide across the visual to deform the physical matrix.
            </p>
          </div>

          {/* Project Spec Pill */}
          <div className="hidden lg:flex flex-col items-end text-right space-y-1 font-dosis">
            <span className="text-xs font-bold tracking-[0.22em] text-[#F5EFE6] uppercase">
              {project.projectNumber} // {project.title}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[#857E74]">
              {project.year} • {project.disciplines}
            </span>
          </div>
        </div>

        {/* Editorial Framed Artwork Container */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Visual Connection: Tiny orange line entering frame with connection node */}
          <div
            className="hidden sm:flex absolute -left-8 top-1/2 -translate-y-1/2 items-center z-20 pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-8 h-[1.5px] bg-[#F2613F]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F2613F] border-2 border-[#0C0C0C] -ml-1 animate-pulse" />
          </div>

          <div
            tabIndex={0}
            role="button"
            aria-label={`${project.title} interactive 3D distortion artifact. Click to view full project documentation.`}
            onClick={() => onSelectProject(project)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProject(project);
              }
            }}
            className="group relative flex flex-col w-full bg-[#181818] border border-[rgba(245,239,230,0.10)] shadow-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] transition-all duration-300 hover:border-[#F2613F]/50"
          >
            {/* Top Editorial Spec Bar */}
            <div className="w-full px-4 sm:px-6 py-3 bg-[#181818] border-b border-[rgba(245,239,230,0.10)] flex items-center justify-between z-10 select-none">
              <div className="flex items-center gap-2 sm:gap-3 font-dosis text-[11px] tracking-[0.2em] uppercase font-bold text-[#F5EFE6]">
                <NexusIcon size="xs" />
                <span className="text-[#F2613F]">{project.projectNumber}</span>
                <span className="text-[rgba(245,239,230,0.4)]">|</span>
                <span className="hidden xs:inline">{project.title}</span>
                <span className="hidden md:inline text-[rgba(245,239,230,0.5)] font-medium">
                  ({project.category})
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 font-dosis text-[10px] tracking-[0.2em] font-semibold text-[#857E74]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2613F] animate-ping" />
                <span>LIVE PROTOTYPE BENCH</span>
              </div>
            </div>

            {/* Interactive GridDistortion Surface */}
            <div className="relative w-full aspect-[16/9] min-h-[260px] sm:min-h-[320px] max-h-[560px] bg-[#0C0C0C] overflow-hidden touch-pan-y">
              <GridDistortion
                imageSrc="/images/projects/voxen-prototype.svg"
                grid={10}
                mouse={0.09}
                strength={0.11}
                relaxation={0.92}
                lightColor="#F5EFE6"
                darkColor="#0C0C0C"
                tintColor="#F2613F"
                onInteraction={() => setHasInteracted(true)}
                alt={`${project.title} interactive tactile hardware prototype`}
                className="w-full h-full pointer-events-auto touch-pan-y"
              />

              {/* Editorial Marker: 01 / INTERACTION // DISTURB TO EXPLORE ↗ (Fades after first touch) */}
              <div
                className={`absolute top-4 right-4 z-20 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  hasInteracted
                    ? 'opacity-0 translate-y-2 pointer-events-none'
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0C0C0C] border border-[#F2613F] text-[#F5EFE6] font-dosis text-[11px] font-bold tracking-[0.2em] uppercase shadow-md">
                  <span className="text-[#F2613F]">01 / INTERACTION</span>
                  <span>▸</span>
                  <span className="animate-pulse text-[#F5EFE6]">DISTURB TO EXPLORE ↗</span>
                </div>
              </div>

              {/* Minimal Framing Corner Accents */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F2613F]/70 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#F2613F]/70 pointer-events-none z-10" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#F2613F]/70 pointer-events-none z-10" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F2613F]/70 pointer-events-none z-10" />
            </div>

            {/* Bottom Editorial Caption & Click-to-Inspect Action Bar */}
            <div className="w-full px-4 sm:px-6 py-4 bg-[#181818] border-t border-[rgba(245,239,230,0.10)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
              <div className="space-y-0.5">
                <p className="font-bitter text-xs sm:text-sm text-[#F5EFE6] font-medium">
                  {project.summary}
                </p>
                <p className="font-dosis text-[11px] text-[#857E74] tracking-[0.16em] uppercase">
                  LEAD: {project.leadStudents.join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[#F2613F] font-dosis text-xs font-bold tracking-[0.2em] uppercase group-hover:text-[#F5EFE6] transition-colors">
                <span>OPEN PROJECT BLUEPRINT</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </RevealSection>
  );
};

export default FeaturedArtifactShowcase;
