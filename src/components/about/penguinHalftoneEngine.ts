/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * penguinHalftoneEngine.ts
 *
 * Halftone Penguin Carousel & Story Visual Engine
 * Advanced Physics-Based Locomotion & Articulated Body Deformation
 *
 * Core Hierarchy:
 * PHYSICS -> BODY TRANSFORM -> ARTICULATED POSE -> WALK CYCLE -> HALFTONE DEFORMATION -> TINY LOCAL DOT MOTION
 *
 * Guarantees:
 * - Stable Point Correspondence: Points maintain fixed identities across all chapters.
 * - Material Attachment: Dots behave like ink/material on the penguin's body; never loose particles.
 * - Physically Coherent Walking: Articulated 2D body with alternating foot contacts, weight compression,
 *   head stabilization, and body waddling.
 * - Continuous Descending Journey: Moves along a gentle drifting path on the right side of the sticky story stage.
 * - Subdued Screenprint Aesthetics: Clean charcoal dots, cream belly stipple, warm orange accents (<2%),
 *   fine horizontal dashes, and pure white eye glint. Zero glow, neon, or floating clouds.
 */

import {
  PenguinPhysicsSimulation,
  PENGUIN_PHYSICS_CONFIG,
  evaluateTargetTrajectory,
} from './PenguinPhysics.ts';

export type AnatomicalZone =
  | 'HEAD'
  | 'BEAK'
  | 'EYE'
  | 'CHEST'
  | 'BELLY'
  | 'LEFT_FLIPPER'
  | 'RIGHT_FLIPPER'
  | 'TORSO'
  | 'LEFT_FOOT'
  | 'RIGHT_FOOT';

export interface HalftonePoint {
  id: number;
  baseX: number;
  baseY: number;
  normX: number;
  normY: number;
  x: number;
  y: number;
  currLocalX: number;
  currLocalY: number;
  targetLocalX: number;
  targetLocalY: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  phase: number;
  color: string;
  isLineSegment: boolean;
  lineWidth: number;
  zone: AnatomicalZone;
  densityZone: 'CORE' | 'MID' | 'EDGE';
  isAccentCandidate?: boolean;
}

export interface PenguinEngineConfig {
  width: number;
  height: number;
  dpr?: number;
  pointSpacing?: number;
}

export interface SlidePoseDefinition {
  index: number;
  name: string;
  progress: number;
}

export const SLIDE_POSES: SlidePoseDefinition[] = [
  { index: 0, name: 'SLIDE_01_POISED', progress: 0.0 },
  { index: 1, name: 'SLIDE_02_INQUISITIVE', progress: 0.2 },
  { index: 2, name: 'SLIDE_03_ACTIVE', progress: 0.4 },
  { index: 3, name: 'SLIDE_04_TRANSIT', progress: 0.6 },
  { index: 4, name: 'SLIDE_05_SETTLED', progress: 1.0 },
];

/**
 * Draws the high-resolution anatomical silhouette mask onto an offscreen canvas.
 */
function renderAnatomicalMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.save();

  const cx = width * 0.5;
  const cy = height * 0.5;
  ctx.translate(cx, cy);

  const padX = width * 0.14;
  const padY = height * 0.12;
  const targetW = width - padX * 2;
  const targetH = height - padY * 2;
  const scale = Math.min(targetW / 380, targetH / 500) * 0.86;
  ctx.scale(scale, scale);

  // 1. FEET (Base grounding)
  ctx.fillStyle = '#EF5A2A';
  // Left foot
  ctx.beginPath();
  ctx.ellipse(-48, 175, 40, 15, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(38, 178, 42, 16, 0.18, 0, Math.PI * 2);
  ctx.fill();

  // 2. MAIN COAT / BODY SILHOUETTE
  ctx.fillStyle = '#0A0A09';
  ctx.beginPath();
  ctx.moveTo(0, -165); // Crown of head
  ctx.bezierCurveTo(46, -165, 68, -130, 68, -95); // Head right
  ctx.bezierCurveTo(68, -60, 52, -30, 62, 0); // Neck right into shoulder
  ctx.bezierCurveTo(74, 30, 102, 90, 94, 140); // Torso right lower
  ctx.bezierCurveTo(86, 172, 45, 175, 0, 175); // Bottom base
  ctx.bezierCurveTo(-45, 175, -86, 172, -94, 140); // Bottom left
  ctx.bezierCurveTo(-102, 90, -74, 30, -62, 0); // Torso left into shoulder
  ctx.bezierCurveTo(-52, -30, -68, -60, -68, -95); // Neck left
  ctx.bezierCurveTo(-68, -130, -46, -165, 0, -165); // Back to crown
  ctx.closePath();
  ctx.fill();

  // 3. FLIPPERS
  // Left flipper
  ctx.beginPath();
  ctx.moveTo(-60, -20);
  ctx.bezierCurveTo(-82, 10, -96, 70, -82, 125);
  ctx.bezierCurveTo(-76, 132, -66, 120, -64, 90);
  ctx.bezierCurveTo(-62, 60, -55, 20, -58, -20);
  ctx.closePath();
  ctx.fill();

  // Right flipper
  ctx.beginPath();
  ctx.moveTo(60, -20);
  ctx.bezierCurveTo(82, 10, 98, 70, 84, 125);
  ctx.bezierCurveTo(78, 132, 68, 120, 66, 90);
  ctx.bezierCurveTo(64, 60, 57, 20, 60, -20);
  ctx.closePath();
  ctx.fill();

  // 4. BEAK (NEXUS Orange)
  ctx.fillStyle = '#EF5A2A';
  ctx.beginPath();
  ctx.moveTo(-45, -126); // Base top
  ctx.lineTo(-92, -114); // Sharp tip pointing forward-left
  ctx.lineTo(-44, -106); // Base bottom
  ctx.bezierCurveTo(-38, -116, -38, -120, -45, -126);
  ctx.closePath();
  ctx.fill();

  // 5. BELLY & CHEST (Cream / Stipple zone)
  ctx.fillStyle = '#EDE7DD';
  ctx.beginPath();
  ctx.ellipse(-2, 38, 48, 104, 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 6. EYE (Pure White Glint)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-34, -142, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Classifies a point into an anatomical zone based on mask position.
 */
function classifyAnatomicalZone(
  sampleX: number,
  sampleY: number,
  cx: number,
  cy: number,
  scale: number,
  isOrange: boolean,
  isBelly: boolean,
  isEye: boolean
): AnatomicalZone {
  const normX = (sampleX - cx) / scale;
  const normY = (sampleY - cy) / scale;

  if (isEye) return 'EYE';
  if (isOrange && normY < -80 && normX < -30) return 'BEAK';
  if (normY >= 168) {
    return normX < 0 ? 'LEFT_FOOT' : 'RIGHT_FOOT';
  }
  if (normX < -65 && normY >= -40 && normY <= 130) return 'LEFT_FLIPPER';
  if (normX > 55 && normY >= -35 && normY <= 140) return 'RIGHT_FLIPPER';
  if (normY < -65) return 'HEAD';
  if (isBelly) return normY < 40 ? 'CHEST' : 'BELLY';
  if (normY < 40) return 'CHEST';
  return 'TORSO';
}

/**
 * Generates the clean halftone point cloud with stable IDs and uniform density.
 */
export function generateHalftonePointCloud(
  config: PenguinEngineConfig
): HalftonePoint[] {
  const { width, height } = config;
  if (width <= 0 || height <= 0) return [];

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(100, Math.floor(width));
  offscreen.height = Math.max(100, Math.floor(height));
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return [];

  renderAnatomicalMask(offCtx, offscreen.width, offscreen.height);

  const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
  const data = imgData.data;

  const padX = width * 0.14;
  const padY = height * 0.12;
  const targetW = width - padX * 2;
  const targetH = height - padY * 2;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const scale = Math.min(targetW / 380, targetH / 500) * 0.86;

  const spacing = config.pointSpacing || (width < 500 ? 4.0 : 3.4);
  const points: HalftonePoint[] = [];

  let seed = 1337;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const getPixel = (px: number, py: number) => {
    if (px < 0 || px >= offscreen.width || py < 0 || py >= offscreen.height) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const idx = (py * offscreen.width + px) * 4;
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
    };
  };

  for (let y = 0; y < offscreen.height; y += spacing) {
    for (let x = 0; x < offscreen.width; x += spacing) {
      const jitterX = (random() - 0.5) * spacing * 0.42;
      const jitterY = (random() - 0.5) * spacing * 0.42;
      const sampleX = Math.round(x + jitterX);
      const sampleY = Math.round(y + jitterY);

      const p = getPixel(sampleX, sampleY);
      if (p.a < 22) continue;

      const isOrangeBeakOrFeet = p.r > 200 && p.g > 65 && p.b < 75;
      const isBellyCream = p.r > 220 && p.g > 220 && p.b > 210;
      const isEyeWhite = p.r > 245 && p.g > 245 && p.b > 245;

      let neighborCount = 0;
      const checkDist = Math.round(spacing * 1.3);
      for (let dy = -checkDist; dy <= checkDist; dy += checkDist) {
        for (let dx = -checkDist; dx <= checkDist; dx += checkDist) {
          if (getPixel(sampleX + dx, sampleY + dy).a > 25) {
            neighborCount++;
          }
        }
      }

      let densityZone: 'CORE' | 'MID' | 'EDGE' = 'MID';
      if (neighborCount >= 7) {
        densityZone = 'CORE';
      } else if (neighborCount <= 4) {
        densityZone = 'EDGE';
      }

      if (densityZone === 'EDGE' && random() > 0.48) {
        continue;
      }

      let radius: number;
      let opacity: number;
      let color = '#0A0A09';

      if (densityZone === 'CORE') {
        radius = 1.4 + (random() - 0.5) * 0.25;
        opacity = 0.95;
      } else if (densityZone === 'MID') {
        radius = 1.2 + (random() - 0.5) * 0.2;
        opacity = 0.88;
      } else {
        radius = 0.95 + (random() - 0.5) * 0.18;
        opacity = 0.72;
      }

      if (isOrangeBeakOrFeet) {
        if (random() < 0.35) {
          color = '#EF5A2A';
          radius = 1.25 + random() * 0.35;
          opacity = 0.95;
        } else {
          color = '#151311';
        }
      } else if (isBellyCream) {
        if (random() > 0.48) continue;
        radius = 0.85 + random() * 0.3;
        opacity = 0.42 + random() * 0.15;
        color = '#25221F';
      } else if (isEyeWhite) {
        radius = 1.4;
        opacity = 1.0;
        color = '#FFFFFF';
      }

      const isLineSegment =
        !isEyeWhite && !isBellyCream && densityZone !== 'EDGE' && random() < 0.06;
      const lineWidth = isLineSegment ? 3.2 + random() * 2.8 : 0;

      const zone = classifyAnatomicalZone(
        sampleX,
        sampleY,
        cx,
        cy,
        scale,
        isOrangeBeakOrFeet,
        isBellyCream,
        isEyeWhite
      );

      const normX = (sampleX - cx) / (scale * 120);
      const normY = (sampleY - cy) / (scale * 200);

      const isAccentCandidate =
        !isEyeWhite && !isBellyCream && !isOrangeBeakOrFeet && random() < 0.02;

      points.push({
        id: points.length,
        baseX: sampleX,
        baseY: sampleY,
        normX,
        normY,
        x: sampleX,
        y: sampleY,
        currLocalX: 0,
        currLocalY: 0,
        targetLocalX: 0,
        targetLocalY: 0,
        radius: Math.max(0.7, radius),
        opacity,
        baseOpacity: opacity,
        phase: normY * 2.0 + normX * 1.5,
        color,
        isLineSegment,
        lineWidth,
        zone,
        densityZone,
        isAccentCandidate,
      });
    }
  }

  return points;
}

export interface PenguinMouseInteraction {
  x: number;
  y: number;
  active: boolean;
}

/**
 * CarouselPenguinDirector
 * Bridges React props (activeSlide, scrollProgress) to the continuous physics simulation.
 */
export class CarouselPenguinDirector {
  public physics: PenguinPhysicsSimulation;
  public activeSlide: number = 0;
  public smoothDragInfluence: number = 0;

  constructor(initialSlide: number = 0) {
    this.physics = new PenguinPhysicsSimulation();
    this.activeSlide = initialSlide;
    const pose = SLIDE_POSES[initialSlide] || SLIDE_POSES[0];
    this.physics.setScrollProgress(pose.progress);
  }

  public setSlide(slideIndex: number, _now?: number): void {
    this.activeSlide = Math.max(0, Math.min(4, slideIndex));
    const pose = SLIDE_POSES[this.activeSlide] || SLIDE_POSES[0];
    this.physics.setScrollProgress(pose.progress);
  }

  public setScrollProgress(progress: number): void {
    this.physics.setScrollProgress(progress);
    this.activeSlide = Math.min(4, Math.max(0, Math.floor(progress * 5)));
  }

  public update(
    dt: number,
    dragInput: number,
    reducedMotion: boolean,
    mouseState?: PenguinMouseInteraction,
    width?: number,
    height?: number
  ): void {
    this.smoothDragInfluence +=
      (dragInput - this.smoothDragInfluence) * Math.min(1, dt * 8);

    this.physics.update(dt, reducedMotion, mouseState, width, height);
  }
}

/**
 * Updates and renders the halftone penguin using articulated body deformation.
 *
 * Hierarchy:
 * PHYSICS -> BODY TRANSFORM -> ARTICULATED POSE -> WALK CYCLE -> HALFTONE DEFORMATION -> TINY LOCAL DOT MOTION
 */
export function updateAndDrawCarouselPenguin(
  ctx: CanvasRenderingContext2D,
  points: HalftonePoint[],
  director: CarouselPenguinDirector,
  _currentTime: number,
  dt: number,
  width: number,
  height: number,
  dragInput: number,
  reducedMotion: boolean,
  mouseState?: PenguinMouseInteraction
): void {
  director.update(dt, dragInput, reducedMotion, mouseState, width, height);

  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;

  const padX = width * 0.14;
  const padY = height * 0.12;
  const targetW = width - padX * 2;
  const targetH = height - padY * 2;
  const scale = Math.min(targetW / 380, targetH / 500) * 0.86;

  const s = director.physics.state;

  // Body center in canvas pixel coordinates
  const bodyCenterX = s.torsoX * width + director.smoothDragInfluence * 8.0;
  const bodyCenterY = s.torsoY * height;
  const torsoAngle = s.torsoAngle + director.smoothDragInfluence * 0.02;

  // Precompute trigonometric values for body rotation
  const cosTorso = Math.cos(torsoAngle);
  const sinTorso = Math.sin(torsoAngle);

  // Feet offsets in canvas pixels
  const leftFootStridePx = (s.leftFootX - s.rootX) * width;
  const rightFootStridePx = (s.rightFootX - s.rootX) * width;
  const leftFootLiftPx = s.leftFootLift * height;
  const rightFootLiftPx = s.rightFootLift * height;

  // Head stabilization angle & gaze bias
  const headAngle = s.headAngle;
  const cosHead = Math.cos(headAngle);
  const sinHead = Math.sin(headAngle);

  // Flipper angles
  const leftFlipperAngle = s.leftFlipperAngle;
  const rightFlipperAngle = s.rightFlipperAngle;

  // High-performance batched drawing groups (reduces thousands of draw calls to ~5)
  const charcoalCore: HalftonePoint[] = [];
  const charcoalEdge: HalftonePoint[] = [];
  const orangeDots: HalftonePoint[] = [];
  const bellyDots: HalftonePoint[] = [];
  const eyeDots: HalftonePoint[] = [];
  const dashes: HalftonePoint[] = [];

  const lerpSpeed = 1 - Math.exp(-dt * 16.0);
  const skinMaxDisp = PENGUIN_PHYSICS_CONFIG.maxSkinDisplacement;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];

    // Base point relative to anatomical center (cx, cy)
    const relBaseX = pt.baseX - cx;
    const relBaseY = pt.baseY - cy;

    let targetDx = 0;
    let targetDy = 0;

    // 1. Articulated anatomical deformation
    if (pt.zone === 'LEFT_FOOT') {
      targetDx = leftFootStridePx;
      targetDy = -leftFootLiftPx;
    } else if (pt.zone === 'RIGHT_FOOT') {
      targetDx = rightFootStridePx;
      targetDy = -rightFootLiftPx;
    } else if (pt.zone === 'HEAD' || pt.zone === 'BEAK' || pt.zone === 'EYE') {
      // Rotate around neck anchor (-90 * scale)
      const neckY = -90 * scale;
      const dyFromNeck = relBaseY - neckY;
      targetDx = relBaseX * (cosHead - 1) - dyFromNeck * sinHead;
      targetDy = relBaseX * sinHead + dyFromNeck * (cosHead - 1);
    } else if (pt.zone === 'LEFT_FLIPPER') {
      // Rotate around left shoulder (-60 * scale, -20 * scale)
      const shX = -60 * scale;
      const shY = -20 * scale;
      const dxFromSh = relBaseX - shX;
      const dyFromSh = relBaseY - shY;
      targetDx = dxFromSh * (Math.cos(leftFlipperAngle) - 1) - dyFromSh * Math.sin(leftFlipperAngle);
      targetDy = dxFromSh * Math.sin(leftFlipperAngle) + dyFromSh * (Math.cos(leftFlipperAngle) - 1);
    } else if (pt.zone === 'RIGHT_FLIPPER') {
      // Rotate around right shoulder (60 * scale, -20 * scale)
      const shX = 60 * scale;
      const shY = -20 * scale;
      const dxFromSh = relBaseX - shX;
      const dyFromSh = relBaseY - shY;
      targetDx = dxFromSh * (Math.cos(rightFlipperAngle) - 1) - dyFromSh * Math.sin(rightFlipperAngle);
      targetDy = dxFromSh * Math.sin(rightFlipperAngle) + dyFromSh * (Math.cos(rightFlipperAngle) - 1);
    } else if (pt.zone === 'BELLY' || pt.zone === 'CHEST') {
      // Subtle breath expansion
      const breathExpand = Math.sin(s.breathPhase) * 1.0;
      targetDx = pt.normX * breathExpand;
    }

    // 2. Damped local dot elasticity (organic ink on skin)
    pt.currLocalX += (targetDx - pt.currLocalX) * lerpSpeed;
    pt.currLocalY += (targetDy - pt.currLocalY) * lerpSpeed;

    // Smooth displacement boundaries (limbs have natural reach; skin is gently bounded)
    const isArticulated =
      pt.zone === 'LEFT_FOOT' ||
      pt.zone === 'RIGHT_FOOT' ||
      pt.zone === 'HEAD' ||
      pt.zone === 'BEAK' ||
      pt.zone === 'EYE' ||
      pt.zone === 'LEFT_FLIPPER' ||
      pt.zone === 'RIGHT_FLIPPER';
    const maxDisp = isArticulated ? 26.0 : skinMaxDisp;
    const maxDispSq = maxDisp * maxDisp;

    const dispSq = pt.currLocalX * pt.currLocalX + pt.currLocalY * pt.currLocalY;
    if (dispSq > maxDispSq) {
      const d = Math.sqrt(dispSq);
      pt.currLocalX = (pt.currLocalX / d) * maxDisp;
      pt.currLocalY = (pt.currLocalY / d) * maxDisp;
    }

    // 3. Body transform to canvas world coordinates with 3D turning interpolation
    const localX = (relBaseX + pt.currLocalX) * s.facingScale;
    const localY = relBaseY + pt.currLocalY;

    pt.x = bodyCenterX + (localX * cosTorso - localY * sinTorso);
    pt.y = bodyCenterY + (localX * sinTorso + localY * cosTorso);

    // 4. Pointer proximity disturbance (gentle elastic deflection within radius)
    if (mouseState?.active && !reducedMotion) {
      const mdx = pt.x - mouseState.x;
      const mdy = pt.y - mouseState.y;
      const mdistSq = mdx * mdx + mdy * mdy;
      const maxProximity = PENGUIN_PHYSICS_CONFIG.pointerRadius;
      if (mdistSq < maxProximity * maxProximity && mdistSq > 0.05) {
        const mdist = Math.sqrt(mdistSq);
        const normDist = 1 - mdist / maxProximity;
        const shiftStrength = normDist * normDist * PENGUIN_PHYSICS_CONFIG.pointerForce;
        pt.x += (mdx / mdist) * shiftStrength;
        pt.y += (mdy / mdist) * shiftStrength;
      }
    }

    // 5. Batch grouping for single-pass hardware accelerated drawing
    if (pt.isLineSegment) {
      dashes.push(pt);
    } else if (pt.color === '#EF5A2A') {
      orangeDots.push(pt);
    } else if (pt.color === '#FFFFFF') {
      // Natural eye blinking: when blinking, the eye glint closes
      if (!s.isBlinking) {
        eyeDots.push(pt);
      }
    } else if (pt.zone === 'BELLY' || pt.zone === 'CHEST') {
      bellyDots.push(pt);
    } else {
      if (pt.isAccentCandidate && s.walkIntensity > 0.4) {
        orangeDots.push(pt);
      } else if (pt.opacity >= 0.85) {
        charcoalCore.push(pt);
      } else {
        charcoalEdge.push(pt);
      }
    }
  }

  // --- BATCHED GPU RENDERING: 5-6 Calls Total (Zero Stutter / 60+ FPS) ---

  // Layer 1: Charcoal Core Body Silhouette
  if (charcoalCore.length > 0) {
    ctx.fillStyle = '#0A0A09';
    ctx.globalAlpha = 0.94;
    ctx.beginPath();
    for (let i = 0; i < charcoalCore.length; i++) {
      const pt = charcoalCore[i];
      ctx.moveTo(pt.x + pt.radius, pt.y);
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 2: Charcoal Edge Feathering
  if (charcoalEdge.length > 0) {
    ctx.fillStyle = '#0A0A09';
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    for (let i = 0; i < charcoalEdge.length; i++) {
      const pt = charcoalEdge[i];
      ctx.moveTo(pt.x + pt.radius, pt.y);
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 3: Belly Cream Stipple
  if (bellyDots.length > 0) {
    ctx.fillStyle = '#22201D';
    ctx.globalAlpha = 0.52;
    ctx.beginPath();
    for (let i = 0; i < bellyDots.length; i++) {
      const pt = bellyDots[i];
      ctx.moveTo(pt.x + pt.radius * 0.9, pt.y);
      ctx.arc(pt.x, pt.y, pt.radius * 0.9, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 4: Orange Accents (Beak, Feet, Warm Transit Specks)
  if (orangeDots.length > 0) {
    ctx.fillStyle = '#EF5A2A';
    ctx.globalAlpha = 0.96;
    ctx.beginPath();
    for (let i = 0; i < orangeDots.length; i++) {
      const pt = orangeDots[i];
      ctx.moveTo(pt.x + pt.radius * 1.08, pt.y);
      ctx.arc(pt.x, pt.y, pt.radius * 1.08, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 5: Pure White Eye Glint
  if (eyeDots.length > 0) {
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    for (let i = 0; i < eyeDots.length; i++) {
      const pt = eyeDots[i];
      ctx.moveTo(pt.x + pt.radius, pt.y);
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Layer 6: Fine Screenprint Horizontal Dashes (scaled with 3D perspective)
  if (dashes.length > 0) {
    ctx.strokeStyle = '#0A0A09';
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    const facingFactor = Math.max(0.1, Math.abs(s.facingScale));
    for (let i = 0; i < dashes.length; i++) {
      const pt = dashes[i];
      const hw = pt.lineWidth * 0.5 * facingFactor;
      ctx.moveTo(pt.x - hw, pt.y);
      ctx.lineTo(pt.x + hw, pt.y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // Optional physics debug overlay
  director.physics.drawDebug(ctx, width, height);
}
