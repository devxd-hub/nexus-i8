/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PenguinFrameKey } from './penguinData.ts';

export type PenguinMotionState = 'idle' | 'walk' | 'pause' | 'turn';

export interface Spring1D {
  val: number;
  vel: number;
  target: number;
  omega: number; // natural frequency (rad/s)
  zeta: number;  // damping ratio (~0.85 - 1.0 = smooth/critical damping)
}

export function createSpring(initial: number, omega: number = 5.0, zeta: number = 0.92): Spring1D {
  return {
    val: initial,
    vel: 0,
    target: initial,
    omega,
    zeta,
  };
}

/**
 * Step a 1D spring-damper system forward by dt seconds
 * Equation of motion: a = omega^2 * (target - val) - 2 * zeta * omega * vel
 */
export function updateSpring(spring: Spring1D, dt: number): void {
  const f = spring.omega * spring.omega * (spring.target - spring.val);
  const d = 2.0 * spring.zeta * spring.omega * spring.vel;
  const a = f - d;
  spring.vel += a * dt;
  spring.val += spring.vel * dt;
}

export interface PenguinAutonomousContext {
  state: PenguinMotionState;
  stateTimer: number;

  // Springs
  xSpring: Spring1D;
  ySpring: Spring1D;
  facingSpring: Spring1D;
  tiltSpring: Spring1D;

  // Kinematics & Animation
  facing: 1 | -1; // 1 = right, -1 = left
  walkPhase: number;
  lifeTime: number;
  currentFrame: PenguinFrameKey;
  
  // Waypoint
  targetWaypointX: number;
  
  // Interactive / Emotion overrides
  isInteracting: boolean;
  interactionTimer: number;
  blinkTimer: number;
  isBlinking: boolean;

  // Viewport bounds
  minX: number;
  maxX: number;
}

export const PENGUIN_PHYSICS_CONFIG = {
  // Physical parameters
  xOmega: 4.2,          // Horizontal travel natural frequency
  xZeta: 0.94,          // Damping ratio (critically damped, zero overshoot)
  maxSpeed: 130,        // Max walking speed in px/s
  
  yOmega: 6.8,          // Vertical peek emergence natural frequency
  yZeta: 0.92,
  
  facingOmega: 13.0,    // Turning speed
  facingZeta: 0.96,
  
  tiltOmega: 14.0,      // Dynamic waddle tilt response
  tiltZeta: 0.88,
  
  // State durations (seconds)
  idleDurationMin: 2.2,
  idleDurationMax: 4.0,
  
  pauseDurationMin: 1.6,
  pauseDurationMax: 3.2,
  
  turnDuration: 0.35,
  
  // Step parameters
  stepFrequency: 6.0,   // rad/s cadence
  waddleAngleDeg: 5.5,  // waddle tilt degrees
  bodyDipPx: 2.2,       // downward dip on footfall
};

/**
 * Initializes context for autonomous movement along the screen bottom
 */
export function createPenguinContext(initialX: number, minX: number, maxX: number): PenguinAutonomousContext {
  const cfg = PENGUIN_PHYSICS_CONFIG;
  return {
    state: 'idle',
    stateTimer: 2.5,

    xSpring: createSpring(initialX, cfg.xOmega, cfg.xZeta),
    ySpring: createSpring(80, cfg.yOmega, cfg.yZeta), // starts tucked below edge (y=80)
    facingSpring: createSpring(initialX > (minX + maxX) / 2 ? -1 : 1, cfg.facingOmega, cfg.facingZeta),
    tiltSpring: createSpring(0, cfg.tiltOmega, cfg.tiltZeta),

    facing: initialX > (minX + maxX) / 2 ? -1 : 1,
    walkPhase: 0,
    lifeTime: 0,
    currentFrame: 'peek_bottom',

    targetWaypointX: initialX,
    isInteracting: false,
    interactionTimer: 0,
    blinkTimer: 2.8,
    isBlinking: false,

    minX,
    maxX,
  };
}

/**
 * Selects an organic waypoint along the bottom edge, reasonably separated from current pos.
 */
export function pickNextWaypoint(ctx: PenguinAutonomousContext): number {
  const span = ctx.maxX - ctx.minX;
  if (span <= 60) return (ctx.minX + ctx.maxX) / 2;

  // Try up to 6 times to pick a waypoint at least 60px away
  for (let i = 0; i < 6; i++) {
    const candidate = ctx.minX + Math.random() * span;
    if (Math.abs(candidate - ctx.xSpring.val) > 70) {
      return candidate;
    }
  }

  // Fallback: opposite side of current position
  return ctx.xSpring.val > (ctx.minX + ctx.maxX) / 2
    ? ctx.minX + span * 0.25
    : ctx.minX + span * 0.75;
}

/**
 * Core Autonomous State Machine Update
 * Evaluates state transitions (idle, walk, pause, turn), updates physics springs,
 * and chooses the fluid, non-robotic visual frame.
 */
export function updatePenguinStateMachine(
  ctx: PenguinAutonomousContext,
  dt: number,
  isEmerging: boolean,
  isRetreating: boolean
): {
  posX: number;
  posY: number;
  scaleX: number;
  tiltDeg: number;
  frame: PenguinFrameKey;
} {
  const cfg = PENGUIN_PHYSICS_CONFIG;
  ctx.lifeTime += dt;

  // --- Vertical Emergence / Retreat Management ---
  if (isRetreating) {
    ctx.ySpring.target = 90; // Duck down below viewport
  } else if (isEmerging) {
    ctx.ySpring.target = 0; // Stand grounded at bottom edge
  }

  // --- Natural Eye Blinking Rhythm ---
  ctx.blinkTimer -= dt;
  if (ctx.blinkTimer <= 0) {
    ctx.isBlinking = true;
    if (ctx.blinkTimer <= -0.15) {
      ctx.isBlinking = false;
      ctx.blinkTimer = 2.4 + Math.random() * 2.8;
    }
  }

  // --- Handle Interactive Moment Overrides (e.g. click/hover) ---
  if (ctx.isInteracting) {
    ctx.interactionTimer -= dt;
    if (ctx.interactionTimer <= 0) {
      ctx.isInteracting = false;
      ctx.state = 'idle';
      ctx.stateTimer = 1.8;
    }
  }

  // --- Autonomous Motion State Machine ---
  if (!ctx.isInteracting && isEmerging && !isRetreating) {
    ctx.stateTimer -= dt;

    switch (ctx.state) {
      // 1. IDLE: Balanced resting presence, natural breath, looking around
      case 'idle': {
        ctx.xSpring.target = ctx.xSpring.val;
        ctx.tiltSpring.target = 0;

        if (ctx.stateTimer <= 0) {
          // Time to move! Pick a new waypoint
          const nextTarget = pickNextWaypoint(ctx);
          ctx.targetWaypointX = nextTarget;
          const neededFacing: 1 | -1 = nextTarget > ctx.xSpring.val ? 1 : -1;

          if (neededFacing !== ctx.facing) {
            // Need to turn first
            ctx.state = 'turn';
            ctx.stateTimer = cfg.turnDuration;
            ctx.facing = neededFacing;
            ctx.facingSpring.target = neededFacing;
          } else {
            // Already facing the waypoint
            ctx.state = 'walk';
            ctx.xSpring.target = nextTarget;
            ctx.stateTimer = 6.0; // max walk safety duration
          }
        }
        break;
      }

      // 2. TURN: Smooth rotation to face the intended travel direction
      case 'turn': {
        ctx.tiltSpring.target = 0;
        ctx.facingSpring.target = ctx.facing;

        if (ctx.stateTimer <= 0) {
          // Turn complete, begin walking toward destination
          ctx.state = 'walk';
          ctx.xSpring.target = ctx.targetWaypointX;
          ctx.stateTimer = 6.0;
        }
        break;
      }

      // 3. WALK: Locomotion along bottom baseline driven by spring-damper
      case 'walk': {
        ctx.xSpring.target = ctx.targetWaypointX;
        const distToTarget = Math.abs(ctx.targetWaypointX - ctx.xSpring.val);
        const speed = Math.abs(ctx.xSpring.vel);

        // Step cadence and continuous walk phase
        ctx.walkPhase += dt * (speed * 0.08 + cfg.stepFrequency);

        // Dynamic tilt into movement + subtle waddle roll
        const waddleSway = Math.sin(ctx.walkPhase) * cfg.waddleAngleDeg;
        const travelLean = Math.max(-3.5, Math.min(3.5, ctx.xSpring.vel * 0.03));
        ctx.tiltSpring.target = (travelLean + waddleSway) * ctx.facing;

        // Arrival condition: close to target and smoothly decelerated
        if ((distToTarget < 5 && speed < 16) || ctx.stateTimer <= 0) {
          ctx.state = 'pause';
          ctx.stateTimer = cfg.pauseDurationMin + Math.random() * (cfg.pauseDurationMax - cfg.pauseDurationMin);
          ctx.xSpring.target = ctx.xSpring.val;
          ctx.tiltSpring.target = 0;
        }
        break;
      }

      // 4. PAUSE: Decelerated plateau, observant, inspecting the surroundings
      case 'pause': {
        ctx.xSpring.target = ctx.xSpring.val;
        ctx.tiltSpring.target = 0;

        if (ctx.stateTimer <= 0) {
          // Transition to calm idle or continue wandering
          ctx.state = 'idle';
          ctx.stateTimer = cfg.idleDurationMin + Math.random() * (cfg.idleDurationMax - cfg.idleDurationMin);
        }
        break;
      }
    }
  }

  // --- Step Physics Springs ---
  updateSpring(ctx.xSpring, dt);
  updateSpring(ctx.ySpring, dt);
  updateSpring(ctx.facingSpring, dt);
  updateSpring(ctx.tiltSpring, dt);

  // Soft speed clamp on horizontal velocity for smooth biological motion
  if (Math.abs(ctx.xSpring.vel) > cfg.maxSpeed) {
    ctx.xSpring.vel = Math.sign(ctx.xSpring.vel) * cfg.maxSpeed;
  }

  // Clamping within viewport limits
  if (ctx.xSpring.val < ctx.minX) {
    ctx.xSpring.val = ctx.minX;
    ctx.xSpring.vel = 0;
  } else if (ctx.xSpring.val > ctx.maxX) {
    ctx.xSpring.val = ctx.maxX;
    ctx.xSpring.vel = 0;
  }

  // --- Calculate Visual Coordinate Offsets ---
  let visualY = ctx.ySpring.val;

  // If walking: step dip on footfalls
  if (ctx.state === 'walk' && Math.abs(ctx.xSpring.vel) > 8) {
    visualY += Math.abs(Math.sin(ctx.walkPhase)) * cfg.bodyDipPx;
  } else if (ctx.ySpring.val < 5) {
    // Subtle living respiration breath when standing
    visualY += Math.sin(ctx.lifeTime * 2.3) * 0.9;
  }

  // --- Determine Visual Pixel Frame ---
  let selectedFrame: PenguinFrameKey = 'idle';

  if (ctx.ySpring.val > 25) {
    // Peeking over edge
    selectedFrame = 'peek_bottom';
  } else if (ctx.isInteracting) {
    selectedFrame = ctx.interactionTimer > 1.0 ? 'wave_smile' : 'happy';
  } else if (ctx.isBlinking) {
    selectedFrame = 'blink';
  } else {
    switch (ctx.state) {
      case 'idle': {
        // Natural subtle variety during idle
        const idleCycle = (ctx.lifeTime * 0.4) % 6;
        if (idleCycle > 4.8) {
          selectedFrame = 'curious';
        } else if (idleCycle > 3.2 && idleCycle < 4.0) {
          selectedFrame = ctx.facing > 0 ? 'look_right' : 'look_left';
        } else {
          selectedFrame = 'idle';
        }
        break;
      }

      case 'turn': {
        // Glance in turn direction
        selectedFrame = ctx.facing > 0 ? 'look_right' : 'look_left';
        break;
      }

      case 'walk': {
        // Alternating footstep walk frames
        selectedFrame = Math.sin(ctx.walkPhase) > 0 ? 'walk_1' : 'walk_2';
        break;
      }

      case 'pause': {
        // Observant glance or inspecting ground
        const pauseCycle = ctx.stateTimer % 2.0;
        if (pauseCycle > 1.2) {
          selectedFrame = 'inspect';
        } else if (pauseCycle > 0.6) {
          selectedFrame = ctx.facing > 0 ? 'look_left' : 'look_right';
        } else {
          selectedFrame = 'idle';
        }
        break;
      }
    }
  }

  ctx.currentFrame = selectedFrame;

  return {
    posX: ctx.xSpring.val,
    posY: visualY,
    scaleX: ctx.facingSpring.val,
    tiltDeg: ctx.tiltSpring.val,
    frame: selectedFrame,
  };
}
