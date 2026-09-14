/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useCinematicTransition } from '../../context/CinematicTransitionContext.tsx';
import { resolveImageUrl, handleImageFallbackError } from '../../data/cloudinaryMap.ts';

const X_LOGO_SRC = resolveImageUrl('/images/logos/NEXUS-removebg-preview-1.png');

// Preload the X image in a module-level singleton so it is fetched once
// regardless of how many times the component remounts.
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

  const overlayRef    = useRef<HTMLDivElement>(null);
  const leftPanelRef  = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const logoRef       = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);
  // Each call to runTransition stamps a generation ID.
  // If a new call starts (abort scenario), the old one checks
  // generationRef.current !== myGeneration before calling onTransitionComplete.
  const generationRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // ── Helper: manage data-nexus-covering attribute ───────────────────────────
  // Suppresses CSS color transitions on the page while panels fully cover it.
  const setCovering = (active: boolean) => {
    if (active) {
      document.documentElement.setAttribute('data-nexus-covering', '');
    } else {
      document.documentElement.removeAttribute('data-nexus-covering');
    }
  };

  const runTransition = useCallback(async () => {
    const overlay = overlayRef.current;
    const left    = leftPanelRef.current;
    const right   = rightPanelRef.current;
    const logo    = logoRef.current;

    if (!overlay || !left || !right || !logo || !pendingTheme) return;

    // Increment generation counter — this call "owns" this generation ID.
    // Any previous in-flight call will see its generation is stale and bail.
    generationRef.current += 1;
    const myGeneration = generationRef.current;

    // Ensure covering attribute is cleared from any interrupted previous run
    setCovering(false);

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(resolve, ms);
        // Poll-free abort: check generation on each sleep boundary
        const checkStale = () => {
          if (generationRef.current !== myGeneration) {
            clearTimeout(id);
            reject(new DOMException('superseded'));
          }
        };
        // Schedule a check at the midpoint and end of each sleep
        const mid = setTimeout(checkStale, ms / 2);
        setTimeout(() => clearTimeout(mid), ms);
      });

    // ── NEXUS palette ────────────────────────────────────────────────────────
    const goingDark = pendingTheme === 'dark';
    left.style.background  = goingDark ? '#0C0C0C' : '#F3EEE5';
    right.style.background = goingDark ? '#481E14' : '#E8E2D6';

    // ── Motion constants ─────────────────────────────────────────────────────
    // Long, gentle ease-in-out: panels breathe in slowly, settle at center
    const EASE          = 'cubic-bezier(0.55, 0, 0.1, 1)';
    const PANEL_CLOSE   = 580; // ms — was 420ms
    const PANEL_OPEN    = 580; // ms — was 420ms
    const X_START_EARLY = 80;  // ms before close finishes that X starts appearing
    const X_FADE_IN     = 200; // ms — was 160ms
    const THEME_HOLD    = 180; // ms — was 140ms
    const X_FADE_OUT    = 150; // ms — was 120ms

    // Show the overlay container
    overlay.style.display       = 'block';
    overlay.style.pointerEvents = 'all';

    let themeWasApplied = false;

    try {
      if (reducedMotion.current) {
        // ── REDUCED MOTION ───────────────────────────────────────────────────
        // Instant cover → theme switch → instant uncover. No panel movement.
        overlay.style.background = goingDark ? '#0C0C0C' : '#F3EEE5';
        overlay.style.opacity    = '0';
        overlay.style.transition = 'opacity 80ms linear';
        void overlay.offsetHeight; // flush
        overlay.style.opacity = '1';
        await sleep(130);

        setCovering(true);
        setTheme(pendingTheme);
        themeWasApplied = true;
        await sleep(80);

        setCovering(false);
        overlay.style.transition = 'opacity 120ms linear';
        overlay.style.opacity    = '0';
        await sleep(130);

      } else {
        // ── FULL CINEMATIC PATH ──────────────────────────────────────────────

        // ── Reset all elements (no transition) ─────────────────────────────
        left.style.transition  = 'none';
        right.style.transition = 'none';
        logo.style.transition  = 'none';

        left.style.transform  = 'translateX(-100%)';
        right.style.transform = 'translateX(100%)';
        logo.style.opacity    = '0';
        logo.style.transform  = 'translate(-50%, -50%) scale(0.94)';

        // Two-phase flush: offsetWidth resets geometry, offsetHeight resets paint
        void overlay.offsetWidth;
        void overlay.offsetHeight;

        // ── BEAT 1 — CLOSE ─────────────────────────────────────────────────
        left.style.transition  = `transform ${PANEL_CLOSE}ms ${EASE}`;
        right.style.transition = `transform ${PANEL_CLOSE}ms ${EASE}`;
        left.style.transform   = 'translateX(0)';
        right.style.transform  = 'translateX(0)';

        // X begins appearing 40ms before panels fully land (continuous motion)
        await sleep(PANEL_CLOSE - X_START_EARLY);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        logo.style.transition = `opacity ${X_FADE_IN}ms ease-out, transform ${X_FADE_IN}ms ${EASE}`;
        logo.style.opacity    = '1';
        logo.style.transform  = 'translate(-50%, -50%) scale(1)';

        // Wait for panels to fully close (remaining overlap + one paint frame)
        await sleep(X_START_EARLY + 16);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // ── BEAT 2 — X SEAL + THEME SWITCH ─────────────────────────────────
        // Panels are now fully closed. Suppress page color transitions,
        // then apply the theme change — zero visible effect to the user.
        setCovering(true);
        setTheme(pendingTheme);
        themeWasApplied = true;

        // Hold: user sees NEXUS X as the "seal" between themes
        await sleep(THEME_HOLD);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // X retreats cleanly — opacity only, no scale shift on exit
        logo.style.transition = `opacity ${X_FADE_OUT}ms ease-in`;
        logo.style.opacity    = '0';

        await sleep(X_FADE_OUT);
        if (generationRef.current !== myGeneration) throw new DOMException('superseded');

        // Remove covering attribute just before panels start opening.
        // By this frame the theme is fully applied and all CSS vars resolved.
        setCovering(false);

        // ── BEAT 3 — OPEN ──────────────────────────────────────────────────
        left.style.transition  = `transform ${PANEL_OPEN}ms ${EASE}`;
        right.style.transition = `transform ${PANEL_OPEN}ms ${EASE}`;
        left.style.transform   = 'translateX(-100%)';
        right.style.transform  = 'translateX(100%)';

        await sleep(PANEL_OPEN + 16);
      }
    } catch {
      // Interrupted or superseded.
      // Only apply theme if this generation is still current and it hasn't been applied yet.
      if (generationRef.current === myGeneration && !themeWasApplied && pendingTheme) {
        setTheme(pendingTheme);
      }
    }

    // ── Cleanup — always runs, even after catch ──────────────────────────────
    // Only the current generation should reset shared overlay state.
    // A superseded call must NOT touch the overlay or call onTransitionComplete.
    if (generationRef.current !== myGeneration) return;

    // Ensure covering is removed even if we exited via catch
    setCovering(false);

    overlay.style.pointerEvents = 'none';
    overlay.style.display       = 'none';
    overlay.style.background    = 'transparent';
    overlay.style.opacity       = '';   // clear inline opacity (let CSS own it)
    overlay.style.transition    = '';   // clear inline transition

    logo.style.transition = 'none';
    logo.style.opacity    = '0';
    logo.style.transform  = 'translate(-50%, -50%) scale(0.94)';

    onTransitionComplete();
  }, [pendingTheme, setTheme, onTransitionComplete]);

  useEffect(() => {
    if (isTransitioning && pendingTheme) {
      runTransition();
    }
  }, [isTransitioning, pendingTheme, runTransition]);

  // Safety: if this component unmounts while a transition is running
  // (should never happen since it's at root, but defensive), clear covering.
  useEffect(() => {
    return () => {
      setCovering(false);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      // Initial styles — overlay is invisible and non-interactive at rest
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'none',
        background: 'transparent',
        // overflow: hidden ensures no panel edge bleeds outside the viewport.
        // Critical on mobile where 50% of a slightly-wider container could
        // otherwise produce a horizontal scrollbar.
        overflow: 'hidden',
      }}
    >
      {/*
       * LEFT PANEL — flush left, exactly 50vw
       * Anchored at left: 0 with width: 50%.
       * The fixed overlay's width equals 100vw, so 50% = exactly 50vw.
       * Slides in: translateX(-100%) → translateX(0)
       * Right edge is perfectly sharp — no border-radius, no blur.
       */}
      <div
        ref={leftPanelRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          borderRadius: 0,
          transform: 'translateX(-100%)',
          willChange: 'transform',
        }}
      />

      {/*
       * RIGHT PANEL — flush right, exactly 50vw
       * Anchored at right: 0 with width: 50%.
       * Slides in: translateX(100%) → translateX(0)
       * Left edge of this panel meets the right edge of the left panel
       * at 50vw — a mathematically exact seam.
       */}
      <div
        ref={rightPanelRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          borderRadius: 0,
          transform: 'translateX(100%)',
          willChange: 'transform',
        }}
      />

      {/*
       * NEXUS X — the visual seal at the panel seam
       *
       * left: 50%, top: 50%, translate(-50%, -50%) = mathematical viewport center.
       * zIndex: 1 — renders above both panels.
       * Appears via opacity + subtle scale (0.94 → 1).
       * Disappears via opacity only (clean, no bounce).
       */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0.94)',
          opacity: 0,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
          zIndex: 1,
          // Prevent any layout influence from this absolutely-positioned element
          lineHeight: 0,
        }}
      >
        <img
          src={X_LOGO_SRC}
          alt=""
          role="presentation"
          width={100}
          height={100}
          style={{
            width: 'clamp(60px, 7.5vw, 100px)',
            height: 'clamp(60px, 7.5vw, 100px)',
            display: 'block',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
          onError={handleImageFallbackError}
        />
      </div>
    </div>
  );
};

export default CinematicThemeTransition;
