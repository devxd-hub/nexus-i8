/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { RevealSection, RevealText } from '../motion/MotionPrimitives.tsx';
import { AppRoute } from '../../types.ts';

interface FinalCTAProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * Hook for smooth magnetic attraction on desktop fine pointers.
 */
function useButtonMagnetic(enabled: boolean = true) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsFinePointer(fine && !reducedMotion);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enabled || !isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.16;
    const deltaY = (e.clientY - centerY) * 0.16;
    const clampedX = Math.max(-6, Math.min(6, deltaX));
    const clampedY = Math.max(-6, Math.min(6, deltaY));
    setOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    if (!enabled || !isFinePointer) return;
    setOffset({ x: 0, y: 0 });
  };

  return {
    offset,
    handleMouseMove,
    handleMouseLeave,
    style: enabled && isFinePointer ? {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      transition: offset.x === 0 && offset.y === 0
        ? 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)'
        : 'transform 80ms ease-out',
    } : undefined,
  };
}

/**
 * Hook for localized cursor follower glow
 */
function useButtonGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const onMouseLeave = () => {
    setPos((prev) => ({ ...prev, active: false }));
  };

  return { pos, onMouseMove, onMouseLeave };
}

/**
 * FINAL CALL TO ACTION (SECTION 06)
 * Heading: BUILD WHAT'S NEXT.
 * Subhead: If you want to make projects with people who care about craft, design, and code, NEXUS is where you start.
 * Highly visible, tactile, reactive buttons.
 */
export const FinalCTA: React.FC<FinalCTAProps> = ({ onRouteChange }) => {
  const primaryMagnetic = useButtonMagnetic(true);
  const primaryGlow = useButtonGlow();

  const secondaryMagnetic = useButtonMagnetic(true);
  const secondaryGlow = useButtonGlow();

  return (
    <RevealSection
      id="nexus-final-cta"
      className="relative w-full py-20 sm:py-24 md:py-28 bg-[#0A0A09] text-[#F3EEE5] overflow-hidden border-t border-[rgba(243,238,229,0.08)]"
    >
      {/* Background Subtle Geometric Atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[radial-gradient(#F3EEE5_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Background Watermark of Authentic X */}
      <div
        className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none select-none"
        aria-hidden="true"
      >
        <NexusIcon size="custom" className="w-80 h-80 sm:w-96 sm:h-96" />
      </div>

      <Container>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 sm:space-y-8">
          {/* Centered Brand Emblem */}
          <div className="flex justify-center">
            <div className="p-3 bg-[#151311] border border-[rgba(239,90,42,0.5)] shadow-[0_0_20px_rgba(239,90,42,0.15)] inline-flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
              <NexusIcon size="md" />
            </div>
          </div>

          <SectionLabel
            number="06"
            label="GET IN TOUCH"
            className="justify-center text-[#F3EEE5]/80"
          />

          <RevealText
            as="h2"
            staggerMs={45}
            className="font-fraunces font-bold text-4xl sm:text-5xl lg:text-6xl text-[#F3EEE5] tracking-tight uppercase"
          >
            BUILD WHAT'S NEXT.
          </RevealText>

          <p className="font-bitter text-base sm:text-lg md:text-xl text-[#F3EEE5]/85 max-w-2xl mx-auto leading-relaxed">
            If you want to make projects with people who care about craft, design, and code, NEXUS is where you start.
          </p>

          {/* High-Visibility, Ultra-Reactive CTA Action Buttons */}
          <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Primary Action Button: GET IN TOUCH */}
            <button
              id="cta-btn-get-in-touch"
              type="button"
              onClick={() => onRouteChange('/contact')}
              onMouseMove={(e) => {
                primaryMagnetic.handleMouseMove(e);
                primaryGlow.onMouseMove(e);
              }}
              onMouseLeave={() => {
                primaryMagnetic.handleMouseLeave();
                primaryGlow.onMouseLeave();
              }}
              style={primaryMagnetic.style}
              className="relative w-full sm:w-auto inline-flex items-center justify-between gap-6 px-8 py-4 sm:px-9 sm:py-4.5 bg-[#EF5A2A] text-white font-dosis font-bold tracking-[0.22em] text-xs sm:text-[13px] uppercase rounded-[2px] border border-[#FF7448] shadow-[0_4px_24px_rgba(239,90,42,0.4)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(239,90,42,0.65)] hover:bg-[#FF6636] active:scale-[0.98] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer group select-none overflow-hidden"
              aria-label="GET IN TOUCH"
            >
              {/* Dynamic Cursor Light Follower */}
              {primaryGlow.pos.active && (
                <span
                  className="absolute pointer-events-none rounded-full opacity-60 mix-blend-overlay"
                  style={{
                    left: `${primaryGlow.pos.x}px`,
                    top: `${primaryGlow.pos.y}px`,
                    width: '140px',
                    height: '140px',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 50%, transparent 75%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Reactive Corner Pins */}
              <span className="absolute top-1 left-1 w-1 h-1 bg-white opacity-80 group-hover:scale-125 transition-transform duration-200" aria-hidden="true" />
              <span className="absolute bottom-1 right-1 w-1 h-1 bg-white opacity-80 group-hover:scale-125 transition-transform duration-200" aria-hidden="true" />

              {/* Text & Icon Content */}
              <span className="relative z-10 text-white font-bold tracking-[0.22em] transition-transform duration-200 group-hover:translate-x-0.5">
                GET IN TOUCH
              </span>
              <span className="relative z-10 inline-flex items-center justify-center text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>

            {/* Secondary Action Button: EXPLORE PROJECTS */}
            <button
              id="cta-btn-explore-projects"
              type="button"
              onClick={() => onRouteChange('/projects')}
              onMouseMove={(e) => {
                secondaryMagnetic.handleMouseMove(e);
                secondaryGlow.onMouseMove(e);
              }}
              onMouseLeave={() => {
                secondaryMagnetic.handleMouseLeave();
                secondaryGlow.onMouseLeave();
              }}
              style={secondaryMagnetic.style}
              className="relative w-full sm:w-auto inline-flex items-center justify-between gap-6 px-8 py-4 sm:px-9 sm:py-4.5 bg-[#171513] text-[#F3EEE5] font-dosis font-bold tracking-[0.22em] text-xs sm:text-[13px] uppercase rounded-[2px] border border-[rgba(243,238,229,0.4)] shadow-[0_4px_18px_rgba(0,0,0,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#EF5A2A] hover:text-white hover:bg-[#1F1C19] hover:shadow-[0_8px_28px_rgba(239,90,42,0.2)] active:scale-[0.98] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] cursor-pointer group select-none overflow-hidden"
              aria-label="EXPLORE PROJECTS"
            >
              {/* Dynamic Cursor Highlight */}
              {secondaryGlow.pos.active && (
                <span
                  className="absolute pointer-events-none rounded-full opacity-40"
                  style={{
                    left: `${secondaryGlow.pos.x}px`,
                    top: `${secondaryGlow.pos.y}px`,
                    width: '140px',
                    height: '140px',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(239,90,42,0.5) 0%, rgba(239,90,42,0.1) 50%, transparent 75%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Reactive Left Accent Bar */}
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#EF5A2A] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-250 ease-out origin-top" aria-hidden="true" />

              {/* Text & Icon Content */}
              <span className="relative z-10 text-[#F3EEE5] group-hover:text-white font-bold tracking-[0.22em] transition-transform duration-200 group-hover:translate-x-0.5">
                EXPLORE PROJECTS
              </span>
              <span className="relative z-10 inline-flex items-center justify-center text-[#EF5A2A] group-hover:text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>
          </div>
        </div>
      </Container>
    </RevealSection>
  );
};

