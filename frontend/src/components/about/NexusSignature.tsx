/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AsciiPenguinWalkStage } from './AsciiPenguinWalkStage.tsx';
import { AsciiGlitchBackground } from './AsciiGlitchBackground.tsx';

/**
 * NEXUS Signature Section with Uploaded ASCII Penguin Walking Mascot
 *
 * Side-by-side layout:
 * - Left side: "About" title with thoughtful & inspiring text.
 * - Right side: Living ASCII orange penguin walking with realistic physics.
 * - Background: Interactive ASCII glitch matrix canvas responding to cursor movements and clicks.
 */
export const NexusSignature: React.FC = () => {
  return (
    <section
      id="about-nexus-signature"
      aria-label="About NEXUS and Living ASCII Penguin Mascot"
      className="relative w-full flex flex-col items-center justify-center pt-8 sm:pt-12 md:pt-14 pb-8 sm:pb-12 md:pb-14 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] overflow-hidden transition-colors duration-250"
    >
      {/* Interactive Ambient ASCII Glitch Background Layer */}
      <AsciiGlitchBackground accentColor="#F2613F" interactive={true} />

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pointer-events-none">
        {/* Two-Column Side-by-Side Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Title & Thoughtful Copy (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left pointer-events-auto">
            {/* Subtle Category Eyebrow with ASCII Accent */}
            <div className="mb-3 select-none flex items-center space-x-2">
              <span className="text-[#F2613F] font-mono text-xs">/ /</span>
              <span className="font-dosis uppercase text-[11px] sm:text-xs tracking-[0.28em] text-[#F2613F] font-bold">
                OUR STORY & PHILOSOPHY
              </span>
            </div>

            {/* Primary Heading */}
            <h1 className="font-fraunces font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[var(--text-primary)] leading-none select-none mb-6">
              About
            </h1>

            {/* Kind & Good Text */}
            <div className="space-y-4 max-w-xl">
              <p className="font-jakarta text-base sm:text-lg md:text-xl text-[var(--text-secondary)] font-normal leading-relaxed">
                Built with care, kindness, and attention to every detail. We believe that steady, thoughtful steps and genuine curiosity can turn simple ideas into delightful experiences.
              </p>

              <p className="font-jakarta text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed">
                Taking things one stride at a time, with warmth, optimism, and purpose.
              </p>
            </div>

            {/* Micro ASCII Architectural Stamp */}
            <div className="mt-8 flex items-center space-x-3 text-[11px] font-mono text-[var(--text-muted)] select-none">
              <span className="text-[#F2613F]">[+]</span>
              <span>EST. 2026</span>
              <span>•</span>
              <span>CONTINUOUS EVOLUTION</span>
            </div>
          </div>

          {/* Right Column: ASCII Penguin Walking Stage (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end w-full pointer-events-auto">
            <div className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px] h-[340px] sm:h-[400px] md:h-[440px] flex items-center justify-center relative">
              <AsciiPenguinWalkStage
                id="nexus-about-ascii-penguin"
                className="w-full h-full"
                maxHeight={440}
                color="#F2613F"
                stationary={true}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NexusSignature;
