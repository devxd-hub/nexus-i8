/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppRoute } from '../types.ts';
import { AboutScrollManager } from '../components/about/AboutScrollManager.tsx';
import { NexusSignature } from '../components/about/NexusSignature.tsx';
import { AboutSection01Hero } from '../components/about/AboutSection01Hero.tsx';
import { NexusStoryScroll } from '../components/about/NexusStoryScroll.tsx';
import { AboutSection03Thinking } from '../components/about/AboutSection03Thinking.tsx';
import { AboutSection04Building } from '../components/about/AboutSection04Building.tsx';
import { AboutSection05Beliefs } from '../components/about/AboutSection05Beliefs.tsx';
import { AboutSection06Statement } from '../components/about/AboutSection06Statement.tsx';

interface AboutPageProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * NEXUS ABOUT PAGE
 *
 * Natural Vertical Scrolling Page with Fluid Momentum Scrolling:
 * 00 — Nexus Signature (NexusSignature)
 * 01 — About Introduction (AboutSection01Hero)
 * 02 — About Story (NexusStoryScroll — Dedicated Sticky Scroll-Driven Narrative)
 * 03 — Nexus Philosophy (AboutSection03Thinking)
 * 04 — Nexus Building Process (AboutSection04Building)
 * 05 — What We Believe (AboutSection05Beliefs)
 * 06 — Closing CTA Statement (AboutSection06Statement)
 */
export const AboutPage: React.FC<AboutPageProps> = ({ onRouteChange }) => {
  // Ensure top scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AboutScrollManager>
      <main
        id="nexus-about-page"
        className="w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#F2613F] selection:text-white flex flex-col transition-colors duration-250"
      >
        {/* 00 / Nexus Signature */}
        <NexusSignature />

        {/* 01 / Introduction */}
        <AboutSection01Hero />

        {/* 02 / Story (Dedicated Sticky Scroll-Driven Experience) */}
        <NexusStoryScroll />

        {/* 03 / Philosophy */}
        <AboutSection03Thinking />

        {/* 04 / Building Process */}
        <AboutSection04Building />

        {/* 05 / Beliefs */}
        <AboutSection05Beliefs />

        {/* 06 / Closing Statement & CTA */}
        <AboutSection06Statement onRouteChange={onRouteChange} />
      </main>
    </AboutScrollManager>
  );
};

export default AboutPage;
