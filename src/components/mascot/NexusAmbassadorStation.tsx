/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { NexusPenguinSprite } from './NexusPenguinSprite.tsx';
import { PenguinFrameKey } from './penguinData.ts';

const SESSION_PAGEMAP_KEY = 'nexus_penguin_sighting_count';

export const NexusAmbassadorStation: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const stationRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  // States
  const [hasEntered, setHasEntered] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<PenguinFrameKey>('idle');
  const [connectionActive, setConnectionActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPostDragAnnoyed, setIsPostDragAnnoyed] = useState(false);
  const [hasRecognizedVisitor, setHasRecognizedVisitor] = useState(false);

  // Drag tracking
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastProximityReactionRef = useRef(0);
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Spring physics for physical drag resistance and snappy settle
  const springConfig = { damping: 22, stiffness: 260, mass: 0.75 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);
  const springRotate = useSpring(0, springConfig);

  const clearTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
  }, []);

  // Check if visitor has seen the mascot on earlier pages in this session
  const checkPreviousSightings = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = sessionStorage.getItem(SESSION_PAGEMAP_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      return Object.values(parsed).some((v) => Number(v) > 0);
    } catch {
      return false;
    }
  };

  // 1. Entrance Sequence on Intersection
  useEffect(() => {
    if (hasEntered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasEntered(true);
          startFooterSequence();
        }
      },
      { threshold: 0.35 }
    );

    if (stationRef.current) {
      observer.observe(stationRef.current);
    }

    return () => observer.disconnect();
  }, [hasEntered]);

  const startFooterSequence = () => {
    const hasSeenBefore = checkPreviousSightings();
    setHasRecognizedVisitor(hasSeenBefore);

    if (shouldReduceMotion) {
      setCurrentFrame('idle');
      setConnectionActive(true);
      return;
    }

    // Step 1: True walking step cycle into position (alternating feet + body bob)
    // walk_1 -> walk_2 -> walk_1 -> walk_2 -> walk_1
    setCurrentFrame('walk_1');
    const t1 = setTimeout(() => setCurrentFrame('walk_2'), 250);
    const t2 = setTimeout(() => setCurrentFrame('walk_1'), 500);
    const t3 = setTimeout(() => setCurrentFrame('walk_2'), 750);
    const t4 = setTimeout(() => setCurrentFrame('walk_1'), 1000);

    // Step 2: Stop and look around
    const t5 = setTimeout(() => setCurrentFrame('idle'), 1250);
    const t6 = setTimeout(() => setCurrentFrame('look_right'), 1600);

    // Step 3: Notice orange connection point & approach/touch it
    const t7 = setTimeout(() => {
      setCurrentFrame('nexus_touch');
      setConnectionActive(true);
    }, 2200);

    // Step 4: Connection pulse event (600ms) -> penguin reacts with happy wave
    const t8 = setTimeout(() => {
      // If recognized visitor from earlier pages: subtle recognition head tilt first!
      if (hasSeenBefore) {
        setCurrentFrame('curious');
      } else {
        setCurrentFrame('wave_smile');
      }
    }, 2850);

    const t9 = setTimeout(() => {
      if (hasSeenBefore) {
        setCurrentFrame('wave_smile');
      }
    }, 3400);

    // Step 5: Settle into calm idle
    const t10 = setTimeout(() => {
      setCurrentFrame('idle');
    }, 4200);

    animationTimeoutsRef.current.push(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10);
  };

  // 2. Idle Micro-Motions (Blinking in 3.5-6s range, tiny look-arounds)
  useEffect(() => {
    if (!hasEntered || isDragging || isPostDragAnnoyed) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextIdleMotion = () => {
      // Randomized 3.5 to 5.8 second interval
      const delay = 3500 + Math.random() * 2300;

      timeoutId = setTimeout(() => {
        if (!isDragging && !isPostDragAnnoyed) {
          const roll = Math.random();

          if (roll < 0.45) {
            // Natural blink (sometimes a double-blink)
            setCurrentFrame('blink');
            setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) {
                if (Math.random() < 0.25) {
                  // Occasional double-blink
                  setTimeout(() => {
                    if (!isDragging && !isPostDragAnnoyed) {
                      setCurrentFrame('blink');
                      setTimeout(() => {
                        if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
                      }, 120);
                    }
                  }, 140);
                } else {
                  setCurrentFrame('idle');
                }
              }
            }, 140);
          } else if (roll < 0.7) {
            // Glance slightly left or right
            const glance = roll < 0.58 ? 'look_left' : 'look_right';
            setCurrentFrame(glance);
            setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
            }, 750);
          } else if (roll < 0.88) {
            // Subtle curious head tilt
            setCurrentFrame('curious');
            setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
            }, 850);
          }
        }
        scheduleNextIdleMotion();
      }, delay);
    };

    scheduleNextIdleMotion();

    return () => clearTimeout(timeoutId);
  }, [hasEntered, isDragging, isPostDragAnnoyed]);

  // 3. Pointer Down: Start Drag Interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    clearTimeouts();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setIsPostDragAnnoyed(false);

    // Initial 0-120ms "Oh no!" realization expression
    setCurrentFrame('struggle_start');
  };

  // 4. Pointer Move: Spring lag physical resistance & directional struggle
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // A. Cursor Awareness while hovering over the station platform (not dragging)
    if (!isDragging || !dragStartRef.current) {
      if (hasEntered && !isPostDragAnnoyed && stationRef.current) {
        const rect = stationRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        // Proximity reaction with cooldown (2.5s)
        const now = Date.now();
        if (now - lastProximityReactionRef.current > 2500 && Math.random() < 0.3) {
          lastProximityReactionRef.current = now;
          if (relY < rect.height * 0.4) {
            setCurrentFrame('look_up');
            setTimeout(() => {
              if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
            }, 600);
            return;
          }
        }

        // Tracking gaze
        if (relX < rect.width * 0.38) {
          setCurrentFrame('look_left');
        } else if (relX > rect.width * 0.62) {
          setCurrentFrame('look_right');
        } else if (relY < rect.height * 0.35) {
          setCurrentFrame('look_up');
        } else {
          setCurrentFrame('idle');
        }
      }
      return;
    }

    // B. Physical Drag Calculations with Spring Resistance
    const rawDeltaX = e.clientX - dragStartRef.current.x;
    const rawDeltaY = e.clientY - dragStartRef.current.y;

    // Resistance factor (0.68) with strictly clamped platform bounds
    const maxHorizontal = 90;
    const maxVerticalUp = -55;
    const maxVerticalDown = 35;

    const clampedX = Math.max(-maxHorizontal, Math.min(maxHorizontal, rawDeltaX * 0.68));
    const clampedY = Math.max(maxVerticalUp, Math.min(maxVerticalDown, rawDeltaY * 0.68));

    springX.set(clampedX);
    springY.set(clampedY);

    // Directional struggle animation
    if (Math.abs(clampedX) >= Math.abs(clampedY)) {
      if (clampedX > 12) {
        // Pulled to the right -> leans left, left foot braced, wings resist
        setCurrentFrame('struggle_left');
        springRotate.set(shouldReduceMotion ? 0 : -8);
      } else if (clampedX < -12) {
        // Pulled to the left -> leans right, right foot braced, wings resist
        setCurrentFrame('struggle_right');
        springRotate.set(shouldReduceMotion ? 0 : 8);
      } else {
        setCurrentFrame('struggle_start');
        springRotate.set(0);
      }
    } else {
      if (clampedY < -12) {
        // Pulled upward -> legs kicking down
        setCurrentFrame('struggle_up');
        springRotate.set(0);
      } else if (clampedY > 12) {
        // Pulled downward -> body leaning up
        setCurrentFrame('struggle_down');
        springRotate.set(0);
      } else {
        setCurrentFrame('struggle_start');
        springRotate.set(0);
      }
    }
  };

  // 5. Pointer Up / Cancel: Snappy Release -> Land/Recover -> Annoyed -> Idle
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(false);
    dragStartRef.current = null;

    // Release spring back to origin
    springX.set(0);
    springY.set(0);
    springRotate.set(0);

    // Choreographed Release Sequence:
    // Step 1: Lands on feet & shakes off feathers (350ms)
    setCurrentFrame('recover');
    setIsPostDragAnnoyed(true);

    // Step 2: Signature Annoyed state (crossed wings, sideways glance / pout, 1.2s)
    const t1 = setTimeout(() => {
      setCurrentFrame('annoyed');
    }, 380);

    // Step 3: Brief glance at visitor + return to calm idle
    const t2 = setTimeout(() => {
      setCurrentFrame('look_left');
    }, 1550);

    const t3 = setTimeout(() => {
      setCurrentFrame('idle');
      setIsPostDragAnnoyed(false);
    }, 2100);

    animationTimeoutsRef.current.push(t1, t2, t3);
  };

  return (
    <section
      id="nexus-ambassador-station"
      aria-label="NEXUS Official Brand Mascot Station"
      className="w-full bg-[#110F0E] text-[#F3EEE5] py-10 sm:py-14 border-t border-[rgba(243,238,229,0.08)] select-none"
    >
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Station Editorial Descriptor */}
          <div className="space-y-2 max-w-md text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(239,90,42,0.12)] border border-[rgba(239,90,42,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A] animate-pulse" />
              <span className="font-dosis text-[11px] font-bold tracking-[0.25em] text-[#EF5A2A] uppercase">
                COMMUNITY AMBASSADOR
              </span>
            </div>
            <h3 className="font-dosis text-xl sm:text-2xl font-bold uppercase tracking-[0.14em] text-[#F3EEE5]">
              THE NEXUS PENGUIN
            </h3>
            <p className="font-bitter text-xs sm:text-sm text-[#F3EEE5]/70 leading-relaxed">
              Our resident pixel-art mascot and companion. Built with authentic character physics,
              spatial curiosity, and playful resistance.
            </p>
          </div>

          {/* Minimalist NEXUS Ground Platform */}
          <div
            ref={stationRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              if (!isDragging && !isPostDragAnnoyed) setCurrentFrame('idle');
            }}
            className="relative w-full max-w-[340px] sm:max-w-[380px] h-[160px] bg-[#0A0908] border border-[rgba(243,238,229,0.12)] hover:border-[rgba(239,90,42,0.4)] transition-colors duration-300 px-6 pt-5 pb-4 flex flex-col justify-between overflow-visible"
          >
            {/* Subtle Station Grid Texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(243, 238, 229, 0.3) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Station Header & Node Connection Status */}
            <div className="relative z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#F3EEE5]/40 tracking-wider">
                  SYS_MASCOT // V2.6
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-dosis text-xs font-bold tracking-widest text-[#EF5A2A] uppercase">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDragging
                      ? 'bg-[#E63946] animate-ping'
                      : connectionActive
                      ? 'bg-[#EF5A2A]'
                      : 'bg-[#555]'
                  }`}
                />
                <span>{isDragging ? 'STRUGGLING' : connectionActive ? 'LINKED' : 'STANDBY'}</span>
              </div>
            </div>

            {/* Dynamic Geometric Orange Connection Line Effect */}
            <svg
              className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${
                connectionActive ? 'opacity-100' : 'opacity-0'
              }`}
              viewBox="0 0 380 160"
            >
              <line
                x1="110"
                y1="115"
                x2="235"
                y2="115"
                stroke="#EF5A2A"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="opacity-50"
              />
              <line
                x1="235"
                y1="115"
                x2="310"
                y2="55"
                stroke="#EF5A2A"
                strokeWidth="1"
                className="opacity-40"
              />
              <circle cx="235" cy="115" r="2.5" fill="#EF5A2A" />
              <circle cx="310" cy="55" r="3" fill="#EF5A2A" />
              <circle
                cx="110"
                cy="115"
                r="4.5"
                fill="none"
                stroke="#EF5A2A"
                strokeWidth="1"
                className="animate-ping opacity-35 origin-center"
              />
              <circle cx="110" cy="115" r="2" fill="#EF5A2A" />
            </svg>

            {/* Character Stage & Grounding Platform */}
            <div className="relative z-20 flex items-end justify-between h-full pt-2">
              {/* Draggable Mascot Character (Scale ~3.2x) */}
              <div className="relative" style={{ minWidth: '70px', minHeight: '85px' }}>
                {/* Dynamic Pixel Shadow Underneath */}
                <motion.div
                  style={{
                    x: springX,
                    opacity: isDragging ? 0.35 : 0.65,
                    scaleX: isDragging ? 0.8 : 1,
                  }}
                  className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-14 h-2 bg-[#000000] rounded-full filter blur-[1px] pointer-events-none"
                />

                <motion.div
                  ref={characterRef}
                  style={{
                    x: springX,
                    y: springY,
                    rotate: springRotate,
                    touchAction: 'none',
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`relative select-none ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  } focus:outline-none`}
                  title="NEXUS Mascot — Drag and pull to play!"
                  aria-label="NEXUS Mascot Character"
                >
                  <NexusPenguinSprite
                    frame={currentFrame}
                    scale={3.2}
                    className="filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              </div>

              {/* Minimalist Right Status Indicator */}
              <div className="flex flex-col items-end text-right space-y-1 pb-1 pointer-events-none">
                <span className="font-mono text-[9px] text-[#F3EEE5]/40 tracking-widest uppercase">
                  INTERACTION
                </span>
                <span className="font-dosis font-bold text-[11px] text-[#F3EEE5]/80 tracking-wider uppercase">
                  {isDragging
                    ? 'RESISTING PULL'
                    : isPostDragAnnoyed
                    ? 'ANNOYED'
                    : hasRecognizedVisitor
                    ? 'RECOGNIZES VISITOR'
                    : 'AWARE & CURIOUS'}
                </span>
                <span className="text-[10px] font-mono tracking-wider text-[#EF5A2A]/70 uppercase pt-0.5">
                  {isDragging ? 'RELEASE TO SETTLE' : 'GRAB & PULL'}
                </span>
              </div>
            </div>

            {/* Crisp Ground Baseline Line */}
            <div className="absolute bottom-3.5 left-6 right-6 h-[1px] bg-[rgba(243,238,229,0.14)] pointer-events-none" />
          </div>
        </div>
      </Container>
    </section>
  );
};
