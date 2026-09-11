/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppRoute } from '../../types.ts';

export type PenguinPoseType = 'poised' | 'inquisitive' | 'active' | 'transit' | 'settled';

export interface PenguinPoseConfig {
  offsetX: number;     // px relative to center
  offsetY: number;     // px relative to center
  scale: number;       // relative scale
  rotation: number;    // subtle angle in radians
  poseType: PenguinPoseType;
  caption?: string;    // quiet label e.g. "FIG. 01 — POISED"
}

export interface AboutSlideData {
  id: string;
  chapterNumber: string; // e.g. "01"
  chapterTotal: string;  // e.g. "05"
  label: string;         // e.g. "WHY NEXUS EXISTS"
  headlineLines: string[]; // e.g. ["GOOD IDEAS", "SHOULDN'T", "STAY IDEAS."]
  leadText?: string;     // e.g. primary paragraph
  rhythmicLines?: string[]; // e.g. compact rhythmic lines
  secondaryText?: string; // secondary paragraph
  ctaLabel?: string;     // "JOIN NEXUS →"
  ctaAction?: AppRoute;
  penguinPose: PenguinPoseConfig;
}

export interface AboutCarouselProps {
  onRouteChange?: (route: AppRoute) => void;
  className?: string;
}
