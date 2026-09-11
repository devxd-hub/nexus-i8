/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TeamMember } from '../../types.ts';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface MemberProfileOverlayProps {
  member: TeamMember | null;
  onClose: () => void;
}

/**
 * MEMBER PROFILE OVERLAY
 * Clean, restrained, editorial in-app profile view using authentic source data only.
 * Displays large portrait photography, discipline, role, cohort status, and bio.
 */
export const MemberProfileOverlay: React.FC<MemberProfileOverlayProps> = ({ member, onClose }) => {
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

  if (!member) return null;

  return (
    <div
      id="nexus-member-profile-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-[#0A0A09]/80 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} Profile`}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#F3EEE5] text-[#0A0A09] border border-[#0A0A09]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#EAE4D9] border-b border-[#0A0A09]/15">
          <div className="flex items-center gap-3">
            <span className="p-1 bg-[#0A0A09] text-white">
              <NexusIcon size="xs" />
            </span>
            <div className="flex items-center gap-2 text-xs font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
              <span>{member.group}</span>
              {member.yearOfStudy && (
                <>
                  <span>•</span>
                  <span className="text-[#EF5A2A]">{member.yearOfStudy}</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-dosis font-bold tracking-[0.18em] text-[#0A0A09] hover:bg-[#0A0A09] hover:text-white transition-colors duration-200 border border-[#0A0A09]/20 cursor-pointer"
            aria-label="Close profile"
          >
            <span>CLOSE</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-8">
          {/* Left Column: Portrait */}
          <div className="md:col-span-5 flex flex-col items-center sm:items-start">
            <div className="relative w-full aspect-[4/5] bg-[#E5DFD4] overflow-hidden border border-[#0A0A09]/15">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale contrast-105"
                  style={{ objectPosition: member.imagePosition || 'center 20%' }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#66615A] p-6 text-center">
                  <NexusIcon size="lg" />
                  <span className="mt-3 font-dosis text-xs tracking-[0.2em]">PORTRAIT</span>
                </div>
              )}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#EF5A2A]" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#EF5A2A]" />
            </div>

            {/* Discipline Tag */}
            {member.discipline && (
              <div className="mt-4 w-full p-3 bg-[#EAE4D9]/80 border border-[#0A0A09]/10 text-xs font-dosis tracking-[0.16em] text-[#66615A]">
                <span className="font-bold text-[#0A0A09]">DISCIPLINE:</span>
                <p className="mt-1 font-bitter text-[#0A0A09] text-xs leading-normal">
                  {member.discipline}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-dosis font-bold tracking-[0.24em] text-[#EF5A2A] uppercase">
                  {member.role}
                </span>
                <h2 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09] tracking-tight">
                  {member.name}
                </h2>
              </div>

              {/* Bio */}
              {member.bio && (
                <div className="pt-3 border-t border-[#0A0A09]/12 space-y-2">
                  <h4 className="text-[10px] font-dosis font-bold tracking-[0.2em] text-[#66615A] uppercase">
                    BIOGRAPHY &amp; ROLE
                  </h4>
                  <p className="font-bitter text-sm sm:text-base text-[#0A0A09]/85 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Metadata Attributes from source data */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#0A0A09]/10">
                <div className="p-3 bg-white/70 border border-[#0A0A09]/10">
                  <span className="block text-[10px] font-dosis font-bold tracking-[0.16em] text-[#66615A] uppercase">
                    CREW DIVISION
                  </span>
                  <p className="mt-1 font-dosis font-bold text-xs tracking-wider text-[#0A0A09]">
                    {member.group}
                  </p>
                </div>
                {member.yearOfStudy && (
                  <div className="p-3 bg-white/70 border border-[#0A0A09]/10">
                    <span className="block text-[10px] font-dosis font-bold tracking-[0.16em] text-[#66615A] uppercase">
                      COHORT / YEAR
                    </span>
                    <p className="mt-1 font-dosis font-bold text-xs tracking-wider text-[#0A0A09]">
                      {member.yearOfStudy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
