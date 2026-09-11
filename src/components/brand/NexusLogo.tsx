/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MetallicPaint from './MetallicPaint.tsx';

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
      src="/NEXUS-removebg-preview-1.png"
      alt={alt}
      referrerPolicy="no-referrer"
      className={`inline-block shrink-0 select-none object-contain aspect-square pointer-events-none ${sizeClasses} ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

/**
 * Interactive Central X:
 * Base: canonical orange NEXUS X.
 * Hover: seamlessly transitions into sophisticated liquid metallic brushed aluminum.
 * Exit: smoothly crossfades back into the original orange X.
 * Confined strictly to the X bounding geometry.
 */
export const InteractiveNexusX: React.FC<{
  className?: string;
  sizeClass?: string;
  alt?: string;
}> = ({ className = '', sizeClass = 'w-[0.84em] h-[0.84em]', alt = 'NEXUS X' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
    setIsHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center shrink-0 select-none aspect-square cursor-pointer ${sizeClass} ${className}`}
      aria-label="NEXUS X"
    >
      {/* Canonical Bottom Layer: 100% untouched original orange X */}
      <img
        src="/NEXUS-removebg-preview-1.png"
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain aspect-square pointer-events-none select-none block"
        loading="eager"
        decoding="async"
      />

      {/* Top Layer: MetallicPaint Liquid Metal X with seamless physical crossfade */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          transitionDuration: isHovered ? '500ms' : '550ms',
          WebkitMaskImage: 'url("/NEXUS-removebg-preview-1.png")',
          maskImage: 'url("/NEXUS-removebg-preview-1.png")',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
        aria-hidden="true"
      >
        <MetallicPaint
          imageSrc="/NEXUS-removebg-preview-1.png"
          seed={42}
          scale={4}
          patternSharpness={1.1}
          noiseScale={0.35}
          speed={0.25}
          liquid={0.22}
          mouseAnimation={true}
          brightness={1.22}
          contrast={0.52}
          refraction={0.005}
          blur={0.01}
          chromaticSpread={0.002}
          fresnel={0.8}
          angle={45}
          waveAmplitude={0.4}
          distortion={0.12}
          contour={0.25}
          lightColor="#F7F5F0"
          darkColor="#12100E"
          tintColor="#EF5A2A"
          isHovered={isHovered}
          mousePos={mousePos}
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

  const textColor = inverted ? 'text-[#F3EEE5]' : 'text-[#0A0A09]';

  return (
    <span
      id={id}
      className={`inline-flex items-center font-fraunces font-bold uppercase select-none ${typographySizes} ${textColor} ${className}`}
      aria-label="NEXUS"
    >
      <span>NE</span>
      <span className="inline-flex items-center justify-center mx-[0.06em] self-center">
        {enableMetallicHover ? (
          <InteractiveNexusX
            sizeClass="w-[0.84em] h-[0.84em] -translate-y-[0.02em]"
            className="transform transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <NexusIcon
            size="custom"
            className="w-[0.84em] h-[0.84em] -translate-y-[0.02em] transform transition-transform duration-200 group-hover:scale-105"
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
  const subtitleColor = inverted ? 'text-[#F3EEE5]/60' : 'text-[#66615A]';
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
            className={`font-dosis uppercase font-semibold pl-3 border-l ${
              inverted ? 'border-[rgba(243,238,229,0.2)]' : 'border-[rgba(10,10,9,0.18)]'
            } ${subtitleSizes} ${subtitleColor}`}
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
