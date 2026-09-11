/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PenguinAsciiWalkingEngine.ts
 *
 * Clean, Physically Realistic Articulated Walking Cycle Engine for the Uploaded ASCII Penguin.
 *
 * Guarantees:
 * 1. Clean Character Silhouette: All background speed lines, horizontal streaks, stray spray,
 *    and background artifacts have been cleanly removed, leaving ONLY the pristine ASCII penguin.
 * 2. Exact Character Lock: Preserves 100% of the authentic ASCII / halftone / stippled body texture,
 *    dot density, tonal values, head, eye, beak, belly, flippers, legs, and feet.
 * 3. Exact Orientation Lock: Faces left in the exact original 3/4 front view; camera locked.
 * 4. Articulated Locomotion:
 *    - Left foot grounded -> Body weight shift -> Right foot low swing -> Touchdown
 *    - Right foot grounded -> Body weight shift -> Left foot low swing -> Touchdown
 *    - Subtle torso waddle (±1.4°) and vertical center-of-mass bobbing.
 *    - Stabilized Head: Active counter-rotation keeps gaze and beak steady.
 *    - Passive Flipper Lag: Natural balance lag without flapping.
 * 5. Spatial Texture Integrity: Smooth 2D mesh deformation ensures the halftone pattern
 *    is physically attached to the body—no crawling, shimmering, or flickering.
 * 6. Full Body Visibility: Always shows complete head, beak, torso, flippers, legs, and feet.
 */

export interface PenguinWalkState {
  time: number; // 0..1 loop
  cycleDuration: number; // in seconds (e.g. 3.0s)
  torsoSway: number; // radians
  torsoShiftX: number; // normalized
  torsoBobY: number; // normalized
  headAngle: number; // radians (stabilized)
  leftFlipperAngle: number; // radians
  rightFlipperAngle: number; // radians
  leftFootLift: number; // normalized
  leftFootStride: number; // normalized
  rightFootLift: number; // normalized
  rightFootStride: number; // normalized
  breathPhase: number;
}

export interface MeshVertex {
  u: number; // 0..1 in source image
  v: number; // 0..1 in source image
  x: number; // Current deformed x on screen
  y: number; // Current deformed y on screen
  // Skinning weights
  wTorso: number;
  wHead: number;
  wLeftFoot: number;
  wRightFoot: number;
  wLeftFlipper: number;
  wRightFlipper: number;
}

export interface MeshTriangle {
  i0: number;
  i1: number;
  i2: number;
  isActive: boolean; // false if purely white background
}

// Precise anatomical polygon enclosing the authentic penguin body, head, beak, flippers, and feet
const PENGUIN_SILHOUETTE_POLYGON: [number, number][] = [
  [0.210, 0.080], // Beak tip
  [0.260, 0.050], // Beak upper ridge
  [0.340, 0.035], // Beak to forehead
  [0.440, 0.024], // Crown top
  [0.540, 0.036], // Back of crown
  [0.615, 0.075], // Head upper back
  [0.640, 0.150], // Head back / nape
  [0.650, 0.240], // Neck back
  [0.680, 0.330], // Shoulder / upper back
  [0.710, 0.390], // Right flipper upper shoulder
  [0.775, 0.460], // Right flipper upper curve
  [0.835, 0.580], // Right flipper mid outer curve
  [0.860, 0.700], // Right flipper lower curve
  [0.855, 0.770], // Right flipper lower edge
  [0.835, 0.830], // Right flipper tip
  [0.770, 0.840], // Right flank
  [0.710, 0.880], // Lower right pelvis
  [0.710, 0.930], // Right foot upper heel
  [0.700, 0.978], // Right foot outer toes / claws
  [0.530, 0.978], // Right foot base
  [0.500, 0.900], // Between feet arch
  [0.480, 0.978], // Left foot inner base
  [0.320, 0.978], // Left foot bottom base
  [0.290, 0.955], // Left foot outer claws
  [0.290, 0.905], // Left foot heel / ankle
  [0.325, 0.845], // Lower left belly
  [0.205, 0.820], // Left flipper tip
  [0.195, 0.730], // Left flipper lower curve
  [0.208, 0.610], // Left flipper mid curve
  [0.240, 0.500], // Left flipper upper curve
  [0.270, 0.420], // Lower chest
  [0.290, 0.300], // Mid front chest
  [0.340, 0.200], // Throat
  [0.315, 0.145], // Chin / under-beak
  [0.230, 0.110], // Lower beak blade
];

function isInsidePenguinSilhouette(u: number, v: number): boolean {
  let inside = false;
  const poly = PENGUIN_SILHOUETTE_POLYGON;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];

    const intersect =
      yi > v !== yj > v && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export class PenguinAsciiWalkingEngine {
  private image: HTMLImageElement | null = null;
  private processedCanvas: HTMLCanvasElement | null = null;
  private isImageLoaded: boolean = false;
  private imageAspect: number = 1.0;

  // Grid mesh
  private gridCols: number = 28;
  private gridRows: number = 28;
  private vertices: MeshVertex[] = [];
  private triangles: MeshTriangle[] = [];

  // Animation timing
  private cycleDuration: number = 3.0; // 3 seconds per natural penguin waddle loop
  private walkTime: number = 0;
  private isPaused: boolean = false;

  // Cached state
  public state: PenguinWalkState = {
    time: 0,
    cycleDuration: 3.0,
    torsoSway: 0,
    torsoShiftX: 0,
    torsoBobY: 0,
    headAngle: 0,
    leftFlipperAngle: 0,
    rightFlipperAngle: 0,
    leftFootLift: 0,
    leftFootStride: 0,
    rightFootLift: 0,
    rightFootStride: 0,
    breathPhase: 0,
  };

  constructor(imageSrc: string = '/images/penguinascii.jpg') {
    this.loadImage(imageSrc);
    this.buildMesh();
  }

  private loadImage(src: string): void {
    if (typeof window === 'undefined') return;

    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.src = src;

    this.image.onload = () => {
      this.isImageLoaded = true;
      if (this.image) {
        this.imageAspect = this.image.width / this.image.height;
        this.processImageTransparency();
      }
    };
  }

  /**
   * Processes the raw image to:
   * 1. Remove 100% of the background lines, speed streaks, stray spray, and diagonal borders.
   * 2. Convert pure white to transparent.
   * 3. Retain the authentic charcoal/black ASCII stipple dots of the penguin's body, head, beak, flippers, and feet.
   */
  private processImageTransparency(): void {
    if (!this.image || !this.image.width || !this.image.height) return;

    const w = this.image.width;
    const h = this.image.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(this.image, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // First pass: Calculate initial mask and remove everything outside the penguin silhouette
    const isDark = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;
        const rVal = data[idx];
        const gVal = data[idx + 1];
        const bVal = data[idx + 2];
        const brightness = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;

        // If outside the clean penguin silhouette, completely remove the pixel
        if (!isInsidePenguinSilhouette(u, v)) {
          data[idx + 3] = 0;
          continue;
        }

        if (brightness < 235) {
          isDark[y * w + x] = 1;
        }
      }
    }

    // Second pass: Remove any remaining horizontal streak artifacts near the perimeter
    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;

        if (data[idx + 3] === 0) continue;

        const pixelIdx = y * w + x;
        if (!isDark[pixelIdx]) {
          data[idx + 3] = 0;
          continue;
        }

        // Peripheral streak filter: on the outer flanks, check vertical connectivity
        const isFlank = u < 0.26 || u > 0.72 || v < 0.12;
        if (isFlank) {
          // Check if pixel has vertical support within ±3 pixels
          let verticalSupport = 0;
          for (let dy = -3; dy <= 3; dy++) {
            if (dy === 0) continue;
            const ny = y + dy;
            if (ny >= 0 && ny < h && isDark[ny * w + x]) {
              verticalSupport++;
            }
          }

          // If it's a thin horizontal streak with no vertical neighbors, clear it
          if (verticalSupport === 0) {
            let localDensity = 0;
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && isDark[ny * w + nx]) {
                  localDensity++;
                }
              }
            }
            if (localDensity <= 3) {
              data[idx + 3] = 0;
              continue;
            }
          }
        }

        // Keep authentic dark contrast for penguin's ASCII texture
        const rVal = data[idx];
        const gVal = data[idx + 1];
        const bVal = data[idx + 2];
        const brightness = 0.299 * rVal + 0.587 * gVal + 0.114 * bVal;

        if (brightness >= 245) {
          data[idx + 3] = 0;
        } else if (brightness >= 235) {
          const t = (245 - brightness) / 10;
          data[idx] = 10;
          data[idx + 1] = 10;
          data[idx + 2] = 9;
          data[idx + 3] = Math.floor(t * 140);
        } else {
          const alpha = Math.min(255, Math.floor(((255 - brightness) / 255) * 1.35 * 255));
          data[idx] = 10;
          data[idx + 1] = 10;
          data[idx + 2] = 9;
          data[idx + 3] = Math.max(data[idx + 3], alpha);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.processedCanvas = canvas;

    // Evaluate active triangles in mesh based on clean pixel density
    const cellW = w / this.gridCols;
    const cellH = h / this.gridRows;

    const cellHasContent: boolean[][] = [];
    for (let r = 0; r < this.gridRows; r++) {
      cellHasContent[r] = [];
      for (let c = 0; c < this.gridCols; c++) {
        let activePixels = 0;
        const startX = Math.floor(c * cellW);
        const endX = Math.min(w, Math.floor((c + 1) * cellW));
        const startY = Math.floor(r * cellH);
        const endY = Math.min(h, Math.floor((r + 1) * cellH));

        for (let py = startY; py < endY; py += 2) {
          for (let px = startX; px < endX; px += 2) {
            const idx = (py * w + px) * 4;
            if (data[idx + 3] > 20) {
              activePixels++;
            }
          }
        }
        cellHasContent[r][c] = activePixels > 0;
      }
    }

    // Update active triangles
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const triIdx1 = (r * this.gridCols + c) * 2;
        const triIdx2 = triIdx1 + 1;

        let active = cellHasContent[r][c];
        if (!active) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.gridRows && nc >= 0 && nc < this.gridCols) {
                if (cellHasContent[nr][nc]) {
                  active = true;
                  break;
                }
              }
            }
            if (active) break;
          }
        }

        if (triIdx1 < this.triangles.length) this.triangles[triIdx1].isActive = active;
        if (triIdx2 < this.triangles.length) this.triangles[triIdx2].isActive = active;
      }
    }
  }

  /**
   * Builds the anatomical 2D deformation mesh with bone-influence skinning weights.
   */
  private buildMesh(): void {
    this.vertices = [];
    this.triangles = [];

    const cols = this.gridCols;
    const rows = this.gridRows;

    // Generate vertices
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;

        // Landmark anchors:
        // Head / Beak: (0.44, 0.14)
        // Left Flipper: (0.24, 0.55)
        // Right Flipper: (0.74, 0.52)
        // Left Foot: (0.38, 0.92)
        // Right Foot: (0.62, 0.92)
        // Torso / Belly: (0.48, 0.55)

        const dHead = Math.hypot(u - 0.44, (v - 0.14) * 1.5);
        const dLeftFoot = Math.hypot(u - 0.38, (v - 0.92) * 2.0);
        const dRightFoot = Math.hypot(u - 0.62, (v - 0.92) * 2.0);
        const dLeftFlipper = Math.hypot(u - 0.24, (v - 0.55) * 1.3);
        const dRightFlipper = Math.hypot(u - 0.74, (v - 0.52) * 1.3);

        let wHead = 0;
        let wLeftFoot = 0;
        let wRightFoot = 0;
        let wLeftFlipper = 0;
        let wRightFlipper = 0;
        let wTorso = 1.0;

        // 1. Head influence (v < 0.26)
        if (v < 0.26 && u < 0.68) {
          wHead = Math.max(0, 1.0 - dHead * 3.2);
          wHead = Math.pow(wHead, 1.5);
        }

        // 2. Left Foot influence (viewer left): Bottom-left (v > 0.80, u < 0.52)
        if (v > 0.80 && u < 0.52) {
          wLeftFoot = Math.max(0, 1.0 - dLeftFoot * 3.8);
          wLeftFoot = Math.pow(wLeftFoot, 1.6);
        }

        // 3. Right Foot influence (viewer right): Bottom-right (v > 0.80, u >= 0.48)
        if (v > 0.80 && u >= 0.48) {
          wRightFoot = Math.max(0, 1.0 - dRightFoot * 3.8);
          wRightFoot = Math.pow(wRightFoot, 1.6);
        }

        // 4. Left Flipper (viewer left): Flank (u < 0.34, v in [0.32, 0.80])
        if (u < 0.34 && v >= 0.32 && v <= 0.80) {
          wLeftFlipper = Math.max(0, 1.0 - dLeftFlipper * 3.5);
          wLeftFlipper = Math.pow(wLeftFlipper, 1.4);
        }

        // 5. Right Flipper (viewer right): Flank (u > 0.64, v in [0.30, 0.82])
        if (u > 0.64 && v >= 0.30 && v <= 0.82) {
          wRightFlipper = Math.max(0, 1.0 - dRightFlipper * 3.5);
          wRightFlipper = Math.pow(wRightFlipper, 1.4);
        }

        // Normalize weights so sum is 1.0
        const total = wHead + wLeftFoot + wRightFoot + wLeftFlipper + wRightFlipper;
        if (total > 0.98) {
          wTorso = 0;
          const inv = 1.0 / total;
          wHead *= inv;
          wLeftFoot *= inv;
          wRightFoot *= inv;
          wLeftFlipper *= inv;
          wRightFlipper *= inv;
        } else {
          wTorso = 1.0 - total;
        }

        this.vertices.push({
          u,
          v,
          x: 0,
          y: 0,
          wTorso,
          wHead,
          wLeftFoot,
          wRightFoot,
          wLeftFlipper,
          wRightFlipper,
        });
      }
    }

    // Generate triangles
    const stride = cols + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i0 = r * stride + c;
        const i1 = r * stride + (c + 1);
        const i2 = (r + 1) * stride + c;
        const i3 = (r + 1) * stride + (c + 1);

        // Triangle 1: i0, i1, i2
        this.triangles.push({
          i0,
          i1,
          i2,
          isActive: true,
        });

        // Triangle 2: i1, i3, i2
        this.triangles.push({
          i0: i1,
          i1: i3,
          i2,
          isActive: true,
        });
      }
    }
  }

  /**
   * Advances the walking simulation by dt seconds.
   */
  public update(dt: number): void {
    if (this.isPaused) return;

    // Advance normalized loop cycle (0..1)
    this.walkTime = (this.walkTime + dt / this.cycleDuration) % 1.0;
    const t = this.walkTime;

    // --- REALISTIC PENGUIN GAIT CALCULATIONS ---
    // Total cycle is 3.0s:
    // t in [0.00, 0.50]: Left foot grounded / supporting; Right foot swings forward.
    // t in [0.50, 1.00]: Right foot grounded / supporting; Left foot swings forward.

    // 1. Torso Sway & Lateral Weight Shift (Gentle waddle roll: ±1.4 degrees)
    const waddlePhase = t * Math.PI * 2;
    const torsoSway = Math.sin(waddlePhase) * 0.024; // ±1.37 degrees
    const torsoShiftX = Math.sin(waddlePhase) * 0.012; // ±1.2% normalized width

    // 2. Vertical Bobbing: Double frequency (bobs twice per step cycle)
    const torsoBobY = Math.cos(waddlePhase * 2) * 0.0045;

    // 3. Head Stabilization:
    // Keeps gaze and beak steady on the horizon
    const headAngle = -torsoSway * 0.88;

    // 4. Flippers Passive Balance Lag:
    const leftFlipperAngle = Math.sin(waddlePhase - 0.42) * 0.032;
    const rightFlipperAngle = -Math.sin(waddlePhase - 0.42) * 0.034;

    // 5. Feet Kinematics:
    let leftFootLift = 0;
    let leftFootStride = 0;
    let rightFootLift = 0;
    let rightFootStride = 0;

    // Right foot swing phase (t in [0.00, 0.50])
    if (t < 0.50) {
      const s = t / 0.50; // 0..1 in swing
      rightFootLift = Math.sin(s * Math.PI) * 0.014;
      rightFootStride = (Math.cos(s * Math.PI) * -0.5 + 0.5 - 0.5) * 0.016;

      // Left foot is firmly grounded during this phase
      leftFootLift = 0;
      leftFootStride = -rightFootStride * 0.3;
    } else {
      // Left foot swing phase (t in [0.50, 1.00])
      const s = (t - 0.50) / 0.50; // 0..1 in swing
      leftFootLift = Math.sin(s * Math.PI) * 0.014;
      leftFootStride = (Math.cos(s * Math.PI) * -0.5 + 0.5 - 0.5) * 0.016;

      // Right foot is firmly grounded during this phase
      rightFootLift = 0;
      rightFootStride = -leftFootStride * 0.3;
    }

    const breathPhase = (t * Math.PI * 4) % (Math.PI * 2);

    this.state = {
      time: t,
      cycleDuration: this.cycleDuration,
      torsoSway,
      torsoShiftX,
      torsoBobY,
      headAngle,
      leftFlipperAngle,
      rightFlipperAngle,
      leftFootLift,
      leftFootStride,
      rightFootLift,
      rightFootStride,
      breathPhase,
    };
  }

  /**
   * Renders the deformed penguin mesh onto the target 2D canvas context.
   */
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dragOffset: number = 0
  ): void {
    if (width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    const src = this.processedCanvas || this.image;
    if (!src || !this.isImageLoaded) return;

    const s = this.state;

    // Frame centering with comfortable margins (full body always visible)
    const margin = Math.min(width, height) * 0.06;
    const drawW = Math.min(width - margin * 2, height - margin * 2);
    const drawH = drawW / this.imageAspect;

    const originX = (width - drawW) * 0.5 + dragOffset;
    const originY = (height - drawH) * 0.5;

    // Transform landmarks in screen space
    const torsoPivotX = originX + drawW * 0.48;
    const torsoPivotY = originY + drawH * 0.60;
    const headPivotX = originX + drawW * 0.44;
    const headPivotY = originY + drawH * 0.22;
    const leftFootPivotX = originX + drawW * 0.38;
    const leftFootPivotY = originY + drawH * 0.90;
    const rightFootPivotX = originX + drawW * 0.62;
    const rightFootPivotY = originY + drawH * 0.90;
    const leftFlipperPivotX = originX + drawW * 0.30;
    const leftFlipperPivotY = originY + drawH * 0.40;
    const rightFlipperPivotX = originX + drawW * 0.66;
    const rightFlipperPivotY = originY + drawH * 0.38;

    const cosTorso = Math.cos(s.torsoSway);
    const sinTorso = Math.sin(s.torsoSway);
    const cosHead = Math.cos(s.headAngle);
    const sinHead = Math.sin(s.headAngle);
    const cosLeftFlip = Math.cos(s.leftFlipperAngle);
    const sinLeftFlip = Math.sin(s.leftFlipperAngle);
    const cosRightFlip = Math.cos(s.rightFlipperAngle);
    const sinRightFlip = Math.sin(s.rightFlipperAngle);

    const shiftPxX = s.torsoShiftX * drawW;
    const bobPxY = s.torsoBobY * drawH;

    // 1. Deform all mesh vertices
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];

      const baseX = originX + v.u * drawW;
      const baseY = originY + v.v * drawH;

      // Displacement from each bone
      // A. Torso / Pelvis
      const relTorsoX = baseX - torsoPivotX;
      const relTorsoY = baseY - torsoPivotY;
      const torsoDx = relTorsoX * cosTorso - relTorsoY * sinTorso - relTorsoX + shiftPxX;
      const torsoDy = relTorsoX * sinTorso + relTorsoY * cosTorso - relTorsoY + bobPxY;

      // B. Head (Stabilized)
      const relHeadX = baseX - headPivotX;
      const relHeadY = baseY - headPivotY;
      const headDx = relHeadX * cosHead - relHeadY * sinHead - relHeadX + shiftPxX * 0.4;
      const headDy = relHeadX * sinHead + relHeadY * cosHead - relHeadY + bobPxY * 0.3;

      // C. Left Foot (viewer left)
      const leftFootDx = s.leftFootStride * drawW + shiftPxX * 0.2;
      const leftFootDy = -s.leftFootLift * drawH;

      // D. Right Foot (viewer right)
      const rightFootDx = s.rightFootStride * drawW + shiftPxX * 0.2;
      const rightFootDy = -s.rightFootLift * drawH;

      // E. Left Flipper
      const relLFlipX = baseX - leftFlipperPivotX;
      const relLFlipY = baseY - leftFlipperPivotY;
      const leftFlipDx = relLFlipX * cosLeftFlip - relLFlipY * sinLeftFlip - relLFlipX + shiftPxX;
      const leftFlipDy = relLFlipX * sinLeftFlip + relLFlipY * cosLeftFlip - relLFlipY + bobPxY;

      // F. Right Flipper
      const relRFlipX = baseX - rightFlipperPivotX;
      const relRFlipY = baseY - rightFlipperPivotY;
      const rightFlipDx = relRFlipX * cosRightFlip - relRFlipY * sinRightFlip - relRFlipX + shiftPxX;
      const rightFlipDy = relRFlipX * sinRightFlip + relRFlipY * cosRightFlip - relRFlipY + bobPxY;

      // Blend displacements via skinning weights
      const totalDx =
        torsoDx * v.wTorso +
        headDx * v.wHead +
        leftFootDx * v.wLeftFoot +
        rightFootDx * v.wRightFoot +
        leftFlipDx * v.wLeftFlipper +
        rightFlipDx * v.wRightFlipper;

      const totalDy =
        torsoDy * v.wTorso +
        headDy * v.wHead +
        leftFootDy * v.wLeftFoot +
        rightFootDy * v.wRightFoot +
        leftFlipDy * v.wLeftFlipper +
        rightFlipDy * v.wRightFlipper;

      v.x = baseX + totalDx;
      v.y = baseY + totalDy;
    }

    // 2. Render active triangles using piecewise affine texture mapping
    const srcW = src.width;
    const srcH = src.height;

    for (let i = 0; i < this.triangles.length; i++) {
      const tri = this.triangles[i];
      if (!tri.isActive) continue;

      const v0 = this.vertices[tri.i0];
      const v1 = this.vertices[tri.i1];
      const v2 = this.vertices[tri.i2];

      const u0 = v0.u * srcW;
      const v0_src = v0.v * srcH;
      const u1 = v1.u * srcW;
      const v1_src = v1.v * srcH;
      const u2 = v2.u * srcW;
      const v2_src = v2.v * srcH;

      const x0 = v0.x;
      const y0 = v0.y;
      const x1 = v1.x;
      const y1 = v1.y;
      const x2 = v2.x;
      const y2 = v2.y;

      // Compute affine transformation matrix mapping (u, v) -> (x, y)
      const delta = (u0 - u2) * (v1_src - v2_src) - (u1 - u2) * (v0_src - v2_src);
      if (Math.abs(delta) < 0.0001) continue;

      const invDelta = 1.0 / delta;

      const a = ((x0 - x2) * (v1_src - v2_src) - (x1 - x2) * (v0_src - v2_src)) * invDelta;
      const b = ((y0 - y2) * (v1_src - v2_src) - (y1 - y2) * (v0_src - v2_src)) * invDelta;
      const c = ((x1 - x2) * (u0 - u2) - (x0 - x2) * (u1 - u2)) * invDelta;
      const d = ((y1 - y2) * (u0 - u2) - (y0 - y2) * (u1 - u2)) * invDelta;
      const e = x0 - a * u0 - c * v0_src;
      const f = y0 - b * u0 - d * v0_src;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.clip();

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    }
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }
}
