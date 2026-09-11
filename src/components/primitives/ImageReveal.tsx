/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NexusIcon } from '../brand/NexusLogo.tsx';

interface ImageRevealProps {
  src?: string;
  alt: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9' | 'auto';
  caption?: string;
  tag?: string;
  className?: string;
  id?: string;
  placeholderText?: string;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({
  src,
  alt,
  aspectRatio = '16/9',
  caption,
  tag,
  className = '',
  id,
  placeholderText = 'NEXUS ARCHIVE / ARTIFACT',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const aspectClasses = {
    '16/9': 'aspect-[16/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
    'auto': '',
  }[aspectRatio];

  return (
    <figure id={id} className={`group flex flex-col w-full ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-[#E8E2D7] border border-[rgba(10,10,9,0.12)] ${aspectClasses} transition-all duration-300 group-hover:border-[rgba(10,10,9,0.3)]`}
      >
        {src ? (
          <>
            <motion.img
              src={src}
              alt={alt}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover object-center filter grayscale contrast-[1.02] group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute top-2.5 right-2.5 p-1 bg-[#0A0A09]/80 backdrop-blur-xs border border-[rgba(239,90,42,0.3)] opacity-70 group-hover:opacity-100 transition-opacity">
              <NexusIcon size="xs" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-[radial-gradient(#0a0a0908_1px,transparent_1px)] [background-size:16px_16px]">
            <NexusIcon size="lg" className="mb-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105" />
            {tag && (
              <span className="mb-2 font-dosis text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[rgba(10,10,9,0.2)] text-[#0A0A09] font-semibold">
                {tag}
              </span>
            )}
            <p className="font-dosis text-xs uppercase tracking-wider text-[#66615A] font-semibold">
              {placeholderText}
            </p>
            <span className="mt-1 font-bitter text-[11px] text-[#66615A]/80 max-w-xs line-clamp-2">
              {alt}
            </span>
          </div>
        )}

        {/* Framing corner accents for high craftsmanship scaffold */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#0A0A09]/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#0A0A09]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#0A0A09]/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#0A0A09]/30 pointer-events-none" />
      </div>

      {caption && (
        <figcaption className="mt-2.5 flex items-baseline justify-between text-xs text-[#66615A]">
          <span className="font-bitter italic">{caption}</span>
          {tag && <span className="font-dosis uppercase font-semibold text-[10px] tracking-wider text-[#EF5A2A]">{tag}</span>}
        </figcaption>
      )}
    </figure>
  );
};
