/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface NexusFormationXProps {
  progress: number;
}

/**
 * Exact canonical closed-polygon path for the authentic NEXUS X geometry (512 x 488).
 * Derived directly from /images/logos/NEXUS-removebg-preview-1.png
 */
const CANONICAL_PATH =
  'M 0 0 H 153.8 L 381.8 448.5 H 447.5 L 304.4 167 L 454.9 0 H 510.6 L 352.6 174.8 L 511.1 487 H 357.2 L 129.2 38.5 H 63.5 L 206.6 320 L 56.1 487 H 0.4 L 158.4 312.1 Z';

// Mathematical perimeter length of the authentic polygon
const PERIMETER_LENGTH = 3809;

// Viewport-aware lateral starting distance for NE and US wings
const LATERAL_START_VW = 36;

/**
 * Pure Editorial NEXUS X Tracing & Lovelo Convergence Component:
 * - 0–15%: Clean atmospheric background settles; no X visible.
 * - 15–55%: X is actively traced via continuous physical stroke-dashoffset animation.
 * - 55–68%: Remaining geometry completes; solid brand #F2613F fill smoothly reveals.
 * - 68–75%: Trace seamlessly resolves into the authentic final asset (/logo/NEXUS-removebg-preview.png).
 * - 75–98%: "NE" (from LEFT) and "US" (from RIGHT) in Lovelo font converge symmetrically toward the stationary X anchor.
 * - 98–100%: Final NEXUS identity locks into place.
 *
 * Absolute visual purity: No percentage counters, no spinners, no technical dashboard HUD text.
 */
export const NexusFormationX: React.FC<NexusFormationXProps> = ({ progress }) => {
  // 1. Continuous SVG Physical Tracing (15% -> 55%)
  let strokeDashoffset = PERIMETER_LENGTH;
  let strokeOpacity = 0;

  if (progress >= 15 && progress < 55) {
    const t = (progress - 15) / 40; // 0 to 1 over the 15-55% window
    strokeDashoffset = PERIMETER_LENGTH * (1 - t);
    strokeOpacity = Math.min(1.0, t * 1.8);
  } else if (progress >= 55 && progress < 68) {
    strokeDashoffset = 0;
    strokeOpacity = 1.0;
  } else if (progress >= 68 && progress < 75) {
    strokeDashoffset = 0;
    strokeOpacity = Math.max(0, 1.0 - (progress - 68) / 7);
  }

  // 2. Solid Fill Reveal (55% -> 68%)
  let fillOpacity = 0;
  if (progress >= 55 && progress < 68) {
    fillOpacity = (progress - 55) / 13;
  } else if (progress >= 68 && progress < 75) {
    fillOpacity = Math.max(0, 1.0 - (progress - 68) / 7);
  }

  // 3. Authentic Final Asset Reveal (/logo/NEXUS-removebg-preview.png) (68% -> 100%)
  let authenticAssetOpacity = 0;
  if (progress >= 68 && progress < 75) {
    authenticAssetOpacity = (progress - 68) / 7;
  } else if (progress >= 75) {
    authenticAssetOpacity = 1.0;
  }

  // 4. Lovelo NE + US Lateral Convergence (75% -> 100%)
  let neTranslateVw = -LATERAL_START_VW;
  let usTranslateVw = LATERAL_START_VW;
  let wingsOpacity = 0;

  if (progress >= 75) {
    // Smooth entry fade
    if (progress < 82) {
      wingsOpacity = (progress - 75) / 7;
    } else {
      wingsOpacity = 1.0;
    }

    if (progress >= 98) {
      // 98-100%: Locked into final NEXUS identity
      neTranslateVw = 0;
      usTranslateVw = 0;
    } else {
      // 75% to 98%: Normalized timeline [0 .. 1]
      const t = (progress - 75) / (98 - 75);

      // S-Curve quintic smootherstep: slow start -> smooth cruise -> controlled docking
      const ease = t * t * t * (t * (t * 6 - 15) + 10);

      const currentOffsetVw = LATERAL_START_VW * (1 - ease);
      neTranslateVw = -currentOffsetVw;
      usTranslateVw = currentOffsetVw;
    }
  }

  return (
    <div
      id="nexus-formation-root"
      className="relative flex items-center justify-center select-none"
      style={{
        opacity: progress < 15 ? 0 : 1,
        transition: 'opacity 200ms ease-out',
      }}
    >
      {/* Left Wing: "NE" in Lovelo font approaching smoothly from the left side of the viewport */}
      <div
        id="nexus-wordmark-ne"
        aria-hidden="true"
        className="absolute right-full mr-3 sm:mr-4 md:mr-5 flex items-center justify-end pointer-events-none select-none will-change-transform"
        style={{
          transform: `translateX(${neTranslateVw}vw)`,
          opacity: wingsOpacity,
        }}
      >
        <span className="font-lovelo font-bold uppercase text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-[0.08em] leading-none">
          NE
        </span>
      </div>

      {/* MATHEMATICAL CENTER ANCHOR: The X (100% stationary and centered) */}
      <div
        id="nexus-preloader-x-anchor"
        className="relative flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 aspect-[512/488] shrink-0"
      >
        {/* SVG Physical Tracing Layer (Active 15% -> 75%) */}
        {progress < 75 && (
          <svg
            viewBox="0 0 512 488"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Traced contour stroke & progressive solid fill */}
            <path
              d={CANONICAL_PATH}
              fill="#F2613F"
              fillOpacity={fillOpacity}
              stroke="#F2613F"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={PERIMETER_LENGTH}
              strokeDashoffset={strokeDashoffset}
              strokeOpacity={strokeOpacity}
            />
          </svg>
        )}

        {/* Authentic Final NEXUS X Asset (/logo/NEXUS-removebg-preview.png) (Reveals 68% -> 75%, locked 75% -> 100%) */}
        {progress >= 68 && (
          <img
            src="/logo/NEXUS-removebg-preview.png"
            alt="NEXUS X"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{
              opacity: authenticAssetOpacity,
            }}
            loading="eager"
            decoding="async"
          />
        )}
      </div>

      {/* Right Wing: "US" in Lovelo font approaching smoothly from the right side of the viewport */}
      <div
        id="nexus-wordmark-us"
        aria-hidden="true"
        className="absolute left-full ml-3 sm:ml-4 md:ml-5 flex items-center justify-start pointer-events-none select-none will-change-transform"
        style={{
          transform: `translateX(${usTranslateVw}vw)`,
          opacity: wingsOpacity,
        }}
      >
        <span className="font-lovelo font-bold uppercase text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-[0.08em] leading-none">
          US
        </span>
      </div>
    </div>
  );
};
