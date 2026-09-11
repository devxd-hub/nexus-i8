/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, TextLink } from '../primitives/Button.tsx';
import { GalleryTile } from '../primitives/GalleryTile.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';
import { GALLERY_ITEMS } from '../../data/nexusData.ts';

interface GalleryPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * GALLERY PREVIEW
 * Heading: INSIDE NEXUS.
 * Editorial composition representing: people, workshops, projects, events, prototyping, collaboration, presentations.
 * Interactive tiles with subtle hover scale, caption reveal, and arrow indicator.
 */
export const GalleryPreview: React.FC<GalleryPreviewProps> = ({ onRouteChange }) => {
  // Select an editorial mix of images across categories
  const previewItems = GALLERY_ITEMS.slice(0, 4);

  return (
    <RevealSection
      id="nexus-gallery-preview"
      className="w-full py-14 sm:py-18 md:py-22 bg-[#EBE5DB] border-b border-[rgba(10,10,9,0.12)]"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 pb-4 sm:pb-5 border-b border-[rgba(10,10,9,0.12)]">
          <div className="space-y-3">
            <SectionLabel number="04" label="STUDIO ARCHIVE" />
            <RevealText
              as="h2"
              staggerMs={45}
              className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase"
            >
              INSIDE NEXUS.
            </RevealText>
            <p className="font-bitter text-[#66615A] max-w-lg text-base sm:text-lg leading-relaxed">
              Moments from workshops, sprint nights, team critiques, and hands-on making in the studio.
            </p>
          </div>
          <TextLink
            label="FULL ARCHIVE"
            onClick={() => onRouteChange('/gallery')}
          />
        </div>

        {/* Editorial Composition Grid with Interactive Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Item 1: Prototyping (Span 7) */}
          <div className="md:col-span-7">
            <GalleryTile
              item={previewItems[0]}
              aspectRatio="16/9"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          {/* Item 2: People (Span 5) */}
          <div className="md:col-span-5">
            <GalleryTile
              item={previewItems[1]}
              aspectRatio="4/3"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          {/* Item 3: Projects / Testing (Span 5) */}
          <div className="md:col-span-5">
            <GalleryTile
              item={previewItems[2]}
              aspectRatio="1/1"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          {/* Item 4: Workshops (Span 7) */}
          <div className="md:col-span-7">
            <GalleryTile
              item={previewItems[3]}
              aspectRatio="16/9"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>
        </div>

        {/* CTA: VIEW THE GALLERY */}
        <div className="mt-10 sm:mt-12 text-center">
          <PrimaryButton
            label="VIEW THE GALLERY"
            onClick={() => onRouteChange('/gallery')}
            magnetic={true}
          />
        </div>
      </Container>
    </RevealSection>
  );
};
