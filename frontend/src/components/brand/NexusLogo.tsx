/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MetallicPaint from './MetallicPaint.tsx';
import logo from './logo.svg';
import logoOrange from './logo-orange.svg';
import { resolveImageUrl, handleImageFallbackError } from '../../data/cloudinaryMap.ts';

const NEXUS_ICON_SRC = resolveImageUrl('/images/logos/NEXUS-removebg-preview-1.png');

export interface NexusIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'hero' | 'custom';
  color?: string;
  id?: string;
  alt?: string;
}

/**
 * Geometric, distinctive orange 'X' — the defining identity element of NEXUS.
 * Rendered as a carefully constructed geometric SVG mark with authentic brand proportions.
 */
export const NexusIcon: React.FC<NexusIconProps> = ({
  className = '',
  size = 'md',
  id,
  alt = 'NEXUS X',
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
    '3xl': 'w-24 h-24',
    hero: 'w-28 h-28 md:w-36 md:h-36',
    custom: '',
  }[size];

  return (
    <img
      id={id}
      src={NEXUS_ICON_SRC}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`inline-block shrink-0 select-none object-contain aspect-square pointer-events-none ${sizeClasses} ${className}`}
      loading="eager"
      decoding="async"
      onError={handleImageFallbackError}
    />
  );
};

/**
 * Interactive Central X:
 * Base: canonical orange NEXUS X.
 * Hover: seamlessly transitions into metallic liquid paint effect.
 * Exit: smoothly crossfades back into the original orange X.
 */
export const InteractiveNexusX: React.FC<{
  className?: string;
  sizeClass?: string;
  size?: string;
  alt?: string;
}> = ({ className = '', sizeClass = 'w-[1.12em] h-[1.12em]', size, alt = 'NEXUS X' }) => {
  const resolvedSizeClass = size
    ? {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-14 h-14',
        '2xl': 'w-20 h-20',
        '3xl': 'w-28 h-28',
        hero: 'w-36 h-36 md:w-48 md:h-48',
      }[size] || sizeClass
    : sizeClass;
  const [isHovered, setIsHovered] = useState(false);
  const [canHover, setCanHover] = useState(true);

  // Check touch vs mouse device (mobile constraint: keep orange on touch devices)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(hoverQuery.matches);
      const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
      hoverQuery.addEventListener('change', handler);
      return () => hoverQuery.removeEventListener('change', handler);
    }
  }, []);

  const handleMouseEnter = () => {
    if (!canHover) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center shrink-0 select-none aspect-square cursor-pointer transition-transform duration-150 ease-out active:scale-95 ${resolvedSizeClass} ${className}`}
      aria-label="NEXUS X"
    >
      {/* Canonical Bottom Layer: Canonical orange NEXUS X */}
      <img
        src={logoOrange}
        alt={alt}
        className={`w-full h-full object-contain aspect-square pointer-events-none select-none block transition-all duration-150 ease-out ${
          isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        loading="eager"
        decoding="async"
      />

      {/* Top Layer: MetallicPaint Liquid Metal X with snappy enhanced crossfade on hover */}
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-all duration-150 ease-out ${
          isHovered
            ? 'opacity-100 scale-100 drop-shadow-[0_0_18px_rgba(254,179,255,0.75)] drop-shadow-[0_0_34px_rgba(239,90,42,0.45)]'
            : 'opacity-0 scale-95 drop-shadow-none'
        }`}
        aria-hidden="true"
      >
        <MetallicPaint
          imageSrc={logo}
          // Pattern
          seed={42}
          scale={4}
          patternSharpness={1}
          noiseScale={0.5}
          // Animation
          speed={0.3}
          liquid={0.75}
          mouseAnimation={false}
          // Visual
          brightness={2}
          contrast={0.5}
          refraction={0.01}
          blur={0.015}
          chromaticSpread={2}
          fresnel={1}
          angle={0}
          waveAmplitude={1}
          distortion={1}
          contour={0.2}
          // Colors
          lightColor="#ffffff"
          darkColor="#000000"
          tintColor="#feb3ff"
          isHovered={isHovered}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};

export interface NexusWordmarkProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  inverted?: boolean;
  id?: string;
  enableMetallicHover?: boolean;
}

/**
 * NEXUS Wordmark: "N E [ICONIC X] U S"
 * The X acts as the visual centerpiece.
 */
export const NexusWordmark: React.FC<NexusWordmarkProps> = ({
  className = '',
  size = 'md',
  inverted = false,
  id,
  enableMetallicHover = false,
}) => {
  const typographySizes = {
    xs: 'text-xs tracking-[0.14em]',
    sm: 'text-sm tracking-[0.16em]',
    md: 'text-lg md:text-xl tracking-[0.18em]',
    lg: 'text-xl md:text-2xl tracking-[0.2em]',
    xl: 'text-3xl md:text-4xl tracking-[0.22em]',
    '2xl': 'text-5xl md:text-6xl tracking-[0.24em]',
    hero: 'text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.22em]',
  }[size];

  const textColor = 'text-[var(--text-primary)]';

  return (
    <span
      id={id}
      className={`inline-flex items-center font-fraunces font-bold uppercase select-none ${typographySizes} ${textColor} ${className}`}
      aria-label="NEXUS"
    >
      <span>NE</span>
      <span className="inline-flex items-center justify-center mx-[0.10em] self-center">
        {enableMetallicHover ? (
          <InteractiveNexusX
            sizeClass="w-[1.12em] h-[1.12em] -translate-y-[0.02em]"
            className="transform transition-transform duration-150 group-hover:scale-105"
          />
        ) : (
          <NexusIcon
            size="custom"
            className="w-[1.12em] h-[1.12em] -translate-y-[0.02em] transform transition-transform duration-150 group-hover:scale-105"
          />
        )}
      </span>
      <span>US</span>
    </span>
  );
};

export interface NexusLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showSubtitle?: boolean;
  subtitleLayout?: 'below' | 'beside';
  inverted?: boolean;
  id?: string;
  onClick?: () => void;
  enableMetallicHover?: boolean;
}

/**
 * Reusable <NexusLogo /> component.
 * Features:
 * - N E [ICONIC X] U S
 * - Geometric, distinctive orange X centerpiece
 * - Subtle "COLLEGE COMMUNITY" badge below or beside the wordmark
 */
export const NexusLogo: React.FC<NexusLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  subtitleLayout = 'below',
  inverted = false,
  id = 'nexus-logo',
  onClick,
  enableMetallicHover,
}) => {
  const subtitleColor = 'text-[var(--text-secondary)]';
  const shouldEnableMetallicHover = enableMetallicHover ?? (size === 'hero');

  const subtitleSizes = {
    xs: 'text-[9px] tracking-[0.2em]',
    sm: 'text-[10px] tracking-[0.22em]',
    md: 'text-[11px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.28em]',
    xl: 'text-xs tracking-[0.3em]',
    '2xl': 'text-sm tracking-[0.32em]',
    hero: 'text-sm md:text-base tracking-[0.35em]',
  }[size];

  if (subtitleLayout === 'beside') {
    return (
      <div
        id={id}
        onClick={onClick}
        className={`inline-flex items-center gap-3 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
        aria-label="NEXUS College Community"
      >
        <NexusWordmark
          size={size}
          inverted={inverted}
          enableMetallicHover={shouldEnableMetallicHover}
        />
        {showSubtitle && (
          <span
            className={`font-dosis uppercase font-semibold pl-3 border-l border-[rgba(245,239,230,0.18)] ${subtitleSizes} ${subtitleColor}`}
          >
            COLLEGE COMMUNITY
          </span>
        )}
      </div>
    );
  }

  // Default: Stacked with subtle "COLLEGE COMMUNITY" below
  return (
    <div
      id={id}
      onClick={onClick}
      className={`inline-flex flex-col select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      aria-label="NEXUS College Community"
    >
      <NexusWordmark
        size={size}
        inverted={inverted}
        enableMetallicHover={shouldEnableMetallicHover}
      />
      {showSubtitle && (
        <span
          className={`font-dosis uppercase font-semibold tracking-[0.28em] mt-0.5 ${subtitleSizes} ${subtitleColor}`}
        >
          COLLEGE COMMUNITY
        </span>
      )}
    </div>
  );
};

export default NexusLogo;
