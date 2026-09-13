/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface MemberProfileDrawerProps {
  member: TeamMember | null;
  onClose: () => void;
}

/**
 * MEMBER PROFILE DRAWER
 * An editorial side-drawer that slides in smoothly from the right edge of the screen,
 * presenting authentic portrait photography and verified metadata with generous editorial pacing.
 */
export const MemberProfileDrawer: React.FC<MemberProfileDrawerProps> = ({ member, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (member) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0C0C0C]/80"
            aria-hidden="true"
          />

          {/* Side Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`${member.name} — Editorial Dossier`}
            className="relative z-10 w-full max-w-xl h-full bg-[#181818] text-[#F5EFE6] border-l border-[rgba(245,239,230,0.14)] shadow-xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Control Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-[#141414] border-b border-[rgba(245,239,230,0.10)]">
              <div className="flex items-center gap-3">
                <span className="p-1 bg-[#181818] text-[#F5EFE6] border border-[rgba(242,97,63,0.3)]">
                  <NexusIcon size="xs" />
                </span>
                <span className="text-[10px] font-dosis font-bold tracking-[0.24em] text-[#857E74] uppercase">
                  YEARBOOK DOSSIER // {member.group}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-dosis font-bold tracking-[0.2em] text-[#F5EFE6] hover:bg-[#22201F] hover:text-[#F2613F] transition-colors duration-200 border border-[rgba(245,239,230,0.14)] cursor-pointer"
                aria-label="Close dossier"
              >
                <span>CLOSE</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-10 space-y-8 flex-1">
              {/* Member Full Photographic Composition */}
              <div className="relative w-full aspect-[4/5] bg-[#141414] overflow-hidden border border-[rgba(245,239,230,0.10)]">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale contrast-105"
                    style={{ objectPosition: member.imagePosition || 'center 20%' }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#857E74] bg-[#141414]">
                    <NexusIcon size="lg" />
                    <span className="mt-3 font-dosis text-xs tracking-[0.2em] uppercase">PORTRAIT</span>
                  </div>
                )}
                {/* Architectural Corner Pins */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#F2613F]" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#F2613F]" />
              </div>

              {/* Editorial Typography & Titles */}
              <div className="space-y-2">
                <span className="font-dosis font-bold text-xs sm:text-sm tracking-[0.26em] text-[#F2613F] uppercase block">
                  {member.role}
                </span>
                <h2 className="font-fraunces font-bold text-3xl sm:text-4xl text-[#F5EFE6] tracking-tight leading-[1.08]">
                  {member.name}
                </h2>
              </div>

              <div className="w-full h-[1px] bg-[rgba(245,239,230,0.10)]" />

              {/* Bio & Commentary */}
              {member.bio && (
                <div className="space-y-2">
                  <span className="text-[10px] font-dosis font-bold tracking-[0.22em] text-[#857E74] uppercase block">
                    EDITORIAL NOTE
                  </span>
                  <p className="font-bitter text-base sm:text-lg text-[#C2BBB0] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Verified Source Metadata Row */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(245,239,230,0.10)] text-left">
                <div className="p-4 bg-[#141414] border border-[rgba(245,239,230,0.10)]">
                  <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                    DISCIPLINE
                  </span>
                  <p className="mt-1 font-bitter text-xs font-semibold text-[#F5EFE6] leading-snug">
                    {member.discipline}
                  </p>
                </div>

                <div className="p-4 bg-[#141414] border border-[rgba(245,239,230,0.10)]">
                  <span className="block text-[9px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                    COHORT / YEAR
                  </span>
                  <p className="mt-1 font-dosis font-bold text-xs tracking-wider text-[#F2613F]">
                    {member.yearOfStudy || 'Studio Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="p-6 bg-[#141414] border-t border-[rgba(245,239,230,0.10)] flex items-center justify-between">
              <span className="text-[10px] font-dosis font-bold tracking-[0.2em] text-[#857E74] uppercase">
                STUDIO RECORD 2026
              </span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-xs font-dosis font-bold tracking-[0.2em] text-[#F5EFE6] hover:text-[#F2613F] transition-colors duration-200 cursor-pointer"
              >
                <span>RETURN TO YEARBOOK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
