/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, TextLink } from '../primitives/Button.tsx';
import { TeamCard } from '../primitives/TeamCard.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';
import { TEAM_MEMBERS } from '../../data/nexusData.ts';

interface TeamPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * TEAM PREVIEW
 * Heading: THE PEOPLE BEHIND THE WORK.
 * Shows data-driven team members with compact interactive profile cards.
 */
export const TeamPreview: React.FC<TeamPreviewProps> = ({ onRouteChange }) => {
  // Select first four leads (data-driven)
  const previewLeads = TEAM_MEMBERS.slice(0, 4);

  return (
    <RevealSection
      id="nexus-team-preview"
      className="w-full py-14 sm:py-18 md:py-22 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5]"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 pb-4 sm:pb-5 border-b border-[rgba(10,10,9,0.12)]">
          <div className="space-y-3">
            <SectionLabel number="05" label="STUDENT COLLECTIVE" />
            <RevealText
              as="h2"
              staggerMs={45}
              className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase"
            >
              THE PEOPLE BEHIND THE WORK.
            </RevealText>
            <p className="font-bitter text-[#66615A] max-w-lg text-base sm:text-lg leading-relaxed">
              Students steering codebases, design systems, physical workshops, and project roadmaps.
            </p>
          </div>
          <TextLink
            label="ALL MEMBERS & SQUADS"
            onClick={() => onRouteChange('/team')}
          />
        </div>

        {/* 4-Column Grid for Preview Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {previewLeads.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <PrimaryButton
            label="MEET THE FULL TEAM"
            onClick={() => onRouteChange('/team')}
            magnetic={true}
          />
        </div>
      </Container>
    </RevealSection>
  );
};
