/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, TextLink } from '../primitives/Button.tsx';
import { TeamCard } from '../primitives/TeamCard.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';
import { TEAM_MEMBERS } from '../../data/nexusData.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TeamPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * TEAM PREVIEW
 * Heading: THE PEOPLE BEHIND THE WORK.
 * On Desktop: 4-Column Grid
 * On Mobile / Small Screens: Smooth Horizontal Touch-Snap Carousel with Indicators
 */
export const TeamPreview: React.FC<TeamPreviewProps> = ({ onRouteChange }) => {
  const previewLeads = TEAM_MEMBERS.slice(0, 4);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth > 0) {
      const idx = Math.round(scrollLeft / (offsetWidth * 0.78));
      setActiveMobileIdx(Math.min(previewLeads.length - 1, Math.max(0, idx)));
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const itemWidth = scrollRef.current.offsetWidth * 0.78;
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
  };

  return (
    <RevealSection
      id="nexus-team-preview"
      className="w-full py-12 sm:py-16 md:py-22 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5]"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-5 border-b border-[rgba(10,10,9,0.12)]">
          <div className="space-y-2 sm:space-y-3">
            <SectionLabel number="05" label="STUDENT COLLECTIVE" />
            <RevealText
              as="h2"
              staggerMs={45}
              className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase"
            >
              THE PEOPLE BEHIND THE WORK.
            </RevealText>
            <p className="font-bitter text-[#66615A] max-w-lg text-sm sm:text-base md:text-lg leading-relaxed">
              Students steering codebases, design systems, physical workshops, and project roadmaps.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            {/* Mobile Carousel Controls */}
            <div className="flex sm:hidden items-center gap-1.5 bg-[#FAF6F0] p-1 border border-[rgba(10,10,9,0.12)]">
              <button
                type="button"
                onClick={() => scrollToIndex(Math.max(0, activeMobileIdx - 1))}
                disabled={activeMobileIdx === 0}
                className="p-1 disabled:opacity-30 text-[#0A0A09]"
                aria-label="Previous team member"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 text-[#66615A]">
                {activeMobileIdx + 1} / {previewLeads.length}
              </span>
              <button
                type="button"
                onClick={() => scrollToIndex(Math.min(previewLeads.length - 1, activeMobileIdx + 1))}
                disabled={activeMobileIdx === previewLeads.length - 1}
                className="p-1 disabled:opacity-30 text-[#0A0A09]"
                aria-label="Next team member"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <TextLink
              label="ALL MEMBERS & SQUADS"
              onClick={() => onRouteChange('/team')}
            />
          </div>
        </div>

        {/* Mobile Swipe Rail (< sm) */}
        <div className="block sm:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {previewLeads.map((member) => (
              <div
                key={member.id}
                className="w-[78vw] max-w-[300px] shrink-0 snap-center"
              >
                <TeamCard member={member} />
              </div>
            ))}
          </div>

          {/* Swipe indicator dots */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {previewLeads.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 ${
                  activeMobileIdx === idx
                    ? 'w-6 bg-[#EF5A2A]'
                    : 'w-1.5 bg-[rgba(10,10,9,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tablet & Desktop Grid (>= sm) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {previewLeads.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
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
