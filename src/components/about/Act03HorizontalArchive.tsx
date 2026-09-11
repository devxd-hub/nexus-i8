/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Camera, ArrowRight } from 'lucide-react';

interface ArchiveImageMoment {
  number: string;
  chapter: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
}

const ARCHIVE_MOMENTS: ArchiveImageMoment[] = [
  {
    number: '01',
    chapter: 'QUESTION',
    category: 'INQUIRY & WHITEBOARD',
    title: 'Questioning Academic Boundaries',
    description: 'Debating interface metaphors, algorithmic proofs, and ergonomic constraints at the studio whiteboard.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    number: '02',
    chapter: 'PEOPLE',
    category: 'SQUAD CONVERGENCE',
    title: 'Complementary Minds Matching',
    description: 'Software engineers pairing with interaction designers and hardware prototypers to form multidisciplinary squads.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    number: '03',
    chapter: 'EXPERIMENT',
    category: 'PROTOTYPING & TELEMETRY',
    title: 'Oscilloscopes & Variable Glyphs',
    description: 'Testing ESP32 sensor telemetry and inspecting OpenType variable font axes under real optical conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  {
    number: '04',
    chapter: 'BUILD',
    category: 'FABRICATION & CODE',
    title: 'Crafting at the 1:00 AM Bench',
    description: 'CNC milling solid walnut MIDI faceplates and pair-programming core Canvas rendering pipelines.',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  },
  {
    number: '05',
    chapter: 'SHARE',
    category: 'CAMPUS DEMO NIGHT',
    title: 'Public Courtyard Demonstrations',
    description: 'Presenting live tactile hardware and web software to hundreds of visiting students and faculty.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    number: '06',
    chapter: 'COMMUNITY',
    category: 'ENDURING REPOSITORY',
    title: 'The Permanent Studio Bench',
    description: 'Open-sourcing every schematic and repository for upcoming cohorts to inherit, build upon, and remix.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
];

export const Act03HorizontalArchive: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Calculate horizontal translation distance
  const xTranslate = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '-78%']);

  // Active progress index transform
  const progressIndex = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 2, 3, 4, 5, 6]);

  return (
    <section
      id="act-03-archive"
      ref={targetRef}
      className="relative h-[320vh] bg-[#0A0A09] text-[#F3EEE5]"
    >
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden py-8 select-none">
        {/* Top Editorial Archive Header Bar */}
        <div className="px-6 sm:px-12 flex items-center justify-between border-b border-white/10 pb-4 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#EF5A2A] text-[#0A0A09] font-bold text-[10px] uppercase rounded-[2px]">
              CHAPTER 04 // 07
            </span>
            <span className="text-[#A6A095] uppercase tracking-widest hidden sm:inline">
              VISUAL ARCHIVE: THE 6 MOMENTS
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#A6A095]">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#EF5A2A]" />
              <span>PHOTOGRAPHIC CHRONOLOGY</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-white font-bold">
              <span>01</span>
              <span>—</span>
              <span className="text-[#EF5A2A]">06</span>
            </div>
          </div>
        </div>

        {/* Horizontal Filmstrip Sequence Track */}
        <div className="flex-1 flex items-center overflow-hidden relative my-4">
          <motion.div
            style={{ x: shouldReduceMotion ? 0 : xTranslate }}
            className="flex items-center gap-8 sm:gap-12 pl-6 sm:pl-12 pr-12 will-change-transform"
          >
            {ARCHIVE_MOMENTS.map((item, idx) => (
              <div
                key={item.number}
                className="w-[85vw] sm:w-[65vw] md:w-[50vw] lg:w-[42vw] shrink-0 flex flex-col bg-[#14151C] border border-white/10 rounded-[3px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] group transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-[42vh] sm:h-[48vh] w-full overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14151C] via-transparent to-black/40 pointer-events-none" />

                  {/* Top Corner Metadata Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0A0A09] bg-[#EF5A2A] px-2 py-0.5 rounded-[2px]">
                      {item.number} / {item.chapter}
                    </span>
                    <span className="font-mono text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-[2px] uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Caption Footer */}
                <div className="p-6 space-y-2 border-t border-white/5 bg-[#14151C]">
                  <h3 className="font-fraunces font-bold text-xl sm:text-2xl text-white tracking-tight group-hover:text-[#EF5A2A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-bitter text-sm text-[#A6A095] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Horizontal Progress Bar */}
        <div className="px-6 sm:px-12 flex items-center justify-between font-mono text-xs text-[#8C8881] shrink-0 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF5A2A] animate-pulse" />
            <span className="text-white uppercase">VERTICAL SCROLL DRIVES HORIZONTAL FILMSTRIP</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[#A6A095]">CONTINUE SCROLLING TO EMERGE</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EF5A2A]" />
          </div>
        </div>
      </div>
    </section>
  );
};
