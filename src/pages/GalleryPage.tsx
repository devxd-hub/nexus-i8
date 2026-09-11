/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '../components/primitives/Container.tsx';
import { SectionLabel } from '../components/primitives/SectionLabel.tsx';
import { PrimaryButton, SecondaryButton, NexusFilterButton, NexusIconButton } from '../components/primitives/Button.tsx';
import { GalleryTile } from '../components/primitives/GalleryTile.tsx';
import { NexusIcon } from '../components/brand/NexusLogo.tsx';
import { RevealSection, RevealText } from '../components/motion/MotionPrimitives.tsx';
import { ColorBends } from '../components/motion/ColorBends.tsx';
import { DomeGallery } from '../components/motion/DomeGallery.tsx';
import { AppRoute, GalleryItem } from '../types.ts';
import { GALLERY_ITEMS } from '../data/nexusData.ts';
import {
  X,
  Maximize2,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
  Grid,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface GalleryPageProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * GALLERY PAGE (Restructured with 3D Dome Gallery)
 * - Atmospheric ColorBends Header
 * - Interactive 3D Dome Spherical Amphitheater Showcase
 * - Responsive Editorial Masonry Archive Grid
 * - High-Precision Keyboard Accessible Lightbox Modal
 */
export const GalleryPage: React.FC<GalleryPageProps> = ({ onRouteChange }) => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [galleryViewMode, setGalleryViewMode] = useState<'DOME' | 'GRID' | 'BOTH'>('BOTH');

  const categories = ['ALL', 'PEOPLE', 'WORKSHOPS', 'PROJECTS', 'PROTOTYPING', 'COLLABORATION', 'PRESENTATIONS'];

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (categoryFilter === 'ALL') return true;
    return item.category.toUpperCase() === categoryFilter;
  });

  // Lightbox keyboard navigation (Esc, Left, Right)
  const activeIndex = activeItem ? filteredItems.findIndex((i) => i.id === activeItem.id) : -1;

  const handlePrevItem = useCallback(() => {
    if (activeIndex > 0) {
      setActiveItem(filteredItems[activeIndex - 1]);
    } else if (filteredItems.length > 0) {
      setActiveItem(filteredItems[filteredItems.length - 1]);
    }
  }, [activeIndex, filteredItems]);

  const handleNextItem = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < filteredItems.length - 1) {
      setActiveItem(filteredItems[activeIndex + 1]);
    } else if (filteredItems.length > 0) {
      setActiveItem(filteredItems[0]);
    }
  }, [activeIndex, filteredItems]);

  useEffect(() => {
    if (!activeItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null);
      if (e.key === 'ArrowLeft') handlePrevItem();
      if (e.key === 'ArrowRight') handleNextItem();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, handlePrevItem, handleNextItem]);

  return (
    <main id="nexus-gallery-page" className="w-full bg-[#F3EEE5]">
      {/* 1. Header with Atmospheric ColorBends Shader Backdrop */}
      <RevealSection className="relative pt-20 md:pt-28 pb-16 md:pb-24 border-b border-[rgba(10,10,9,0.12)] overflow-hidden bg-[#F3EEE5]">
        {/* Generative ColorBends Interactive Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply overflow-hidden">
          <ColorBends
            colors={['#8a5cff', '#00ffd1', '#ff5c7a']}
            rotation={90}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.15}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel number="03" label="STUDIO ARCHIVE" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0A0A09] text-white text-xs font-dosis tracking-[0.2em] uppercase border border-[rgba(239,90,42,0.3)]">
                <NexusIcon size="xs" />
                <span>NEXUS GALLERY</span>
              </span>
            </div>
            <RevealText
              as="h1"
              staggerMs={40}
              className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight"
            >
              Inside the studio: crits, sprints, and builds.
            </RevealText>
            <p className="font-bitter text-lg text-[#66615A] leading-relaxed max-w-3xl">
              An interactive visual record of student teams in the lab — exploring projects on the 3D geodesic dome amphitheater or browsing the chronological editorial print archive.
            </p>

            {/* View Mode Switcher Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setGalleryViewMode('BOTH')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-dosis font-bold tracking-[0.18em] uppercase transition-all duration-200 border cursor-pointer ${
                  galleryViewMode === 'BOTH'
                    ? 'bg-[#0A0A09] text-white border-[#0A0A09] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#66615A] hover:text-[#0A0A09] border-[rgba(10,10,9,0.15)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>FULL EXPERIENCE (DOME + ARCHIVE)</span>
              </button>

              <button
                type="button"
                onClick={() => setGalleryViewMode('DOME')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-dosis font-bold tracking-[0.18em] uppercase transition-all duration-200 border cursor-pointer ${
                  galleryViewMode === 'DOME'
                    ? 'bg-[#0A0A09] text-white border-[#0A0A09] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#66615A] hover:text-[#0A0A09] border-[rgba(10,10,9,0.15)]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>3D DOME SPHERE</span>
              </button>

              <button
                type="button"
                onClick={() => setGalleryViewMode('GRID')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-dosis font-bold tracking-[0.18em] uppercase transition-all duration-200 border cursor-pointer ${
                  galleryViewMode === 'GRID'
                    ? 'bg-[#0A0A09] text-white border-[#0A0A09] shadow-xs'
                    : 'bg-[#FAF6F0] text-[#66615A] hover:text-[#0A0A09] border-[rgba(10,10,9,0.15)]'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>EDITORIAL GRID</span>
              </button>
            </div>
          </div>
        </Container>
      </RevealSection>

      {/* 2. IMMERSIVE 3D DOME GALLERY SECTION */}
      {(galleryViewMode === 'DOME' || galleryViewMode === 'BOTH') && (
        <section className="relative w-full border-b border-[rgba(10,10,9,0.14)] bg-[#0A0A09]">
          <div className="w-full h-[72vh] min-h-[580px] max-h-[860px]">
            <DomeGallery
              items={GALLERY_ITEMS}
              onSelect={(item) => setActiveItem(item)}
              showControls={true}
              autoRotateSpeed={0.2}
            />
          </div>
        </section>
      )}

      {/* 3. CHRONOLOGICAL EDITORIAL ARCHIVE GRID SECTION */}
      {(galleryViewMode === 'GRID' || galleryViewMode === 'BOTH') && (
        <>
          {/* Filter Tabs */}
          <section className="py-6 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB]">
            <Container>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-dosis text-xs font-bold text-[#66615A] tracking-[0.2em] mr-2">CATEGORY:</span>
                  {categories.map((cat) => (
                    <NexusFilterButton
                      key={cat}
                      label={cat}
                      active={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                    />
                  ))}
                </div>
                <span className="font-dosis text-xs tracking-[0.18em] text-[#66615A] font-semibold">
                  {filteredItems.length} RECORDS CATALOGED
                </span>
              </div>
            </Container>
          </section>

          {/* Responsive Asymmetric Editorial Grid */}
          <section className="py-20 md:py-28 border-b border-[rgba(10,10,9,0.12)]">
            <Container>
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <SectionLabel number="03.2" label="PRINT & DIGITAL ARCHIVE" />
                  <h2 className="font-fraunces font-bold text-3xl sm:text-4xl text-[#0A0A09] tracking-tight">
                    Studio Photo Journal
                  </h2>
                </div>
                <p className="font-bitter text-sm text-[#66615A] max-w-md">
                  Click any photo record to open the high-resolution documentation lightbox with lab notes and contributor tags.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {filteredItems.map((item, idx) => {
                  // Create deliberate asymmetric span rhythm:
                  const spanClasses = [
                    'md:col-span-7',
                    'md:col-span-5',
                    'md:col-span-5',
                    'md:col-span-7',
                    'md:col-span-8',
                    'md:col-span-4',
                    'md:col-span-6',
                    'md:col-span-6',
                  ][idx % 8];

                  return (
                    <div key={item.id} className={spanClasses}>
                      <GalleryTile
                        item={item}
                        aspectRatio={item.aspectRatio || '16/9'}
                        onSelect={(selected) => setActiveItem(selected)}
                      />
                    </div>
                  );
                })}
              </div>
            </Container>
          </section>
        </>
      )}

      {/* 4. Lightbox / Image Expansion Modal with Carousel Controls */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A09]/88 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-[#FAF6F0] border border-[#0A0A09] max-w-4xl w-full max-h-[94vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Category & Navigation */}
            <div className="flex items-center justify-between border-b border-[rgba(10,10,9,0.1)] pb-4">
              <div className="flex items-center gap-2">
                <NexusIcon size="xs" />
                <span className="font-dosis text-xs uppercase font-bold text-[#EF5A2A] tracking-[0.2em]">
                  STUDIO ARCHIVE // {activeItem.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevItem}
                  className="p-1.5 hover:bg-[#0A0A09]/10 rounded-full transition-colors cursor-pointer"
                  title="Previous Artifact (Left Arrow)"
                  aria-label="Previous Artifact"
                >
                  <ChevronLeft className="w-5 h-5 text-[#0A0A09]" />
                </button>
                <span className="text-[11px] font-mono text-[#66615A] px-1">
                  {(activeIndex + 1 || 1)} / {filteredItems.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextItem}
                  className="p-1.5 hover:bg-[#0A0A09]/10 rounded-full transition-colors cursor-pointer"
                  title="Next Artifact (Right Arrow)"
                  aria-label="Next Artifact"
                >
                  <ChevronRight className="w-5 h-5 text-[#0A0A09]" />
                </button>

                <div className="h-4 w-px bg-[rgba(10,10,9,0.15)] mx-1" />

                <NexusIconButton
                  onClick={() => setActiveItem(null)}
                  ariaLabel="Close lightbox"
                  icon={<X className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* High-Res Visual Frame */}
            <div className="w-full relative overflow-hidden bg-[#1E1E1C] border border-[rgba(10,10,9,0.15)] max-h-[500px] flex items-center justify-center">
              {activeItem.imageUrl ? (
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full max-h-[480px] object-cover object-center filter contrast-[1.03]"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="py-24 text-center">
                  <NexusIcon size="xl" className="mx-auto mb-4 opacity-50 text-white" />
                  <span className="font-dosis text-sm tracking-widest text-white/70 uppercase">
                    NEXUS LAB ARTIFACT SPECIMEN
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-xs border border-white/20 text-[10px] font-dosis font-bold tracking-[0.2em] text-[#EF5A2A] uppercase">
                {activeItem.category}
              </div>
            </div>

            {/* Details & Lab Notes */}
            <div className="space-y-4">
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0A0A09]">
                {activeItem.title}
              </h2>

              <p className="font-bitter text-base text-[#0A0A09] leading-relaxed">
                {activeItem.caption}
              </p>

              <div className="p-4 bg-[#EFE9DE] border-l-2 border-[#EF5A2A] space-y-1">
                <span className="font-dosis text-[10px] font-bold tracking-[0.2em] text-[#EF5A2A] uppercase block">
                  LAB NOTES & ARCHIVE CONTEXT:
                </span>
                <p className="font-bitter text-sm text-[#44403C] leading-relaxed">
                  {activeItem.description}
                </p>
              </div>
            </div>

            {/* Meta tags footer */}
            <div className="pt-4 border-t border-[rgba(10,10,9,0.1)] flex flex-wrap items-center justify-between gap-4 font-dosis text-xs text-[#66615A]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 font-semibold tracking-[0.15em]">
                  <Calendar className="w-4 h-4 text-[#EF5A2A]" />
                  <span>DATE: {activeItem.eventDate}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold tracking-[0.15em]">
                  <MapPin className="w-4 h-4 text-[#EF5A2A]" />
                  <span>LOCATION: {activeItem.location || 'STUDIO BENCH // INNOVATION LAB'}</span>
                </div>
                {activeItem.author && (
                  <div className="flex items-center gap-1.5 font-semibold tracking-[0.15em]">
                    <User className="w-4 h-4 text-[#EF5A2A]" />
                    <span>CONTRIBUTOR: {activeItem.author}</span>
                  </div>
                )}
              </div>

              <SecondaryButton
                label="CLOSE (ESC)"
                onClick={() => setActiveItem(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Studio Submission / Community Callout */}
      <RevealSection className="py-24 md:py-36 bg-[#151311] text-[#F3EEE5]">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <SectionLabel
              number="03.3"
              label="GET INVOLVED"
              className="justify-center text-[#F3EEE5]/70"
            />
            <h2 className="font-fraunces font-bold text-3xl sm:text-4xl text-[#F3EEE5] uppercase tracking-tight">
              Be part of the next studio session.
            </h2>
            <p className="font-bitter text-[#F3EEE5]/75 text-base sm:text-lg leading-relaxed">
              NEXUS studio crits and build sprints happen every week. No prior community membership required to visit during open studio hours or showcase your work.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                label="VISIT OPEN STUDIO →"
                onClick={() => onRouteChange('/contact')}
                className="bg-[#EF5A2A] border-[#EF5A2A] text-white hover:bg-white hover:text-[#0A0A09]"
              />
              <SecondaryButton
                label="EXPLORE PROJECTS"
                onClick={() => onRouteChange('/projects')}
                className="border-white/30 text-white hover:bg-white hover:text-[#0A0A09]"
              />
            </div>
          </div>
        </Container>
      </RevealSection>
    </main>
  );
};

