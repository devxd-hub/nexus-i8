/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { InteractiveNexusX } from '../brand/NexusLogo.tsx';

export const Act01XApproach: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Unified scroll progress across the pinned cinematic intro scene
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Stage 1: X Approaching (0 to 0.35)
  const xScale = useTransform(scrollYProgress, [0, 0.25, 0.45, 0.65], [1, 2.2, 4.5, 7]);
  const xOpacity = useTransform(scrollYProgress, [0, 0.35, 0.55], [1, 0.9, 0]);
  const initialCoordOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Stage 2: Orange Radiation & Engulfing (0.15 to 0.65)
  const orangeFieldOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.7, 0.95], [0, 1, 1, 0]);
  const orangeRadius = useTransform(scrollYProgress, [0.05, 0.35], ['0%', '160%']);

  // Stage 3: Negative Space X Inside Orange (0.3 to 0.6)
  const negativeXOpacity = useTransform(scrollYProgress, [0.28, 0.42, 0.55], [0, 1, 0]);
  const negativeXScale = useTransform(scrollYProgress, [0.28, 0.42, 0.55], [0.85, 1, 1.25]);

  // Stage 4: Typography Emerging from within the Orange (0.45 to 0.95)
  const textEmergenceOpacity = useTransform(scrollYProgress, [0.48, 0.65, 0.88, 1], [0, 1, 1, 0.8]);
  const textEmergenceY = useTransform(scrollYProgress, [0.48, 0.68], [60, 0]);
  const textEmergenceScale = useTransform(scrollYProgress, [0.48, 0.68], [0.94, 1]);

  return (
    <section
      id="act-01-the-x"
      ref={containerRef}
      className="relative h-[320vh] w-full bg-[#F3EEE5]"
    >
      {/* Pinned Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center select-none">
        {/* Background Architectural Grid Lines */}
        <motion.div
          style={{ opacity: initialCoordOpacity }}
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(#0A0A09_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]"
        />

        {/* Dynamic Expanding Orange Radiation Layer */}
        <motion.div
          style={{
            opacity: shouldReduceMotion ? 1 : orangeFieldOpacity,
            background: 'radial-gradient(circle at center, #EF5A2A 0%, #E34818 55%, #D43E0F 100%)',
          }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          {/* Subtle Fine Grain Texture */}
          <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px]" />
        </motion.div>

        {/* Minimal Initial Editorial Coordinates & Metadata */}
        <motion.div
          style={{ opacity: initialCoordOpacity }}
          className="absolute top-8 left-8 right-8 flex items-center justify-between font-mono text-[11px] text-[#66615A] tracking-wider pointer-events-none z-30"
        >
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#0A0A09] text-[#F3EEE5] font-bold text-[10px] uppercase">
              CHAPTER 01 // 07
            </span>
            <span className="uppercase font-semibold">THE INTERSECTION POINT</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>ORIGIN // EST. 2024</span>
            <span className="w-1.5 h-1.5 bg-[#EF5A2A] rounded-full" />
            <span>NEXUS STUDIO COLLECTIVE</span>
          </div>
        </motion.div>

        {/* Central Approaching NEXUS X Construct */}
        <motion.div
          style={{
            scale: shouldReduceMotion ? 1 : xScale,
            opacity: shouldReduceMotion ? 1 : xOpacity,
          }}
          className="relative z-20 flex items-center justify-center p-8 pointer-events-none"
        >
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center">
            <InteractiveNexusX size="2xl" />

            {/* Glowing Orange Pulse radiating from geometry */}
            <motion.div
              style={{
                width: orangeRadius,
                height: orangeRadius,
              }}
              className="absolute rounded-full bg-[#EF5A2A]/40 blur-3xl pointer-events-none -z-10"
            />
          </div>
        </motion.div>

        {/* Negative Space X Silhouette inside the Orange Field */}
        <motion.div
          style={{
            opacity: shouldReduceMotion ? 0 : negativeXOpacity,
            scale: shouldReduceMotion ? 1 : negativeXScale,
          }}
          className="absolute z-25 pointer-events-none flex flex-col items-center justify-center text-center p-6"
        >
          <div className="font-fraunces font-bold text-7xl sm:text-9xl md:text-[13rem] text-white/95 tracking-tighter mix-blend-screen select-none drop-shadow-sm">
            ✕
          </div>
          <span className="font-dosis text-xs sm:text-sm font-bold tracking-[0.35em] uppercase text-white/90 mt-2">
            WHERE DISCIPLINES CONVERGE
          </span>
        </motion.div>

        {/* Words Emerging From Within the Orange Field */}
        <motion.div
          style={{
            opacity: shouldReduceMotion ? 1 : textEmergenceOpacity,
            y: shouldReduceMotion ? 0 : textEmergenceY,
            scale: shouldReduceMotion ? 1 : textEmergenceScale,
          }}
          className="absolute z-30 max-w-4xl mx-auto px-6 sm:px-12 text-center flex flex-col items-center justify-center space-y-6 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-mono text-xs uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>THE MANIFESTO</span>
          </div>

          <h1 className="font-fraunces font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight">
            Ideas are better together.
            <span className="block italic font-normal text-white/90 text-2xl sm:text-4xl md:text-5xl mt-2">
              We had questions.
            </span>
          </h1>

          <p className="font-bitter text-base sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl font-light">
            NEXUS is a student-founded collective that rejects the separation between technical
            engineering and artistic craft. We build software, physical instruments, and digital
            experiences where code meets human curiosity.
          </p>
        </motion.div>

        {/* Bottom Minimal Scroll Prompt */}
        <motion.div
          style={{ opacity: initialCoordOpacity }}
          className="absolute bottom-10 flex flex-col items-center gap-2 pointer-events-none font-mono text-[10px] text-[#66615A] tracking-widest uppercase z-30"
        >
          <span>SCROLL TO ENTER STORY</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-6 bg-[#EF5A2A] rounded-full"
          />
        </motion.div>
      </div>
    </section>
  );
};
