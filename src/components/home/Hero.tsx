/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { ExploreNexusButton } from './ExploreButton.tsx';
import { InteractiveNexusX } from '../brand/NexusLogo.tsx';
import RotatingText from './RotatingText.tsx';
import { PixelBlast } from '../motion/PixelBlast.tsx';
import { AppRoute } from '../../types.ts';

interface HeroProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * RECOMPOSED EDITORIAL NEXUS HERO
 *
 * Designed around a strict Swiss editorial grid and single visual hierarchy:
 * 1. Eyebrow: WHERE IDEAS FIND [PEOPLE / BUILDERS / CREATORS / MAKERS]
 * 2. Dominant Anchor: NEXUS Identity with scroll-driven distillation into iconic X
 * 3. Position: COLLEGE COMMUNITY
 * 4. Supporting Measure: "A student-led community for building, experimenting and creating projects that matter."
 * 5. Primary Action: EXPLORE NEXUS
 *
 * Accompanied by:
 * - PixelBlast: A living orange digital field with soft quiet-zone protection for the central X
 * - Scroll-Driven Logo Transformation: Smoothly de-emphasizes letters & travels into the navbar brand anchor
 */
export const Hero: React.FC<HeroProps> = ({ onRouteChange }) => {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const logoAnchorRef = useRef<HTMLDivElement | null>(null);
  const logoContainerRef = useRef<HTMLDivElement | null>(null);
  const neRef = useRef<HTMLSpanElement | null>(null);
  const usRef = useRef<HTMLSpanElement | null>(null);
  const xAnchorRef = useRef<HTMLSpanElement | null>(null);
  const xWrapperRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLSpanElement | null>(null);

  // Responsive Quiet Zone tracking to guarantee the central X remains pristine
  const [quietZone, setQuietZone] = useState<{
    center: { x: number; y: number };
    radius: { rx: number; ry: number };
  }>({
    center: { x: 0.5, y: 0.46 },
    radius: { rx: 0.22, ry: 0.18 },
  });

  useEffect(() => {
    const updateQuietZone = () => {
      if (!sectionRef.current || !logoAnchorRef.current) return;
      const secRect = sectionRef.current.getBoundingClientRect();
      const logoRect = logoAnchorRef.current.getBoundingClientRect();
      if (secRect.width <= 0 || secRect.height <= 0) return;

      const cx = (logoRect.left + logoRect.width / 2 - secRect.left) / secRect.width;
      const cy = (logoRect.top + logoRect.height * 0.44 - secRect.top) / secRect.height;
      const rx = (logoRect.width * 0.38) / secRect.width;
      const ry = (logoRect.height * 0.95) / secRect.height;

      setQuietZone({
        center: {
          x: Math.max(0.15, Math.min(0.85, cx)),
          y: Math.max(0.15, Math.min(0.85, cy)),
        },
        radius: {
          rx: Math.max(0.12, Math.min(0.38, rx)),
          ry: Math.max(0.1, Math.min(0.32, ry)),
        },
      });
    };

    updateQuietZone();
    window.addEventListener('resize', updateQuietZone);
    const timeout = setTimeout(updateQuietZone, 250);
    return () => {
      window.removeEventListener('resize', updateQuietZone);
      clearTimeout(timeout);
    };
  }, []);

  // Scroll-driven logo transformation: Full NEXUS -> Distill to X -> Travel into Navbar
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number | null = null;
    let lastArrivedState: boolean | null = null;

    const updateScrollTransform = () => {
      if (!sectionRef.current || !xAnchorRef.current) return;

      const scrollY = window.scrollY;
      const secRect = sectionRef.current.getBoundingClientRect();
      const heroH = secRect.height || window.innerHeight;
      const transitionDist = Math.max(260, Math.min(680, heroH * 0.75));
      const p = Math.max(0, Math.min(1, scrollY / transitionDist));

      const arrived = p >= 0.96;
      if (arrived !== lastArrivedState) {
        lastArrivedState = arrived;
        window.dispatchEvent(
          new CustomEvent('nexus-hero-scroll-handoff', { detail: { arrived } })
        );
      }

      // 1. NE / US and Subtitle transformations
      let neUsOpacity = 1;
      let neUsScale = 1;
      let neTx = 0;
      let usTx = 0;
      let subtitleOpacity = 1;
      let logoScale = 1;
      let logoTy = 0;
      let xEmphasis = 1;

      if (p <= 0.2) {
        const t1 = p / 0.2;
        logoScale = 1 - t1 * 0.04;
        logoTy = -t1 * 6;
        subtitleOpacity = 1 - t1 * 0.15;
      } else if (p <= 0.55) {
        const t2 = (p - 0.2) / 0.35;
        logoScale = 0.96;
        logoTy = -6 - t2 * 8;
        neUsOpacity = 1 - t2 * 0.85;
        neUsScale = 1 - t2 * 0.12;
        neTx = t2 * 8;
        usTx = -t2 * 8;
        subtitleOpacity = 0.85 * (1 - t2);
        xEmphasis = 1 + t2 * 0.08;
      } else if (p <= 0.78) {
        const t3 = (p - 0.55) / 0.23;
        logoScale = 0.96;
        logoTy = -14;
        neUsOpacity = 0.15 * (1 - t3);
        neUsScale = 0.88 - t3 * 0.08;
        neTx = 8 + t3 * 4;
        usTx = -8 - t3 * 4;
        subtitleOpacity = 0;
        xEmphasis = 1.08 - t3 * 0.08;
      } else {
        neUsOpacity = 0;
        neUsScale = 0.8;
        neTx = 12;
        usTx = -12;
        subtitleOpacity = 0;
        logoScale = 0.96;
        logoTy = -14;
        xEmphasis = 1;
      }

      // Apply styles to letters and subtitle
      if (neRef.current) {
        neRef.current.style.opacity = `${neUsOpacity}`;
        neRef.current.style.transform = `translate3d(${neTx}px, 0, 0) scale(${neUsScale})`;
      }
      if (usRef.current) {
        usRef.current.style.opacity = `${neUsOpacity}`;
        usRef.current.style.transform = `translate3d(${usTx}px, 0, 0) scale(${neUsScale})`;
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = `${subtitleOpacity}`;
      }

      // 2. Central X Shared-Element Travel to Navbar
      if (xWrapperRef.current && xAnchorRef.current) {
        if (p <= 0.78) {
          xWrapperRef.current.style.transform = `translate3d(0, 0, 0) scale(${xEmphasis * logoScale})`;
          xWrapperRef.current.style.opacity = '1';
        } else {
          // Traveling phase (0.78 to 1.0)
          const t4 = (p - 0.78) / 0.22;
          const easeT4 = t4 * t4 * (3 - 2 * t4);

          const navElem = document.getElementById('navbar-brand-x');
          const heroAnchor = xAnchorRef.current;

          if (navElem && heroAnchor) {
            const navRect = navElem.getBoundingClientRect();
            const heroRect = heroAnchor.getBoundingClientRect();

            const heroCenterX = heroRect.left + heroRect.width / 2;
            const heroCenterY = heroRect.top + heroRect.height / 2;
            const navCenterX = navRect.left + navRect.width / 2;
            const navCenterY = navRect.top + navRect.height / 2;

            const deltaX = navCenterX - heroCenterX;
            const deltaY = navCenterY - heroCenterY;
            const targetScale = (navRect.width || 28) / Math.max(1, heroRect.width || 80);

            const currentX = easeT4 * deltaX;
            const currentY = easeT4 * deltaY;
            const currentScale = 1 + easeT4 * (targetScale - 1);
            const currentOpacity = Math.max(0, 1 - easeT4 * 1.05);

            xWrapperRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale})`;
            xWrapperRef.current.style.opacity = `${currentOpacity}`;
          }
        }
      }
    };

    const handleScrollOrResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollTransform);
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    updateScrollTransform();

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="nexus-hero-section"
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center pt-8 sm:pt-12 md:pt-14 pb-10 sm:pb-14 md:pb-16 border-b border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-primary)] select-none transition-colors duration-250"
    >
      {/* 1. Subtle Editorial Paper Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: 'radial-gradient(var(--text-primary) 0.75px, transparent 0.75px)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden="true"
      />

      {/* 2. PixelBlast: Living Orange Digital Field (Isolated Background Layer) */}
      <div
        className="absolute inset-0 pointer-events-auto z-[1] overflow-hidden"
        aria-hidden="true"
      >
        <PixelBlast
          variant="circle"
          pixelSize={5}
          color="#F2613F"
          secondaryColor="#481E14"
          patternScale={3.2}
          patternDensity={0.76}
          pixelSizeJitter={0.3}
          enableRipples={true}
          rippleSpeed={0.32}
          rippleThickness={0.1}
          rippleIntensityScale={0.85}
          liquid={true}
          liquidStrength={0.07}
          liquidRadius={1.0}
          liquidWobbleSpeed={3.0}
          speed={0.35}
          edgeFade={0.35}
          transparent={true}
          intensity={0.42}
          scrollReactive={true}
          scrollParallax={1.1}
          cursorReactive={true}
          cursorInfluence={0.76}
          cursorRadius={0.28}
          quietZoneCenter={quietZone.center}
          quietZoneRadius={quietZone.radius}
          quietZoneFeather={0.55}
          className="w-full h-full"
        />
      </div>

      {/* 3. Outer Editorial Frame Metadata */}
      <div className="absolute inset-x-6 sm:inset-x-10 md:inset-x-14 top-6 pointer-events-none hidden sm:flex items-center justify-between text-[9px] font-dosis font-semibold tracking-[0.28em] text-[var(--text-muted)] uppercase z-10" aria-hidden="true">
        <span>NEXUS // 2026</span>
        <span>CAMPUS CREATIVE &amp; TECH COLLECTIVE</span>
        <span>STUDENT INITIATIVE</span>
      </div>

      {/* 4. Core Hero Composition */}
      <Container className="relative z-10 w-full flex flex-col items-center justify-center my-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">

          {/* HIERARCHY LEVEL 1: Small Eyebrow Label ("WHERE IDEAS FIND PEOPLE") */}
          <motion.div
            id="hero-eyebrow-label"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center mb-3 sm:mb-4"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1 border border-[rgba(242,97,63,0.35)] bg-[var(--bg-secondary)]"
            >
              <p className="font-dosis text-[11px] sm:text-xs md:text-[13px] font-semibold tracking-[0.22em] sm:tracking-[0.25em] text-[#F2613F] uppercase whitespace-nowrap">
                WHERE IDEAS FIND
              </p>
              <div className="inline-flex items-center justify-start">
                <RotatingText
                  texts={['PEOPLE.', 'BUILDERS.', 'CREATORS.', 'MAKERS.', 'COLLABORATORS.']}
                  mainClassName="font-dosis text-[11px] sm:text-xs md:text-[13px] font-bold tracking-[0.2em] sm:tracking-[0.22em] text-[var(--text-primary)] uppercase overflow-hidden text-left whitespace-nowrap"
                  splitLevelClassName="overflow-hidden justify-start pb-0.5 whitespace-nowrap"
                  staggerFrom="first"
                  staggerDuration={0.015}
                  rotationInterval={3200}
                  transition={{ type: 'spring', damping: 28, stiffness: 360 }}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* HIERARCHY LEVEL 2: NEXUS Principal Visual Anchor (Distills on scroll and travels to Navbar X) */}
          <motion.div
            ref={logoAnchorRef}
            id="hero-nexus-logo-anchor"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center my-0.5 sm:my-1"
          >
            <div
              ref={logoContainerRef}
              id="hero-main-nexus-logo"
              className="inline-flex flex-col items-center select-none group"
              aria-label="NEXUS College Community"
            >
              <span
                id="hero-main-nexus-wordmark"
                className="inline-flex items-center font-lovelo font-bold uppercase select-none text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.22em] text-[var(--text-primary)]"
                aria-label="NEXUS"
              >
                <span
                  ref={neRef}
                  className="inline-block font-lovelo transition-transform duration-75 ease-out"
                  style={{ willChange: 'transform, opacity' }}
                >
                  NE
                </span>

                {/* Central Iconic X: Preserves authentic geometry & Liquid Metallic Paint, transitions to Navbar on scroll */}
                <span
                  ref={xAnchorRef}
                  className="relative inline-flex items-center justify-center mx-[0.06em] self-center"
                >
                  <div
                    ref={xWrapperRef}
                    id="hero-travelling-x"
                    className="relative inline-flex items-center justify-center z-30"
                    style={{
                      willChange: 'transform, opacity',
                      transformOrigin: 'center center',
                    }}
                  >
                    <InteractiveNexusX
                      sizeClass="w-[0.84em] h-[0.84em] -translate-y-[0.02em]"
                      className="transform transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </span>

                <span
                  ref={usRef}
                  className="inline-block font-lovelo transition-transform duration-75 ease-out"
                  style={{ willChange: 'transform, opacity' }}
                >
                  US
                </span>
              </span>

              <span
                ref={subtitleRef}
                className="font-dosis uppercase font-semibold tracking-[0.35em] text-sm md:text-base text-[var(--text-secondary)] mt-1 sm:mt-1.5 transition-opacity duration-75 ease-out"
                style={{ willChange: 'opacity' }}
              >
                COLLEGE COMMUNITY
              </span>
            </div>
          </motion.div>

          {/* HIERARCHY LEVEL 3: Supporting Copy (Readable Editorial Measure: 500-620px max-width) */}
          <motion.div
            id="hero-supporting-description"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[580px] mx-auto px-4 mt-4 sm:mt-5 md:mt-6"
          >
            <p className="font-bitter text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-normal">
              A student-led community for building, experimenting and creating projects that matter.
            </p>
          </motion.div>

          {/* HIERARCHY LEVEL 4: Primary Action Button ("EXPLORE NEXUS") */}
          <motion.div
            id="hero-primary-action-wrap"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 sm:mt-6 md:mt-7 flex items-center justify-center w-full"
          >
            <ExploreNexusButton
              id="hero-explore-button"
              label="EXPLORE NEXUS"
              onClick={() => onRouteChange('/about')}
            />
          </motion.div>

        </div>
      </Container>
    </section>
  );
};

export default Hero;
