/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { GalleryItem } from '../../types.ts';

interface GalleryTileProps {
  item: GalleryItem;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9' | 'auto';
  onSelect?: (item: GalleryItem) => void;
  className?: string;
}

/**
 * GalleryTile
 * Interactive editorial gallery tile maintaining authentic masonry rhythm.
 *
 * Hover specifications:
 * - Image expands slightly (1 -> 1.03) inside clean overflow-hidden boundary
 * - Caption appears/strengthens with clean contrast
 * - Small arrow appears with smooth translation
 * - Subtle border accent and elevation
 * - Keyboard accessible with tabIndex and visible focus ring
 */
export const GalleryTile: React.FC<GalleryTileProps> = ({
  item,
  aspectRatio = item.aspectRatio || '16/9',
  onSelect,
  className = '',
}) => {
  const aspectClass = {
    '16/9': 'aspect-[16/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
    'auto': '',
  }[aspectRatio];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(item);
    }
  };

  return (
    <figure
      data-cursor="gallery"
      tabIndex={0}
      role={onSelect ? 'button' : 'figure'}
      aria-label={`${item.title} — ${item.category}`}
      onClick={() => onSelect?.(item)}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex flex-col w-full
        bg-[#FAF6F0] border border-[rgba(10,10,9,0.14)]
        transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-[#EF5A2A]/60 hover:bg-white hover:shadow-xs
        active:scale-[0.99]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF5A2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EEE5]
        cursor-pointer select-none
        ${className}
      `}
    >
      {/* Image container with overflow-hidden */}
      <div
        className={`relative w-full overflow-hidden bg-[#E8E2D7] border-b border-[rgba(10,10,9,0.1)] ${aspectClass}`}
      >
        {/* Visual surface scaling 1 -> 1.03 on hover */}
        <div className="w-full h-full flex flex-col items-center justify-center text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover filter grayscale contrast-[1.05] group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#E8E2D7]">
              {/* Subtle background grid */}
              <div
                className="absolute inset-0 opacity-30 bg-[radial-gradient(#0a0a0910_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col items-center">
                <NexusIcon
                  size="lg"
                  className="mb-3 opacity-65 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-300"
                />
                <span className="font-dosis text-[10px] font-bold tracking-[0.22em] uppercase px-2.5 py-0.5 border border-[rgba(10,10,9,0.2)] text-[#0A0A09] bg-[#FAF6F0]/80">
                  PHOTO // {item.category}
                </span>
                <span className="mt-2 font-bitter text-xs text-[#0A0A09] font-bold max-w-[220px] line-clamp-1">
                  {item.title}
                </span>
              </div>
            </div>
          )}

          {/* Framing corners */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#0A0A09]/30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#0A0A09]/30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#0A0A09]/30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#0A0A09]/30 pointer-events-none" />
        </div>

        {/* Date and category tag pill */}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#0A0A09]/85 text-white text-[10px] font-dosis font-bold tracking-[0.16em] uppercase border border-[rgba(239,90,42,0.4)] backdrop-blur-xs">
          {item.eventDate}
        </div>

        {/* Small arrow icon indicator (appears and translates on hover) */}
        <div className="absolute top-3 right-3 p-1.5 bg-[#0A0A09] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-1 group-hover:translate-y-0 group-hover:translate-x-0.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#EF5A2A]" />
        </div>
      </div>

      {/* Caption & Metadata bar */}
      <figcaption className="p-4 sm:p-5 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-dosis text-[11px] font-bold tracking-[0.2em] text-[#EF5A2A] uppercase">
            {item.category}
          </span>
          <span className="font-dosis text-[10px] font-semibold tracking-[0.16em] text-[#66615A]">
            STUDIO RECORD
          </span>
        </div>

        {/* Caption text appears / sharpens on hover */}
        <p className="font-bitter text-xs sm:text-sm text-[#66615A] group-hover:text-[#0A0A09] transition-colors duration-300 leading-relaxed">
          {item.caption}
        </p>

        {/* Small orange accent rule on hover */}
        <div
          className="w-0 h-[1.5px] bg-[#EF5A2A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-10"
          aria-hidden="true"
        />
      </figcaption>
    </figure>
  );
};
