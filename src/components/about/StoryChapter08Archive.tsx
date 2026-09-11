/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { AppRoute } from '../../types.ts';
import { useStoryScroll } from './ScrollStoryContext.tsx';

interface StoryChapter08ArchiveProps {
  onRouteChange: (route: AppRoute) => void;
}

interface ArchiveMoment {
  id: string;
  step: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  location: string;
  date: string;
}

const ARCHIVE_MOMENTS: ArchiveMoment[] = [
  {
    id: 'moment-01',
    step: '01',
    category: 'QUESTION',
    title: 'Questioning Academic Boundaries',
    subtitle: 'THE INITIAL INQUIRY',
    description: 'Debating interface metaphors, algorithmic proofs, and ergonomic constraints at the studio whiteboard.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
    location: 'Design Critique Hall',
    date: 'OCT 2026',
  },
  {
    id: 'moment-02',
    step: '02',
    category: 'PEOPLE',
    title: 'Complementary Minds Matching',
    subtitle: 'TEAM FORMATION',
    description: 'Software engineers pairing with interaction designers and hardware prototypers to form multidisciplinary squads.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    location: 'Nexus Central Atrium',
    date: 'SEP 2026',
  },
  {
    id: 'moment-03',
    step: '03',
    category: 'EXPERIMENT',
    title: 'Oscilloscopes & Variable Glyphs',
    subtitle: 'HARDWARE & TYPOGRAPHY',
    description: 'Testing ESP32 sensor telemetry and inspecting OpenType variable font axes under real optical conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    location: 'Lab 4B Hardware Bench',
    date: 'OCT 2026',
  },
  {
    id: 'moment-04',
    step: '04',
    category: 'BUILD',
    title: 'Crafting at the 1:00 AM Bench',
    subtitle: 'PHYSICAL FABRICATION',
    description: 'CNC milling solid walnut MIDI faceplates and pair-programming core Canvas rendering pipelines.',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80',
    location: 'Makerspace Woodshop',
    date: 'FEB 2027',
  },
  {
    id: 'moment-05',
    step: '05',
    category: 'SHARE',
    title: 'Public Courtyard Demonstrations',
    subtitle: 'CAMPUS DEMO NIGHT',
    description: 'Presenting live tactile hardware and web software to hundreds of visiting students and faculty.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    location: 'Engineering Courtyard',
    date: 'DEC 2026',
  },
  {
    id: 'moment-06',
    step: '06',
    category: 'COMMUNITY',
    title: 'The Permanent Studio Bench',
    subtitle: 'ENDURING REPOSITORY',
    description: 'Open-sourcing every schematic and repository for upcoming cohorts to inherit, build upon, and remix.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    location: 'Nexus Studio Hall',
    date: 'JAN 2027',
  },
];

export const StoryChapter08Archive: React.FC<StoryChapter08ArchiveProps> = ({ onRouteChange }) => {
  const [selectedMoment, setSelectedMoment] = useState<ArchiveMoment>(ARCHIVE_MOMENTS[0]);
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 08 (0.84 -> 0.94 timeline)
  const archiveElevation = useTransform(smoothProgress, [0.84, 0.90, 0.96], [14, 0, -6]);

  return (
    <section
      id="chapter-08-archive"
      className="relative py-20 sm:py-28 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB] text-[#0A0A09] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 08 // 09
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              PHOTOGRAPHIC CHRONOLOGY
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            Visual records.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              Moments captured from the studio benches.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            A chronological timeline documenting the real human moments across discovery, collaboration,
            and late-night fabrication.
          </p>
        </div>

        {/* 6 Chronological Photographic Moments Grid */}
        <motion.div
          style={{ y: archiveElevation }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {ARCHIVE_MOMENTS.map((moment) => {
            const isSelected = selectedMoment.id === moment.id;
            return (
              <div
                key={moment.id}
                onClick={() => setSelectedMoment(moment)}
                className={`p-5 bg-[#FAF6F0] border rounded-[2px] shadow-xs space-y-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0A0A09] ring-2 ring-[#0A0A09]/20'
                    : 'border-[rgba(10,10,9,0.14)] hover:border-[#EF5A2A]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-dosis">
                    <span className="font-bold text-[#EF5A2A] uppercase tracking-widest">
                      MOMENT {moment.step} // {moment.category}
                    </span>
                    <span className="text-[#66615A] tracking-wider uppercase">
                      {moment.date}
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] bg-[#E2DBCF]">
                    <img
                      src={moment.imageUrl}
                      alt={moment.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale contrast-105 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#0A0A09]/80 text-[#F3EEE5] px-2 py-0.5 font-dosis text-[10px] uppercase tracking-wider">
                      {moment.location}
                    </div>
                  </div>

                  <h3 className="font-fraunces font-bold text-lg text-[#0A0A09] uppercase tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {moment.title}
                  </h3>

                  <p className="font-bitter text-xs text-[#66615A] leading-relaxed">
                    {moment.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(10,10,9,0.08)] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#66615A]">
                  <span>{moment.subtitle}</span>
                  <span className="text-[#EF5A2A] font-bold">ARCHIVE PLATE</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Complete Photographic Archive Link */}
        <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-dosis text-xs font-bold uppercase tracking-[0.2em] text-[#EF5A2A] block">
              FULL VISUAL REPOSITORY
            </span>
            <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-[#0A0A09]">
              Looking for high-resolution studio photographs and lab journals?
            </h3>
            <p className="font-bitter text-xs sm:text-sm text-[#66615A]">
              Explore the complete photographic gallery with chronological sprint tags, event dates, and detailed technical captions.
            </p>
          </div>

          <button
            onClick={() => onRouteChange('/gallery')}
            className="px-6 py-3 bg-[#0A0A09] hover:bg-[#EF5A2A] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px] transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            VIEW ALL GALLERY PHOTOS →
          </button>
        </div>
      </Container>
    </section>
  );
};
