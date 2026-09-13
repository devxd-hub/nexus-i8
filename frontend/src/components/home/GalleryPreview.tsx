/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { PrimaryButton, TextLink } from '../primitives/Button.tsx';
import { GalleryTile } from '../primitives/GalleryTile.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';
import { GALLERY_ITEMS } from '../../data/nexusData.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryPreviewProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * GALLERY PREVIEW
 * Heading: INSIDE NEXUS.
 * On Desktop: Editorial Asymmetric Grid
 * On Mobile / Small Screens: Smooth Horizontal Touch-Snap Carousel with Indicators
 */
export const GalleryPreview: React.FC<GalleryPreviewProps> = ({ onRouteChange }) => {
  const previewItems = GALLERY_ITEMS.slice(0, 6);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth > 0) {
      const idx = Math.round(scrollLeft / (offsetWidth * 0.85));
      setActiveMobileIdx(Math.min(previewItems.length - 1, Math.max(0, idx)));
    }
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const itemWidth = scrollRef.current.offsetWidth * 0.85;
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
  };

  return (
    <RevealSection
      id="nexus-gallery-preview"
      className="w-full py-12 sm:py-16 md:py-22 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] transition-colors duration-250"
    >
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-5 border-b border-[var(--border-subtle)]">
          <div className="space-y-2 sm:space-y-3">
            <SectionLabel number="04" label="STUDIO ARCHIVE" />
            <RevealText
              as="h2"
              staggerMs={45}
              className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.08] tracking-tight uppercase"
            >
              INSIDE NEXUS.
            </RevealText>
            <p className="font-bitter text-[var(--text-secondary)] max-w-lg text-sm sm:text-base md:text-lg leading-relaxed">
              Moments from workshops, sprint nights, team critiques, and hands-on making in the studio.
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4">
            {/* Mobile Carousel Controls */}
            <div className="flex md:hidden items-center gap-1.5 bg-[var(--bg-surface)] p-1 border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => scrollToIndex(Math.max(0, activeMobileIdx - 1))}
                disabled={activeMobileIdx === 0}
                className="p-1 disabled:opacity-30 text-[var(--text-primary)]"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 text-[var(--text-muted)]">
                {activeMobileIdx + 1} / {previewItems.length}
              </span>
              <button
                type="button"
                onClick={() => scrollToIndex(Math.min(previewItems.length - 1, activeMobileIdx + 1))}
                disabled={activeMobileIdx === previewItems.length - 1}
                className="p-1 disabled:opacity-30 text-[var(--text-primary)]"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <TextLink
              label="FULL ARCHIVE"
              onClick={() => onRouteChange('/gallery')}
            />
          </div>
        </div>

        {/* Mobile Swipe Carousel (< md) */}
        <div className="block md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {previewItems.map((item, idx) => (
              <div
                key={item.id}
                className="w-[82vw] max-w-[340px] shrink-0 snap-center"
              >
                <GalleryTile
                  item={item}
                  aspectRatio="1/1"
                  onSelect={() => onRouteChange('/gallery')}
                />
              </div>
            ))}
          </div>

          {/* Swipe indicator dots */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {previewItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 ${
                  activeMobileIdx === idx
                    ? 'w-6 bg-[#F2613F]'
                    : 'w-1.5 bg-[rgba(245,239,230,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Editorial Grid (>= md) */}
        <div className="hidden md:grid grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="md:col-span-7">
            <GalleryTile
              item={previewItems[0]}
              aspectRatio="16/9"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          <div className="md:col-span-5">
            <GalleryTile
              item={previewItems[1]}
              aspectRatio="4/3"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          <div className="md:col-span-5">
            <GalleryTile
              item={previewItems[2]}
              aspectRatio="1/1"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>

          <div className="md:col-span-7">
            <GalleryTile
              item={previewItems[3]}
              aspectRatio="16/9"
              onSelect={() => onRouteChange('/gallery')}
            />
          </div>
        </div>

        {/* CTA: VIEW THE GALLERY */}
        <div className="mt-8 sm:mt-12 text-center">
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
