/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  parseAsciiPenguinParticles,
  AsciiGlyphParticle,
} from './asciiPenguinData.ts';

export interface AsciiWalkState {
  time: number;
  torsoSway: number; // Subtle micro-tilt (radians)
  torsoPitch: number; // Micro pitch
  torsoYaw: number; // Micro yaw
  torsoShiftX: number; // Micro lateral shift
  torsoBobY: number; // Breathing micro-bob
  headAngle: number; // Snappy cursor gaze angle
  headPitch: number; // Snappy cursor pitch angle
  leftFlipperAngle: number;
  leftFlipperSpread: number;
  rightFlipperAngle: number;
  rightFlipperSpread: number;
}

export interface AsciiEngineOptions {
  stationary?: boolean; // When true, stays still with pristine silhouette and snappy cursor interaction
}

/**
 * AsciiTextWalkingEngine
 *
 * Pristine ASCII Silhouette Engine with Snappy Cursor Reactivity:
 * - Preserves complete visual integrity and crisp monospace character grid
 * - Subtle, organic idle breathing
 * - Snappy, responsive 2-Axis cursor gaze tracking (head & eye line follow cursor)
 * - Snappy interactive flipper micro-reaction on hover / pointer movement
 * - Stable, high-precision ground contact shadows
 * - Vibrant orange monospace rendering
 */
export class AsciiTextWalkingEngine {
  private particles: AsciiGlyphParticle[] = [];
  private totalRows: number = 44;
  private totalCols: number = 84;
  private animTime: number = 0;
  private isPaused: boolean = false;
  private lastCanvasWidth: number = 0;
  private stationary: boolean = true;

  // Snappy Interactive Cursor & Gaze Physics
  private targetGazeX: number = 0; // -1 .. +1
  private targetGazeY: number = 0; // -1 .. +1
  private smoothGazeX: number = 0;
  private smoothGazeY: number = 0;
  private gazeVelocityX: number = 0;
  private gazeVelocityY: number = 0;

  // Snappy Hover & Micro-Alert State
  private isHovered: boolean = false;
  private hoverAlertStrength: number = 0;
  private clickImpulse: number = 0;

  public state: AsciiWalkState = {
    time: 0,
    torsoSway: 0,
    torsoPitch: 0,
    torsoYaw: 0,
    torsoShiftX: 0,
    torsoBobY: 0,
    headAngle: 0,
    headPitch: 0,
    leftFlipperAngle: 0,
    leftFlipperSpread: 0,
    rightFlipperAngle: 0,
    rightFlipperSpread: 0,
  };

  constructor(options?: AsciiEngineOptions) {
    const data = parseAsciiPenguinParticles();
    this.particles = data.particles;
    this.totalRows = data.totalRows;
    this.totalCols = data.totalCols;
    this.stationary = options?.stationary !== undefined ? options.stationary : true;
  }

  /**
   * Snappy pointer gaze update (-1 to +1 from canvas center)
   */
  public setTargetGaze(x: number, y: number, hovered: boolean = false): void {
    this.targetGazeX = Math.max(-1.2, Math.min(1.2, x));
    this.targetGazeY = Math.max(-1.2, Math.min(1.2, y));
    this.isHovered = hovered;
  }

  /**
   * Trigger a snappy micro-impulse on click
   */
  public triggerClickImpulse(): void {
    this.clickImpulse = 1.0;
  }

  /**
   * Advances the physics simulation by dt seconds with snappy spring dynamics.
   */
  public update(dt: number, stageWidth?: number): void {
    if (this.isPaused) return;

    this.animTime += dt;
    const t = this.animTime;

    // --- 1. SNAPPY HIGH-RESPONSIVENESS SPRING GAZE TRACKING ---
    // Fast, crisp spring physics for immediate cursor tracking without sluggish lag
    const springTension = 140;
    const damping = 16;

    const forceX = (this.targetGazeX - this.smoothGazeX) * springTension - this.gazeVelocityX * damping;
    const forceY = (this.targetGazeY - this.smoothGazeY) * springTension - this.gazeVelocityY * damping;

    this.gazeVelocityX += forceX * dt;
    this.gazeVelocityY += forceY * dt;
    this.smoothGazeX += this.gazeVelocityX * dt;
    this.smoothGazeY += this.gazeVelocityY * dt;

    // Hover alert snappy transition
    const targetAlert = this.isHovered ? 1.0 : 0.0;
    this.hoverAlertStrength += (targetAlert - this.hoverAlertStrength) * Math.min(1, dt * 18);

    // Click impulse decay
    if (this.clickImpulse > 0.01) {
      this.clickImpulse *= Math.max(0, 1 - dt * 12);
    } else {
      this.clickImpulse = 0;
    }

    // --- 2. SUBTLE IDLE LIFE & BREATHING ---
    // Gentle 3.5-second breathing cycle (preserves strict silhouette geometry)
    const breathPhase = (t / 3.5) * Math.PI * 2;
    const breathBobY = Math.sin(breathPhase) * 0.0025; // Tiny vertical breath
    const subtleIdleSway = Math.sin(breathPhase * 0.5) * 0.004;

    // --- 3. REFINED SNAPPY HEAD & BODY ANGLES ---
    // Subtle head tilt following cursor: snappy & controlled within ±0.06 rad (~3.4 deg)
    const headAngle = this.smoothGazeX * 0.055 + subtleIdleSway;
    const headPitch = this.smoothGazeY * 0.040 - this.hoverAlertStrength * 0.015 - this.clickImpulse * 0.03;

    // Subtle torso posture parallax following cursor
    const torsoSway = this.smoothGazeX * 0.018 + subtleIdleSway * 0.5;
    const torsoPitch = this.smoothGazeY * 0.012;
    const torsoYaw = this.smoothGazeX * 0.015;
    const torsoShiftX = this.smoothGazeX * 0.008;

    // Snappy wing micro-reaction (alert perk on hover / cursor proximity)
    const leftFlipperAngle = -this.hoverAlertStrength * 0.035 - this.smoothGazeX * 0.02 - this.clickImpulse * 0.05;
    const leftFlipperSpread = this.hoverAlertStrength * 0.018 + Math.max(0, -this.smoothGazeX) * 0.015;

    const rightFlipperAngle = this.hoverAlertStrength * 0.035 - this.smoothGazeX * 0.02 + this.clickImpulse * 0.05;
    const rightFlipperSpread = this.hoverAlertStrength * 0.018 + Math.max(0, this.smoothGazeX) * 0.015;

    this.state = {
      time: t,
      torsoSway,
      torsoPitch,
      torsoYaw,
      torsoShiftX,
      torsoBobY: breathBobY,
      headAngle,
      headPitch,
      leftFlipperAngle,
      leftFlipperSpread,
      rightFlipperAngle,
      rightFlipperSpread,
    };
  }

  /**
   * Renders the authentic ASCII penguin in vibrant orange with crisp monospace typography and stable ground shadow.
   */
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragOffset: number = 0,
    textColor: string = '#EF5A2A'
  ): void {
    if (width <= 0 || height <= 0) return;

    this.lastCanvasWidth = width;
    ctx.clearRect(0, 0, width, height);

    const s = this.state;

    // Scale glyph cells to fit comfortably within the stage height
    const padY = height * 0.08;
    const availH = height - padY * 2;

    const charAspect = 0.58;
    const charH = availH / this.totalRows;
    const charW = charH * charAspect;

    const totalGridW = this.totalCols * charW;
    const totalGridH = this.totalRows * charH;

    // Center solidly in canvas with optional micro-drag offset
    const originX = (width - totalGridW) * 0.5 + dragOffset;
    const originY = (height - totalGridH) * 0.5;

    // --- 1. CRISP, STABLE GROUND CONTACT SHADOW ---
    const groundBaseY = originY + totalGridH * 0.985;
    const shadowCenterX = originX + totalGridW * 0.51 + s.torsoShiftX * totalGridW;
    const shadowLeftFootX = originX + totalGridW * 0.38;
    const shadowRightFootX = originX + totalGridW * 0.64;

    ctx.save();

    // Main ambient body shadow
    ctx.beginPath();
    ctx.ellipse(
      shadowCenterX,
      groundBaseY,
      totalGridW * 0.28,
      charH * 1.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(239, 90, 42, 0.07)';
    ctx.fill();

    // Left foot ground contact
    ctx.beginPath();
    ctx.ellipse(
      shadowLeftFootX,
      groundBaseY,
      totalGridW * 0.12,
      charH * 0.8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(239, 90, 42, 0.14)';
    ctx.fill();

    // Right foot ground contact
    ctx.beginPath();
    ctx.ellipse(
      shadowRightFootX,
      groundBaseY,
      totalGridW * 0.12,
      charH * 0.8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(239, 90, 42, 0.14)';
    ctx.fill();

    ctx.restore();

    // --- 2. ANATOMICAL SKELETAL TRANSFORMS ---
    const torsoPivotX = originX + totalGridW * 0.48;
    const torsoPivotY = originY + totalGridH * 0.60;
    const headPivotX = originX + totalGridW * 0.45;
    const headPivotY = originY + totalGridH * 0.22;

    const leftFlipperPivotX = originX + totalGridW * 0.30;
    const leftFlipperPivotY = originY + totalGridH * 0.40;
    const rightFlipperPivotX = originX + totalGridW * 0.66;
    const rightFlipperPivotY = originY + totalGridH * 0.40;

    const cosTorso = Math.cos(s.torsoSway);
    const sinTorso = Math.sin(s.torsoSway);
    const cosHead = Math.cos(s.headAngle);
    const sinHead = Math.sin(s.headAngle);

    const cosLeftFlip = Math.cos(s.leftFlipperAngle);
    const sinLeftFlip = Math.sin(s.leftFlipperAngle);
    const cosRightFlip = Math.cos(s.rightFlipperAngle);
    const sinRightFlip = Math.sin(s.rightFlipperAngle);

    const shiftPxX = s.torsoShiftX * totalGridW;
    const bobPxY = s.torsoBobY * totalGridH;
    const pitchPxY = s.torsoPitch * totalGridH;

    // Monospace font configuration
    const fontSize = Math.max(7, Math.floor(charH * 1.05));
    ctx.font = `600 ${fontSize}px "JetBrains Mono", "Courier New", Courier, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // --- 3. RENDER PRISTINE ASCII GLYPH MATRIX ---
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      const baseX = originX + p.origCol * charW + charW * 0.5;
      const baseY = originY + p.origRow * charH + charH * 0.5;

      // Subtle skeletal displacement
      // A. Torso
      const relTorsoX = baseX - torsoPivotX;
      const relTorsoY = baseY - torsoPivotY;
      const torsoDx =
        relTorsoX * cosTorso -
        relTorsoY * sinTorso -
        relTorsoX +
        shiftPxX;
      const torsoDy =
        relTorsoX * sinTorso +
        relTorsoY * cosTorso -
        relTorsoY +
        bobPxY +
        pitchPxY;

      // B. Head (Snappy Gaze Tracking)
      const relHeadX = baseX - headPivotX;
      const relHeadY = baseY - headPivotY;
      const headDx =
        relHeadX * cosHead -
        relHeadY * sinHead -
        relHeadX +
        shiftPxX * 0.5;
      const headDy =
        relHeadX * sinHead +
        relHeadY * cosHead -
        relHeadY +
        bobPxY +
        s.headPitch * totalGridH * 0.25;

      // C. Left Flipper (Snappy Micro-Alert)
      const relLFlipX = baseX - leftFlipperPivotX;
      const relLFlipY = baseY - leftFlipperPivotY;
      const leftFlipDx =
        relLFlipX * cosLeftFlip -
        relLFlipY * sinLeftFlip -
        relLFlipX +
        shiftPxX -
        s.leftFlipperSpread * totalGridW;
      const leftFlipDy =
        relLFlipX * sinLeftFlip +
        relLFlipY * cosLeftFlip -
        relLFlipY +
        bobPxY;

      // D. Right Flipper (Snappy Micro-Alert)
      const relRFlipX = baseX - rightFlipperPivotX;
      const relRFlipY = baseY - rightFlipperPivotY;
      const rightFlipDx =
        relRFlipX * cosRightFlip -
        relRFlipY * sinRightFlip -
        relRFlipX +
        shiftPxX +
        s.rightFlipperSpread * totalGridW;
      const rightFlipDy =
        relRFlipX * sinRightFlip +
        relRFlipY * cosRightFlip -
        relRFlipY +
        bobPxY;

      // Weighted displacement integration
      const totalDx =
        torsoDx * p.wTorso +
        headDx * p.wHead +
        leftFlipDx * p.wLeftFlipper +
        rightFlipDx * p.wRightFlipper;

      const totalDy =
        torsoDy * p.wTorso +
        headDy * p.wHead +
        leftFlipDy * p.wLeftFlipper +
        rightFlipDy * p.wRightFlipper;

      const drawX = baseX + totalDx;
      const drawY = baseY + totalDy;

      // Crisp rendering
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = textColor;
      ctx.fillText(p.char, drawX, drawY);
    }

    ctx.globalAlpha = 1.0;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }
}
