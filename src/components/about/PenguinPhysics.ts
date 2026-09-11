/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PenguinPhysics.ts
 *
 * Physically coherent, fluid locomotion & autonomous behavioral engine
 * for the NEXUS Halftone Penguin Mascot.
 *
 * Core Capabilities:
 * - Unified requestAnimationFrame Loop with performance.now() delta timing & tab-switch clamping.
 * - Spring-Damper Physics Model: Second-order critically damped harmonic oscillator
 *   (a = omega^2 * (target - x) - 2 * zeta * omega * v) across all degrees of freedom:
 *   1. Horizontal Traversal: Organic acceleration, soft speed clamping, natural deceleration into waypoints.
 *   2. Vertical Emergence & Retreat: Smooth spring pop-in onto viewport baseline, fluid descent on retreat.
 *   3. 3D Turning Interpolation: Horizontal scale smoothly passes through zero when pivoting directions.
 *   4. Biomechanical Waddle Tilt: Dynamic body lean into travel velocity and rhythmic angular oscillation.
 * - Controlled Autonomous State Machine:
 *   - idle: Resting posture with living respiration micro-bobs, natural eye blinking, observant head angles.
 *   - turn: Smoothly rotates facing direction toward next organic waypoint before taking steps.
 *   - walk: Kinematic locomotion with alternating footstep cycles and footfall dips coupled to velocity.
 *   - pause: Smooth deceleration into rest upon reaching waypoints, observing surroundings.
 */

export type PenguinBehaviorState = 'idle' | 'turn' | 'walk' | 'pause';

export interface Spring1D {
  val: number;
  vel: number;
  target: number;
  omega: number; // Natural frequency (rad/s)
  zeta: number;  // Damping ratio (0.95 - 1.0 = critically damped)
}

export function createSpring(
  initial: number,
  omega: number = 3.5,
  zeta: number = 0.96
): Spring1D {
  return {
    val: initial,
    vel: 0,
    target: initial,
    omega,
    zeta,
  };
}

/**
 * Steps a 1D spring-damper system forward by dt seconds
 * Equation of motion: a = omega^2 * (target - val) - 2 * zeta * omega * vel
 */
export function updateSpring(spring: Spring1D, dt: number): void {
  const f = spring.omega * spring.omega * (spring.target - spring.val);
  const d = 2.0 * spring.zeta * spring.omega * spring.vel;
  const a = f - d;
  spring.vel += a * dt;
  spring.val += spring.vel * dt;
}

export interface PhysicsPoint2D {
  x: number;
  y: number;
}

export interface ArticulatedBodyState {
  // Behavioral state
  behaviorState: PenguinBehaviorState;
  stateTimer: number;

  // Main body root & 3D transformation (normalized canvas coords)
  rootX: number;
  rootY: number;
  rootVx: number;
  rootVy: number;
  rootAx: number;
  rootAy: number;
  rootAngle: number;
  facingScale: number; // 3D planar rotation factor passing through 0 (-1 to 1)
  tiltAngle: number;   // Dynamic lean + waddle roll

  // Torso
  torsoX: number;
  torsoY: number;
  torsoAngle: number;
  weightShiftX: number;

  // Head (Stabilized secondary system)
  headX: number;
  headY: number;
  headAngle: number;
  headVx: number;
  headVy: number;
  curiousGazeAngle: number;
  isBlinking: boolean;

  // Left & Right Foot
  leftFootX: number;
  leftFootY: number;
  leftFootLift: number;
  leftFootStride: number;
  leftFootGrounded: boolean;

  rightFootX: number;
  rightFootY: number;
  rightFootLift: number;
  rightFootStride: number;
  rightFootGrounded: boolean;

  // Flippers
  leftFlipperX: number;
  leftFlipperY: number;
  leftFlipperAngle: number;

  rightFlipperX: number;
  rightFlipperY: number;
  rightFlipperAngle: number;

  // Kinematic & Walk metrics
  walkPhase: number;
  walkCadence: number;
  walkIntensity: number;
  forwardSpeed: number;
  isPaused: boolean;
  breathPhase: number;
}

export const PENGUIN_PHYSICS_CONFIG = {
  // Second-Order Spring-Damper Parameters (Critically Damped)
  // 1. Horizontal Traversal
  xOmega: 2.6,             // rad/s (~0.4 Hz stately penguin movement)
  xZeta: 0.98,             // Critically damped: zero overshoot, zero jarring snaps
  maxSpeed: 0.15,          // Normalized canvas units/s (~60-75 px/s)
  maxAcceleration: 0.50,   // Soft acceleration limit

  // 2. Vertical Emergence & Retreat
  yOmega: 5.2,             // Emergence pop-in natural frequency
  yZeta: 0.96,             // Smooth settling onto stage baseline
  groundBaselineY: 0.50,   // Grounded baseline in canvas
  emergenceOffsetY: 0.28,  // Starts below baseline on mount

  // 3. 3D Turning Interpolation
  facingOmega: 8.5,        // Smooth 3D turnaround rate
  facingZeta: 0.96,        // Critical damping through 0

  // 4. Biomechanical Waddle Tilt
  tiltOmega: 11.0,         // Dynamic tilt response rate
  tiltZeta: 0.88,          // Compliant organic damping

  // Stage Horizontal Traversal Bounds (Wide stage travel!)
  boundsMinX: 0.26,        // Left margin
  boundsMaxX: 0.74,        // Right margin

  // Locomotion & Walk Kinematics
  walkFrequencyBase: 1.4,  // Step cadence (Hz)
  walkCadenceGain: 2.4,    // Cadence scaling with speed
  maxWalkFrequency: 2.5,   // Maximum cadence cap
  waddleAmplitude: 0.042,  // Angular waddle oscillation (rad)
  waddlePhaseLag: 0.28,    // Feet move, body follows smoothly
  bodyDipAmplitude: 0.006, // Downward dip on footfalls
  travelLeanGain: 0.35,    // Body lean into travel velocity
  maxLeanAngle: 0.052,     // Max lean ~3 degrees

  // Ground Contact & Stride
  footSpreadX: 0.070,      // Normalized stance width
  stepLength: 0.024,       // Stride displacement
  stepLiftMax: 0.016,      // Parabolic foot lift height

  // Respiration & Head Stabilization
  breathCycleDuration: 3.2,
  headSmoothSpeed: 9.0,
  headSwayCounteract: 0.60,
  maxHeadRotation: 0.065,

  // Flippers
  flipperAmplitude: 0.038,
  flipperPhaseLag: 0.40,

  // Local Halftone Dot Elasticity
  dotStiffness: 24.0,
  dotDamping: 8.0,
  maxSkinDisplacement: 3.5,
  pointerForce: 1.2,
  pointerRadius: 70,

  // Autonomous Behavior Timing (seconds)
  idleDurationMin: 2.2,
  idleDurationMax: 3.8,
  turnDuration: 0.45,
  walkTimeoutMax: 6.5,
  pauseDurationMin: 1.6,
  pauseDurationMax: 2.8,
  blinkIntervalMin: 2.4,
  blinkIntervalMax: 4.8,
  blinkDuration: 0.14,

  // Story Descent Baseline (Centered around 0.50)
  rightSideCenter: 0.50,
  driftAmplitude: 0.016,
  driftFrequency: 2.0,
  yStart: 0.50,
  yEnd: 0.52,

  DEBUG_PHYSICS: false,
};

/**
 * Evaluates scroll-guided baseline trajectory if scrolling
 */
export function evaluateTargetTrajectory(progress: number): PhysicsPoint2D {
  const p = Math.max(0, Math.min(1, progress));
  const { rightSideCenter, driftAmplitude, driftFrequency, yStart, yEnd } =
    PENGUIN_PHYSICS_CONFIG;

  const targetY = yStart + (yEnd - yStart) * p;
  const drift = driftAmplitude * Math.sin(driftFrequency * Math.PI * p);
  const targetX = rightSideCenter + drift;

  return { x: targetX, y: targetY };
}

/**
 * PenguinPhysicsSimulation
 *
 * Full biomechanical and behavioral simulation for the mascot.
 */
export class PenguinPhysicsSimulation {
  public state: ArticulatedBodyState;

  // Spring-Damper Oscillators
  public xSpring: Spring1D;
  public ySpring: Spring1D;
  public facingSpring: Spring1D;
  public tiltSpring: Spring1D;

  // Navigation targets
  public targetWaypointX: number = 0.50;
  public currentFacing: 1 | -1 = 1; // 1 = default left-facing, -1 = mirrored right-facing
  public isEmerging: boolean = true;
  public isRetreating: boolean = false;

  // Baseline anchor from scroll progress
  public scrollProgress: number = 0;
  private isUserScrolling: boolean = false;
  private scrollSettleTimer: number = 0;

  // Autonomous state management
  private stateTimer: number = 2.4;
  private lookAngleTarget: number = 0;
  private totalSimTime: number = 0;
  private blinkTimer: number = 3.0;
  private isBlinking: boolean = false;

  // Frame diagnostic metrics
  private lastUpdateTime: number = 0;
  private frameCount: number = 0;
  private calculatedFps: number = 60;

  constructor() {
    const cfg = PENGUIN_PHYSICS_CONFIG;
    const initialX = 0.50;
    const initialY = cfg.groundBaselineY + cfg.emergenceOffsetY; // starts below baseline

    // Initialize 4 critically damped springs
    this.xSpring = createSpring(initialX, cfg.xOmega, cfg.xZeta);
    this.ySpring = createSpring(initialY, cfg.yOmega, cfg.yZeta);
    this.ySpring.target = cfg.groundBaselineY; // Pop-in spring target

    this.facingSpring = createSpring(1.0, cfg.facingOmega, cfg.facingZeta);
    this.tiltSpring = createSpring(0.0, cfg.tiltOmega, cfg.tiltZeta);

    this.targetWaypointX = initialX;
    this.currentFacing = 1;

    this.state = {
      behaviorState: 'idle',
      stateTimer: 2.4,

      rootX: initialX,
      rootY: initialY,
      rootVx: 0,
      rootVy: 0,
      rootAx: 0,
      rootAy: 0,
      rootAngle: 0,
      facingScale: 1.0,
      tiltAngle: 0,

      torsoX: initialX,
      torsoY: initialY,
      torsoAngle: 0,
      weightShiftX: 0,

      headX: initialX,
      headY: initialY - 0.22,
      headAngle: 0,
      headVx: 0,
      headVy: 0,
      curiousGazeAngle: 0,
      isBlinking: false,

      leftFootX: initialX - cfg.footSpreadX,
      leftFootY: initialY + 0.28,
      leftFootLift: 0,
      leftFootStride: 0,
      leftFootGrounded: true,

      rightFootX: initialX + cfg.footSpreadX,
      rightFootY: initialY + 0.28,
      rightFootLift: 0,
      rightFootStride: 0,
      rightFootGrounded: true,

      leftFlipperX: initialX - 0.12,
      leftFlipperY: initialY,
      leftFlipperAngle: 0,

      rightFlipperX: initialX + 0.12,
      rightFlipperY: initialY,
      rightFlipperAngle: 0,

      walkPhase: 0,
      walkCadence: cfg.walkFrequencyBase,
      walkIntensity: 0,
      forwardSpeed: 0,
      isPaused: false,
      breathPhase: 0,
    };

    this.stateTimer = 2.4;
    this.exposeDiagnostics();
  }

  /**
   * Updates story scroll progress.
   */
  public setScrollProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    const delta = Math.abs(clamped - this.scrollProgress);

    if (delta > 0.001) {
      this.isUserScrolling = true;
      this.scrollSettleTimer = 0.8;
      this.scrollProgress = clamped;

      const traj = evaluateTargetTrajectory(clamped);
      this.targetWaypointX = traj.x;
      this.xSpring.target = traj.x;
      this.ySpring.target = traj.y;

      if (this.state.behaviorState !== 'walk') {
        this.transitionTo('walk');
      }
    }
  }

  /**
   * Selects an organic waypoint separated from current position for well-defined traversal.
   */
  private pickNextWaypoint(): number {
    const cfg = PENGUIN_PHYSICS_CONFIG;
    const span = cfg.boundsMaxX - cfg.boundsMinX;
    const currentX = this.xSpring.val;

    // Pick candidate separated by at least 0.20 (visible stroll distance across stage)
    for (let i = 0; i < 8; i++) {
      const candidate = cfg.boundsMinX + Math.random() * span;
      if (Math.abs(candidate - currentX) > 0.20) {
        return candidate;
      }
    }

    // Fallback: opposite side of current position
    return currentX > (cfg.boundsMinX + cfg.boundsMaxX) / 2
      ? cfg.boundsMinX + span * 0.22
      : cfg.boundsMaxX - span * 0.22;
  }

  /**
   * State Machine Transition
   */
  private transitionTo(nextState: PenguinBehaviorState): void {
    const cfg = PENGUIN_PHYSICS_CONFIG;
    const s = this.state;
    s.behaviorState = nextState;

    switch (nextState) {
      case 'idle':
        this.stateTimer =
          cfg.idleDurationMin +
          Math.random() * (cfg.idleDurationMax - cfg.idleDurationMin);
        s.isPaused = false;
        this.lookAngleTarget = 0;
        break;

      case 'turn':
        this.stateTimer = cfg.turnDuration;
        s.isPaused = false;
        break;

      case 'walk':
        this.stateTimer = cfg.walkTimeoutMax;
        s.isPaused = false;
        break;

      case 'pause':
        this.stateTimer =
          cfg.pauseDurationMin +
          Math.random() * (cfg.pauseDurationMax - cfg.pauseDurationMin);
        s.isPaused = true;
        break;
    }
  }

  /**
   * Main Physics Tick (Frame-rate independent with dt clamping)
   */
  public update(
    dt: number,
    reducedMotion: boolean,
    pointerState?: { x: number; y: number; active: boolean },
    canvasWidth: number = 400,
    canvasHeight: number = 500
  ): void {
    const safeDt = Math.min(0.05, Math.max(0.001, dt));
    this.totalSimTime += safeDt;

    // Diagnostic metrics
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastUpdateTime > 500) {
      this.calculatedFps = Math.round((this.frameCount * 1000) / (now - this.lastUpdateTime));
      this.frameCount = 0;
      this.lastUpdateTime = now;
      this.exposeDiagnostics();
    }

    if (reducedMotion) {
      this.updateReducedMotion(safeDt);
      return;
    }

    const cfg = PENGUIN_PHYSICS_CONFIG;
    const s = this.state;

    // Scroll settle timer
    if (this.isUserScrolling) {
      this.scrollSettleTimer -= safeDt;
      if (this.scrollSettleTimer <= 0) {
        this.isUserScrolling = false;
      }
    }

    // 1. Vertical Emergence / Retreat Springs
    if (this.isRetreating) {
      this.ySpring.target = cfg.groundBaselineY + cfg.emergenceOffsetY;
    } else {
      this.ySpring.target = cfg.groundBaselineY;
    }

    // 2. Natural Eye Blinking Rhythm (idle and walking)
    this.blinkTimer -= safeDt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -cfg.blinkDuration) {
        this.isBlinking = false;
        this.blinkTimer =
          cfg.blinkIntervalMin +
          Math.random() * (cfg.blinkIntervalMax - cfg.blinkIntervalMin);
      }
    }
    s.isBlinking = this.isBlinking;

    // 3. Controlled Autonomous State Machine Progression
    this.stateTimer -= safeDt;
    s.stateTimer = this.stateTimer;

    if (!this.isUserScrolling) {
      switch (s.behaviorState) {
        // IDLE: Resting posture with living respiration micro-bobs & observant glances
        case 'idle': {
          this.xSpring.target = this.xSpring.val;
          this.tiltSpring.target = 0;

          // Observant head angles
          const idleGaze = Math.sin(this.totalSimTime * 1.3) * 0.025;
          this.lookAngleTarget = idleGaze;

          if (this.stateTimer <= 0) {
            // Select next organic waypoint
            const nextWaypoint = this.pickNextWaypoint();
            this.targetWaypointX = nextWaypoint;

            // Determine needed facing: left = 1, right = -1
            const neededFacing: 1 | -1 = nextWaypoint > this.xSpring.val ? -1 : 1;

            if (neededFacing !== this.currentFacing) {
              // Smooth 3D turn first
              this.currentFacing = neededFacing;
              this.facingSpring.target = neededFacing;
              this.transitionTo('turn');
            } else {
              // Already facing target
              this.xSpring.target = nextWaypoint;
              this.transitionTo('walk');
            }
          }
          break;
        }

        // TURN: Smoothly rotates facing direction toward waypoint via 3D scale interpolation
        case 'turn': {
          this.tiltSpring.target = 0;
          this.facingSpring.target = this.currentFacing;

          const turnDelta = Math.abs(this.facingSpring.val - this.currentFacing);
          if (this.stateTimer <= 0 || turnDelta < 0.12) {
            this.xSpring.target = this.targetWaypointX;
            this.transitionTo('walk');
          }
          break;
        }

        // WALK: Kinematic locomotion with alternating footsteps & velocity-coupled dip
        case 'walk': {
          this.xSpring.target = this.targetWaypointX;
          const distToTarget = Math.abs(this.targetWaypointX - this.xSpring.val);
          const currentSpeed = Math.abs(this.xSpring.vel);

          // Biomechanical waddle tilt: dynamic travel lean + angular footfall roll
          const travelLean = Math.max(
            -cfg.maxLeanAngle,
            Math.min(cfg.maxLeanAngle, this.xSpring.vel * cfg.travelLeanGain)
          );
          const waddleSway = Math.sin(s.walkPhase) * cfg.waddleAmplitude;
          this.tiltSpring.target = travelLean + waddleSway;

          // Arrival condition: close to destination and decelerated, or timeout
          if ((distToTarget < 0.018 && currentSpeed < 0.035) || this.stateTimer <= 0) {
            this.xSpring.target = this.xSpring.val;
            this.tiltSpring.target = 0;
            this.transitionTo('pause');
          }
          break;
        }

        // PAUSE: Smooth deceleration into rest upon reaching waypoints
        case 'pause': {
          this.xSpring.target = this.xSpring.val;
          this.tiltSpring.target = 0;

          // Observant inspection of surroundings
          this.lookAngleTarget =
            (this.currentFacing > 0 ? 0.035 : -0.035) * Math.sin(this.stateTimer * 2.2);

          if (this.stateTimer <= 0) {
            this.transitionTo('idle');
          }
          break;
        }
      }
    }

    // 4. Update Spring-Damper Oscillators
    updateSpring(this.xSpring, safeDt);
    updateSpring(this.ySpring, safeDt);
    updateSpring(this.facingSpring, safeDt);
    updateSpring(this.tiltSpring, safeDt);

    // Soft velocity clamp
    if (Math.abs(this.xSpring.vel) > cfg.maxSpeed) {
      this.xSpring.vel = Math.sign(this.xSpring.vel) * cfg.maxSpeed;
    }

    // Clamping within stage boundaries
    if (this.xSpring.val < cfg.boundsMinX) {
      this.xSpring.val = cfg.boundsMinX;
      this.xSpring.vel = 0;
    } else if (this.xSpring.val > cfg.boundsMaxX) {
      this.xSpring.val = cfg.boundsMaxX;
      this.xSpring.vel = 0;
    }

    // Speed metrics
    const speed = Math.abs(this.xSpring.vel);
    s.forwardSpeed = speed;

    // Walk intensity blends smoothly with speed
    const targetIntensity = s.behaviorState === 'walk' ? Math.min(1.0, speed * 7.5 + 0.15) : 0.0;
    const blendRate = targetIntensity > s.walkIntensity ? 6.0 : 4.0;
    s.walkIntensity += (targetIntensity - s.walkIntensity) * (1 - Math.exp(-safeDt * blendRate));

    // Cadence adjusts smoothly with velocity
    s.walkCadence = Math.min(
      cfg.maxWalkFrequency,
      cfg.walkFrequencyBase + speed * cfg.walkCadenceGain
    );

    // Continuous walking phase integration
    if (s.walkIntensity > 0.01) {
      s.walkPhase += 2 * Math.PI * s.walkCadence * safeDt;
    }

    // Continuous respiration rhythm
    s.breathPhase += (2 * Math.PI / cfg.breathCycleDuration) * safeDt;
    const breathOffset = Math.sin(s.breathPhase) * 0.0018;

    // Alternating Foot Kinematics (parabolic lift curve: max(0, sin(phase))^2)
    const leftPhase = s.walkPhase;
    const rightPhase = s.walkPhase + Math.PI;

    s.leftFootLift =
      Math.pow(Math.max(0, Math.sin(leftPhase)), 2) * cfg.stepLiftMax * s.walkIntensity;
    s.rightFootLift =
      Math.pow(Math.max(0, Math.sin(rightPhase)), 2) * cfg.stepLiftMax * s.walkIntensity;

    s.leftFootGrounded = s.leftFootLift < 0.001;
    s.rightFootGrounded = s.rightFootLift < 0.001;

    // Stride displacement (forward/backward swing)
    s.leftFootStride = -Math.cos(leftPhase) * cfg.stepLength * s.walkIntensity;
    s.rightFootStride = -Math.cos(rightPhase) * cfg.stepLength * s.walkIntensity;

    // Footfall downward dip coupled to velocity
    const footfallDip =
      -Math.abs(Math.sin(s.walkPhase)) * cfg.bodyDipAmplitude * s.walkIntensity;

    // Synchronize Root & Torso State
    s.rootX = this.xSpring.val;
    s.rootY = this.ySpring.val;
    s.facingScale = this.facingSpring.val;
    s.tiltAngle = this.tiltSpring.val;

    s.torsoX = s.rootX;
    s.torsoY = s.rootY + footfallDip + breathOffset;
    s.torsoAngle = s.tiltAngle;

    s.leftFootX = s.rootX - cfg.footSpreadX + s.leftFootStride;
    s.leftFootY = s.rootY + 0.28 - s.leftFootLift;
    s.rightFootX = s.rootX + cfg.footSpreadX + s.rightFootStride;
    s.rightFootY = s.rootY + 0.28 - s.rightFootLift;

    // 5. Interactive Head Curiosity & Gaze Stabilization
    let targetGaze = this.lookAngleTarget;
    if (pointerState?.active && canvasWidth > 0 && canvasHeight > 0) {
      const headPixelX = s.torsoX * canvasWidth;
      const headPixelY = (s.torsoY - 0.22) * canvasHeight;
      const mdx = pointerState.x - headPixelX;
      const mdy = pointerState.y - headPixelY;
      const mdist = Math.hypot(mdx, mdy);

      if (mdist < 300 && mdist > 5) {
        targetGaze = Math.max(-0.065, Math.min(0.065, mdx / 400));
      }
    }

    s.curiousGazeAngle +=
      (targetGaze - s.curiousGazeAngle) * (1 - Math.exp(-safeDt * cfg.headSmoothSpeed));

    // Head counter-balances body roll to keep gaze steady
    const desiredHeadAngle = -s.torsoAngle * cfg.headSwayCounteract + s.curiousGazeAngle;
    s.headAngle += (desiredHeadAngle - s.headAngle) * (1 - Math.exp(-safeDt * 10.0));
    s.headAngle = Math.max(-cfg.maxHeadRotation, Math.min(cfg.maxHeadRotation, s.headAngle));

    s.headX = s.torsoX;
    s.headY = s.torsoY - 0.22;

    // 6. Flippers with Dynamic Harmonic Swing
    const flipperSway =
      Math.cos(s.walkPhase - cfg.flipperPhaseLag) * cfg.flipperAmplitude * s.walkIntensity;

    s.leftFlipperAngle = s.torsoAngle * 0.35 + flipperSway * 1.3;
    s.rightFlipperAngle = s.torsoAngle * 0.35 - flipperSway * 1.3;

    s.leftFlipperX = s.torsoX - 0.12;
    s.leftFlipperY = s.torsoY;
    s.rightFlipperX = s.torsoX + 0.12;
    s.rightFlipperY = s.torsoY;
  }

  /**
   * Reduced Motion Mode
   */
  private updateReducedMotion(dt: number): void {
    const s = this.state;
    const lerpSpeed = Math.min(1, dt * 3.0);

    s.rootX += (0.50 - s.rootX) * lerpSpeed;
    s.rootY += (PENGUIN_PHYSICS_CONFIG.groundBaselineY - s.rootY) * lerpSpeed;
    s.rootVx = 0;
    s.rootVy = 0;
    s.facingScale = 1.0;
    s.tiltAngle = 0;

    s.torsoX = s.rootX;
    s.torsoY = s.rootY;
    s.torsoAngle = 0;
    s.weightShiftX = 0;

    s.headX = s.rootX;
    s.headY = s.rootY - 0.22;
    s.headAngle = 0;
    s.isBlinking = false;

    s.leftFootX = s.rootX - PENGUIN_PHYSICS_CONFIG.footSpreadX;
    s.leftFootY = s.rootY + 0.28;
    s.rightFootX = s.rootX + PENGUIN_PHYSICS_CONFIG.footSpreadX;
    s.rightFootY = s.rootY + 0.28;

    s.walkIntensity = 0;
    s.forwardSpeed = 0;
    s.isPaused = true;
    s.behaviorState = 'idle';
  }

  /**
   * Exposes development diagnostics on window
   */
  private exposeDiagnostics(): void {
    if (typeof window === 'undefined') return;
    (window as any).__NEXUS_PENGUIN_DEBUG__ = {
      isAnimating: true,
      fps: this.calculatedFps,
      state: this.state.behaviorState,
      rootX: this.state.rootX.toFixed(3),
      rootY: this.state.rootY.toFixed(3),
      facingScale: this.state.facingScale.toFixed(3),
      tiltAngle: this.state.tiltAngle.toFixed(4),
      targetWaypointX: this.targetWaypointX.toFixed(3),
      speed: this.state.forwardSpeed.toFixed(4),
      walkIntensity: this.state.walkIntensity.toFixed(3),
      walkPhase: (this.state.walkPhase % (Math.PI * 2)).toFixed(2),
      scrollProgress: this.scrollProgress.toFixed(3),
    };
  }

  /**
   * Internal Debug Visualization
   */
  public drawDebug(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!PENGUIN_PHYSICS_CONFIG.DEBUG_PHYSICS) return;

    ctx.save();
    ctx.strokeStyle = '#EF5A2A';
    ctx.lineWidth = 1.5;

    // Target waypoint
    ctx.beginPath();
    ctx.arc(this.targetWaypointX * width, this.ySpring.val * height, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Body root
    ctx.fillStyle = '#0A0A09';
    ctx.beginPath();
    ctx.arc(this.state.rootX * width, this.state.rootY * height, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
