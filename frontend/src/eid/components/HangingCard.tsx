import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { TeamMember } from '../types';
import { TeamCard } from './TeamCard';

interface HangingCardProps {
  member: TeamMember;
  breezeTrigger: number;
  index?: number;
  isFlipped?: boolean;
  onFlipToggle?: () => void;
  onShare?: () => void;
}

export const HangingCard: React.FC<HangingCardProps> = ({
  member,
  breezeTrigger,
  isFlipped,
  onFlipToggle,
  onShare,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { strapHeight, rotation, offsetY, slotIndex } = member.positioning;

  // Individual physical air dynamic parameters (unique per card to prevent synchronization)
  const physics = useMemo(() => {
    // Calibrated slow oscillation cycle (between 7.0s and 9.5s)
    const durations = [7.8, 8.4, 9.2, 8.0, 7.4, 8.8];
    const duration = durations[(slotIndex - 1) % durations.length] || 8.0;

    // Phase offset
    const phaseOffset = ((slotIndex * 1.25) % 2.5);

    return {
      duration,
      phaseOffset,
      // Microscopic atmospheric rotation (under 0.5 degrees)
      rotateKeyframes: [
        rotation,
        rotation - 0.42,
        rotation + 0.28,
        rotation - 0.18,
        rotation,
      ],
      // Microscopic vertical drift (under 2px)
      vertKeyframes: [
        offsetY,
        offsetY + 1.8,
        offsetY + 0.3,
        offsetY + 1.2,
        offsetY,
      ],
      // Barely perceptible horizontal drift
      horizKeyframes: [
        0,
        -0.4,
        0.3,
        -0.15,
        0,
      ],
    };
  }, [rotation, offsetY, slotIndex]);

  // Determine current animation state based on entrance, hover, breeze, or resting air sway
  const getAnimationState = () => {
    // If reduced motion is requested, stay completely static without floating loops
    if (shouldReduceMotion) {
      return {
        opacity: 1,
        y: offsetY,
        x: 0,
        rotate: rotation,
      };
    }

    // Hover: quiet lift & stabilization with high-damping curve
    if (isHovered) {
      return {
        opacity: 1,
        y: offsetY - 3,
        x: 0,
        rotate: rotation * 0.75,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
      };
    }

    // Prior to entrance settling, return resting base
    if (!hasSettled) {
      return {
        opacity: 1,
        y: offsetY,
        x: 0,
        rotate: rotation,
      };
    }

    // Continuous subtle ambient hanging air response
    return {
      opacity: 1,
      y: physics.vertKeyframes,
      x: physics.horizKeyframes,
      rotate: physics.rotateKeyframes,
      transition: {
        duration: physics.duration,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut' as const,
        delay: physics.phaseOffset,
      },
    };
  };

  return (
    <div
      id={`hanging-assembly-${member.id}`}
      className="flex flex-col items-center relative z-10 select-none"
    >
      {/* ================= 1. TOP ANCHOR POINT ================= */}
      {/* Precision ceiling mount clamp anchored firmly to the suspension rail */}
      <div className="relative flex flex-col items-center z-30 pointer-events-none">
        {/* Horizontal rail attachment bracket - bead-blasted dark gunmetal */}
        <div className="w-8 h-3 bg-[#141414] border border-white/[0.12] rounded-t-xs flex items-center justify-center shadow-xs">
          {/* Hex bolt pin */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
        </div>

        {/* Metal swivel eyelet loop */}
        <div className="w-6 h-2 bg-[#0E0E0E] border border-white/[0.08] rounded-b-xs flex items-center justify-center -mt-0.5">
          <div className="w-4 h-0.5 rounded-full bg-[#242424]" />
        </div>
      </div>

      {/* ================= 2. PHYSICAL SWAY ASSEMBLY ================= */}
      {/* Single continuous pendulum with transform-origin at the ceiling clamp */}
      <motion.div
        className="flex flex-col items-center origin-top relative will-change-transform"
        initial={
          shouldReduceMotion
            ? { opacity: 1, y: offsetY, rotate: rotation }
            : {
                opacity: 0,
                y: -14,
                rotate: rotation * 1.3,
              }
        }
        whileInView={
          shouldReduceMotion
            ? { opacity: 1, y: offsetY, rotate: rotation }
            : {
                opacity: 1,
                y: offsetY,
                rotate: rotation,
              }
        }
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
        viewport={{ once: true, margin: '-20px' }}
        onAnimationComplete={() => {
          setHasSettled(true);
        }}
        animate={getAnimationState()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        key={`breeze-${breezeTrigger}-${member.id}`}
      >
        {/* ================= 3. WHITE STRAP (LANYARD) ================= */}
        {/* Substantial, thick matte woven lanyard ribbon */}
        <div
          id={`strap-${member.id}`}
          style={{ height: `${strapHeight}px` }}
          className="w-[22px] relative flex flex-col items-center"
        >
          {/* The white lanyard webbing */}
          <div className="w-full h-full lanyard-strap relative rounded-xxs overflow-hidden">
            {/* Fine edge stitching seams */}
            <div className="absolute inset-y-0 left-1 w-[1px] bg-black/15" />
            <div className="absolute inset-y-0 right-1 w-[1px] bg-black/15" />

            {/* Fine woven twill texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(60deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 0, transparent 3px), repeating-linear-gradient(-60deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 0, transparent 3px)',
                backgroundSize: '4px 4px',
              }}
            />
          </div>

          {/* Clean, controlled strap cast shadow against background */}
          <div className="absolute -right-2.5 inset-y-0 w-2.5 pointer-events-none opacity-30 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        {/* ================= 4. BOTTOM CLASP HARDWARE ================= */}
        {/* Metallic lanyard clamp & trigger snap hook */}
        <div className="relative flex flex-col items-center -mt-0.5 z-20 pointer-events-none">
          {/* Strap folded end metal clamp */}
          <div className="w-6.5 h-2.5 bg-[#DDDDD6] border border-[#A8A8A0] rounded-xs flex items-center justify-center shadow-xs">
            <div className="w-4.5 h-[0.75px] bg-[#888880]" />
          </div>

          {/* Anodized swivel barrel */}
          <div className="w-3.5 h-2 bg-[#2A2A2A] border border-white/[0.12] -mt-0.5" />

          {/* Precision lobster trigger clasp */}
          <div className="w-4 h-4.5 bg-[#1E1E1E] border border-white/[0.12] rounded-t-xs rounded-b-sm shadow-xs flex items-center justify-center -mt-0.5">
            <div className="w-1 h-2 border-r border-[#555555] opacity-70" />
          </div>

          {/* Swivel ring that loops through the card's punched slot */}
          <div className="w-3.5 h-3.5 border border-[#444444] rounded-full -mt-1 z-30" />
        </div>

        {/* ================= 5. THE ID CARD ================= */}
        <div className="-mt-1 relative z-10">
          <TeamCard
            member={member}
            flipped={isFlipped}
            onFlipToggle={onFlipToggle}
            onShare={onShare}
          />
        </div>
      </motion.div>
    </div>
  );
};
