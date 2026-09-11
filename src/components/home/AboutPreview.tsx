/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton } from '../primitives/Button.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { FluidGlass } from '../motion/FluidGlass.tsx';
import { AppRoute } from '../../types.ts';

interface AboutPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * ABOUT PREVIEW / THE COLLECTIVE
 * Left: Interactive Fluid Glass refractive element
 * Right: Clean editorial narrative with "IDEAS ARE BETTER TOGETHER." and ABOUT NEXUS CTA
 */
export const AboutPreview: React.FC<AboutPreviewProps> = ({ onRouteChange }) => {
  return (
    <RevealSection
      id="nexus-about-preview"
      className="w-full py-14 sm:py-18 md:py-22 border-b border-[rgba(10,10,9,0.12)] bg-[#F3EEE5] overflow-hidden"
    >
      <Container>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left: Interactive Fluid Glass refraction element */}
          <div className="col-span-4 md:col-span-8 lg:col-span-6 order-2 lg:order-1">
            <FluidGlass aspectRatio="4/3" />
          </div>

          {/* Right: Narrative Text & Editorial Heading */}
          <div className="col-span-4 md:col-span-8 lg:col-span-6 order-1 lg:order-2 space-y-4 sm:space-y-6">
            <SectionLabel number="01" label="THE COLLECTIVE" />

            <div className="space-y-1.5">
              <RevealText
                as="h2"
                staggerMs={45}
                className="font-fraunces font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase"
              >
                IDEAS ARE BETTER TOGETHER.
              </RevealText>
            </div>

            <p className="font-bitter text-base sm:text-lg lg:text-xl text-[#66615A] leading-relaxed max-w-xl">
              NEXUS brings students from different disciplines together to explore questions,
              form teams, experiment with ideas, and build projects that have a life beyond
              the classroom.
            </p>

            <div className="pt-1 sm:pt-2">
              <PrimaryButton
                label="ABOUT NEXUS"
                onClick={() => onRouteChange('/about')}
              />
            </div>
          </div>
        </div>
      </Container>
    </RevealSection>
  );
};


