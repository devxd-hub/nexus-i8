/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useCinematicTransition } from '../../context/CinematicTransitionContext.tsx';
import { resolveImageUrl, handleImageFallbackError } from '../../data/cloudinaryMap.ts';

/**
 * CinematicThemeTransition — NEXUS Preloader-Sibling Theme Shutter
 *
 * Sequence (Total ~750ms):
 *   0–250ms:   Two large opaque panels close from left & right, meeting at center (50vw).
 *   250–430ms: NEXUS X rapidly forms and resolves at exact center (left: 50%, top: 50%, translate(-50%, -50%)).
 *              Uses the canonical preloader SVG contour synthesis (#F2613F) resolving into the authentic mark.
 *   430–500ms: Theme state switches under full curtain cover (setTheme(pendingTheme)).
 *              X holds briefly as the authentic brand seal.
 *   500–750ms: Panels open outward to reveal the newly themed website; X departs cleanly.
 *
 * Visual Rules:
 *   - Exactly ONE theme-switch transition.
 *   - Authentic NEXUS X asset, never rotated, never stretched, perfectly centered.
 *   - Semantic palette: #0C0C0C (Dark) / #F3EEE5 (Light) panels; #F2613F NEXUS mark.
 *   - Purity: Zero particles, glow, gradient bursts, blur, 3D, glitch, or spark effects.
 */

// Exact canonical closed-polygon path for the authentic NEXUS X geometry (512 x 488)
const CANONICAL_PATH =
  'M 0 0 H 153.8 L 381.8 448.5 H 447.5 L 304.4 167 L 454.9 0 H 510.6 L 352.6 174.8 L 511.1 487 H 357.2 L 129.2 38.5 H 63.5 L 206.6 320 L 56.1 487 H 0.4 L 158.4 312.1 Z';

// Mathematical perimeter length of the authentic polygon
const PERIMETER_LENGTH = 3809;

// Authentic NEXUS X asset
const X_LOGO_SRC = resolveImageUrl('/logo/NEXUS-removebg-preview.png');

// Preload the X image in a module-level singleton
if (typeof window !== 'undefined') {
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'image';
  preloadLink.href = X_LOGO_SRC;
  document.head.appendChild(preloadLink);
}

export const CinematicThemeTransition: React.FC = () => {
  const { setTheme } = useTheme();
  const { isTransitioning, pendingTheme, onTransitionComplete } = useCinematicTransition();

  const overlayRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const logoImgRef = useRef<HTMLImageElement>(null);

  const reducedMotion = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // ── Helper: manage data-nexus-covering attribute ───────────────────────────
  // Suppresses CSS transitions on the page while panels fully cover it.
  const setCovering = (active: boolean) => {
    if (active) {
      document.documentElement.setAttribute('data-nexus-covering', '');
    } else {
      document.documentElement.removeAttribute('data-nexus-covering');
    }
  };

  const runTransition = useCallback(async () => {
    const overlay = overlayRef.current;
    const left = leftPanelRef.current;
    const right = rightPanelRef.current;
    const logoContainer = logoContainerRef.current;
    const svgPath = svgPathRef.current;
    const logoImg = logoImgRef.current;

    if (!overlay || !left || !right || !logoContainer || !pendingTheme) return;

    // Increment generation counter for abort/race prevention
    generationRef.current += 1;
    const myGeneration = generationRef.current;

    setCovering(false);

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(resolve, ms);
        const checkStale = () => {
          if (generationRef.current !== myGeneration) {
            clearTimeout(id);
            reject(new DOMException('superseded'));
          }
        };
        const mid = setTimeout(checkStale, ms / 2);
        setTimeout(() => clearTimeout(mid), ms);
      });

    // ── Semantic palette matching incoming theme ─────────────────────────────
    const goingDark = pendingTheme === 'dark';
    const panelBg = goingDark ? '#0C0C0C' : '#F3EEE5';
    left.style.background = panelBg;
    right.style.background = panelBg;

    // Show the overlay container
    overlay.style.display = 'block';
    overlay.style.pointerEvents = 'all';
    overlay.style.background = 'transparent';

    let themeWasApplied = false;

    try {
      if (reducedMotion.current) {
        // ── REDUCED MOTION: Clean instant crossfade ──────────────────────────
        overlay.style.background = panelBg;
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 70ms linear';
        void overlay.offsetHeight;
        overlay.style.opacity = '1';
        await sleep(90);

        setCovering(true);
        setTheme(pendingTheme);
        themeWasApplied = true;
        await sleep(60);

        setCovering(false);
        overlay.style.transition = 'opacity 90ms linear';
        overlay.style.opacity = '0';
        await sleep(100);
      } else {
        // ── FULL CINEMATIC PRELOADER-SIBLING SEQUENCE (~750ms) ───────────────

        // 1. Reset all elements to initial state (no transition)
        left.style.transition = 'none';
        right.style.transition = 'none';
        logoContainer.style.transition = 'none';
        if (svgPath) {
          svgPath.style.transition = 'none';
          svgPath.style.strokeDashoffset = `${PERIMETER_LENGTH}`;
          svgPath.style.fillOpacity = '0';
          svgPath.setAttribute('stroke-dashoffset', `${PERIMETER_LENGTH}`);
          svgPath.setAttribute('fill-opacity', '0');
        }
        if (logoImg) {
          logoImg.style.transition = 'none';
          logoImg.style.opacity = '0';
        }

        left.style.transform = 'translateX(-100%)';
        right.style.transform = 'translateX(100%)';
        logoContainer.style.opacity = '0';
        logoContainer.style.transform = 'translate(-50%, -50%) scale(0.92)';

        // Flush layout
        void overlay.offsetWidth;
        void overlay.offsetHeight;

        // ── BEAT 1: PANELS CLOSE (0 -> 250ms) ────────────────────────────────
        const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
        left.style.transition = `transform 250ms ${EASE}`;
        right.style.transition = `transform 250ms ${EASE}`;
        left.style.transform = 'translateX(0)';
        right.style.transform = 'translateX(0)';

        await sleep(250);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // Panels are now flush together. Set underlying overlay background to ensure
        // zero possible subpixel seam artifacts while covered.
        overlay.style.background = panelBg;

        // ── BEAT 2: NEXUS X FORMS / RESOLVES (250ms -> 430ms) ────────────────
        // Container enters with subtle scale settle
        logoContainer.style.transition = `opacity 90ms ease-out, transform 180ms ${EASE}`;
        logoContainer.style.opacity = '1';
        logoContainer.style.transform = 'translate(-50%, -50%) scale(1)';

        // SVG contour trace draws in (120ms) and fill resolves (130ms)
        if (svgPath) {
          svgPath.style.transition = `stroke-dashoffset 120ms ${EASE}, fill-opacity 130ms ease-out`;
          svgPath.style.strokeDashoffset = '0';
          svgPath.style.fillOpacity = '1';
          svgPath.setAttribute('stroke-dashoffset', '0');
          svgPath.setAttribute('fill-opacity', '1');
        }

        // At 120ms: SVG contour trace and fill are complete; resolve to authentic mark
        await sleep(120);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        if (logoImg) {
          logoImg.style.transition = 'opacity 60ms ease-out';
          logoImg.style.opacity = '1';
        }

        // Remainder of the 180ms formation window (60ms)
        await sleep(60);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // ── BEAT 3: THEME STATE CHANGES & X HOLDS (430ms -> 500ms) ───────────
        setCovering(true);
        setTheme(pendingTheme);
        themeWasApplied = true;

        // Hold the completed authentic X as the central seal (70ms)
        await sleep(70);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // ── BEAT 4: PANELS OPEN & NEW THEME REVEALED (500ms -> 750ms) ────────
        setCovering(false);
        overlay.style.background = 'transparent';

        left.style.transition = `transform 250ms ${EASE}`;
        right.style.transition = `transform 250ms ${EASE}`;
        left.style.transform = 'translateX(-100%)';
        right.style.transform = 'translateX(100%)';

        // X departs cleanly as panels split
        logoContainer.style.transition = 'opacity 90ms ease-in';
        logoContainer.style.opacity = '0';

        await sleep(250);
      }
    } catch {
      // Interrupted or superseded.
      if (generationRef.current === myGeneration && !themeWasApplied && pendingTheme) {
        setTheme(pendingTheme);
      }
    }

    // ── Cleanup ──────────────────────────────────────────────────────────────
    if (generationRef.current !== myGeneration) return;

    setCovering(false);
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'none';
    overlay.style.background = 'transparent';
    overlay.style.opacity = '';
    overlay.style.transition = '';

    logoContainer.style.transition = 'none';
    logoContainer.style.opacity = '0';
    logoContainer.style.transform = 'translate(-50%, -50%) scale(0.92)';

    onTransitionComplete();
  }, [pendingTheme, setTheme, onTransitionComplete]);

  useEffect(() => {
    if (isTransitioning && pendingTheme) {
      runTransition();
    }
  }, [isTransitioning, pendingTheme, runTransition]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
      setCovering(false);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'none',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/*
       * LEFT SHUTTER PANEL — flush left, width calc(50% + 2px)
       * translateX(-100%) -> translateX(0)
       */}
      <div
        ref={leftPanelRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'calc(50% + 2px)',
          height: '100%',
          borderRadius: 0,
          transform: 'translateX(-100%)',
          willChange: 'transform',
        }}
      />

      {/*
       * RIGHT SHUTTER PANEL — anchored at calc(50% - 2px), width calc(50% + 2px)
       * translateX(100%) -> translateX(0)
       * Overlaps left panel by 4px at center, eliminating subpixel gaps on any display.
       */}
      <div
        ref={rightPanelRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 2px)',
          width: 'calc(50% + 2px)',
          height: '100%',
          borderRadius: 0,
          transform: 'translateX(100%)',
          willChange: 'transform',
        }}
      />

      {/*
       * NEXUS X — Central Brand Mark
       * Exactly centered: left: 50%, top: 50%, transform: translate(-50%, -50%)
       * Uses the exact preloader SVG contour synthesis + authentic mark resolution.
       * Zero rotation, zero stretch, zero glow, zero blur, zero particles.
       */}
      <div
        ref={logoContainerRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0.92)',
          opacity: 0,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
          zIndex: 100,
          width: 'clamp(75px, 8.5vw, 110px)',
          height: 'clamp(71px, 8.1vw, 105px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* SVG Canonical Contour Tracing Layer */}
        <svg
          viewBox="0 0 512 488"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <path
            ref={svgPathRef}
            d={CANONICAL_PATH}
            fill="#F2613F"
            fillOpacity={0}
            stroke="#F2613F"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PERIMETER_LENGTH}
            strokeDashoffset={PERIMETER_LENGTH}
          />
        </svg>

        {/* Authentic NEXUS X Mark Asset */}
        <img
          ref={logoImgRef}
          src={X_LOGO_SRC}
          alt=""
          role="presentation"
          width={110}
          height={105}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
          onError={handleImageFallbackError}
        />
      </div>
    </div>
  );
};

export default CinematicThemeTransition;
