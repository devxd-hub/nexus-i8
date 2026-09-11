/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hero } from '../components/home/Hero.tsx';
import { AboutPreview } from '../components/home/AboutPreview.tsx';
import { ProcessSection } from '../components/home/ProcessSection.tsx';
import { ProjectPreview } from '../components/home/ProjectPreview.tsx';
import { GalleryPreview } from '../components/home/GalleryPreview.tsx';
import { TeamPreview } from '../components/home/TeamPreview.tsx';
import { FinalCTA } from '../components/home/FinalCTA.tsx';
import { AppRoute } from '../types.ts';

interface HomePageProps {
  onRouteChange: (route: AppRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange }) => {
  return (
    <main id="nexus-home-page" className="w-full">
      {/* 1. HERO */}
      <Hero onRouteChange={onRouteChange} />

      {/* 2. ABOUT NEXUS PREVIEW */}
      <AboutPreview onRouteChange={onRouteChange} />

      {/* 3. HOW NEXUS WORKS */}
      <ProcessSection />

      {/* 4. SELECTED PROJECTS PREVIEW */}
      <ProjectPreview onRouteChange={onRouteChange} />

      {/* 5. GALLERY PREVIEW */}
      <GalleryPreview onRouteChange={onRouteChange} />

      {/* 6. TEAM PREVIEW */}
      <TeamPreview onRouteChange={onRouteChange} />

      {/* 7. FINAL CALL TO ACTION */}
      <FinalCTA onRouteChange={onRouteChange} />
    </main>
  );
};
