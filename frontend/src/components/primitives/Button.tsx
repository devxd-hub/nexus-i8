/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export interface BaseButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  className?: string;
  id?: string;
  showArrow?: boolean;
  arrowType?: 'right' | 'upRight';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  target?: string;
  rel?: string;
  magnetic?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Hook for subtle magnetic effect on desktop fine pointers.
 * Moves only 3-5px towards cursor, zero distortion, resets smoothly.
 */
export function useMagnetic(enabled: boolean = true) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsFinePointer(fine && !reducedMotion);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enabled || !isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.14;
    const deltaY = (e.clientY - centerY) * 0.14;
    const clampedX = Math.max(-5, Math.min(5, deltaX));
    const clampedY = Math.max(-5, Math.min(5, deltaY));
    setOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    if (!enabled || !isFinePointer) return;
    setOffset({ x: 0, y: 0 });
  };

  return {
    offset,
    handleMouseMove,
    handleMouseLeave,
    style: enabled && isFinePointer ? {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      transition: offset.x === 0 && offset.y === 0
        ? 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)'
        : 'transform 100ms ease-out',
    } : undefined,
  };
}

/**
 * Hook for subtle pointer-following ambient highlight inside major buttons.
 */
function useCursorGlow(enabled: boolean = true) {
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsFinePointer(fine && !reducedMotion);
    }
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enabled || !isFinePointer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const onMouseLeave = () => {
    if (!enabled || !isFinePointer) return;
    setPos((prev) => ({ ...prev, active: false }));
  };

  return { pos, onMouseMove, onMouseLeave };
}

/**
 * PRIMARY BUTTON
 *
 * Architectural, tactile composition designed for NEXUS:
 * - Solid deep obsidian surface (#0A0A09) with warm ivory typography (#F3EEE5)
 * - "Drawn Edge" hover sequence: an architectural orange hairline travels around the perimeter
 * - Connection Motif: dual micro-points appear at opposing corners
 * - Directional arrow dynamically shifts outward 5px
 * - Tactile micro-lift (translateY -2px) on hover, compression scale(0.985) on active press
 * - Soft ambient ember cursor follow on fine pointers
 */
export const PrimaryButton: React.FC<BaseButtonProps> = ({
  children,
  label,
  onClick,
  href,
  className = '',
  id,
  showArrow = true,
  arrowType = 'right',
  disabled = false,
  type = 'button',
  ariaLabel,
  target,
  rel,
  magnetic = false,
  size = 'md',
  fullWidth = false,
}) => {
  const content = label || children;
  const ArrowIcon = arrowType === 'upRight' ? ArrowUpRight : ArrowRight;
  const { style: magneticStyle, handleMouseMove: handleMagneticMove, handleMouseLeave: handleMagneticLeave } = useMagnetic(magnetic);
  const { pos: glowPos, onMouseMove: handleGlowMove, onMouseLeave: handleGlowLeave } = useCursorGlow(!disabled);

  const handleCombinedMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    handleMagneticMove(e);
    handleGlowMove(e);
  };

  const handleCombinedMouseLeave = () => {
    handleMagneticLeave();
    handleGlowLeave();
  };

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-[11px]',
    md: 'px-6 py-3.5 text-xs',
    lg: 'px-8 py-4 text-sm',
  }[size];

  const baseClasses = `
    relative inline-flex items-center justify-between gap-4 sm:gap-6
    ${sizeClasses}
    ${fullWidth ? 'w-full' : ''}
    bg-[var(--bg-surface)] text-[var(--text-primary)] font-dosis font-bold tracking-[0.2em] uppercase
    rounded-[2px] border border-[var(--border-subtle)]
    shadow-sm
    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
    hover:-translate-y-[2px] hover:shadow-md hover:border-[var(--border-medium)]
    active:scale-[0.985] active:translate-y-0
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
    disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none cursor-pointer
    group select-none overflow-hidden
    ${className}
  `;

  const innerContent = (
    <>
      {/* 1. Subtle Paper/Ink Ambient Cursor Glow (follows mouse position) */}
      {glowPos.active && (
        <span
          className="absolute pointer-events-none rounded-full transition-opacity duration-300 opacity-100"
          style={{
            left: `${glowPos.x}px`,
            top: `${glowPos.y}px`,
            width: '160px',
            height: '160px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(242,97,63,0.22) 0%, rgba(242,97,63,0.06) 50%, transparent 75%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. "Drawn Edge" Architectural Line Perimeter Sequence */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2px]" aria-hidden="true">
        {/* Top edge: draws left to right */}
        <span className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#F2613F] transform origin-left scale-x-0 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        {/* Right edge: draws top to bottom */}
        <span className="absolute top-0 right-0 bottom-0 w-[1.5px] bg-[#F2613F] transform origin-top scale-y-0 transition-transform duration-200 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
        {/* Bottom edge: draws right to left */}
        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#F2613F] transform origin-right scale-x-0 transition-transform duration-250 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        {/* Left edge: draws bottom to top */}
        <span className="absolute top-0 left-0 bottom-0 w-[1.5px] bg-[#F2613F] transform origin-bottom scale-y-0 transition-transform duration-200 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
      </div>

      {/* 3. NEXUS Connection Motif: Opposing micro-points */}
      <span
        className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#F2613F] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#F2613F] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Button Typography & Directional Indicator */}
      <div className="relative z-10 flex items-center justify-between w-full gap-3.5 pointer-events-none">
        <span className="whitespace-nowrap transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
          {content}
        </span>
        {showArrow && (
          <span
            className={`inline-flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-[#F2613F] group-hover:text-[var(--text-primary)] ${
              arrowType === 'upRight'
                ? 'group-hover:translate-x-1.5 group-hover:-translate-y-1'
                : 'group-hover:translate-x-1.5'
            }`}
          >
            <ArrowIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        onClick={onClick}
        onMouseMove={handleCombinedMouseMove}
        onMouseLeave={handleCombinedMouseLeave}
        style={magneticStyle}
        className={baseClasses}
        aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
        target={target}
        rel={rel}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      onMouseMove={handleCombinedMouseMove}
      onMouseLeave={handleCombinedMouseLeave}
      style={magneticStyle}
      disabled={disabled}
      className={baseClasses}
      aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
    >
      {innerContent}
    </button>
  );
};

/**
 * SECONDARY BUTTON
 *
 * Restrained, architectural outlined treatment:
 * - Clean boundary on warm canvas (#141414) with subtle border
 * - "Ink Wash" hover sequence: subtle warm wash sweeps smoothly from left to right (350ms)
 * - Vertical orange micro-marker activates on left boundary
 * - Directional arrow shifts outward 5px
 * - Tactile micro-lift (translateY -2px) on hover, compression scale(0.985) on active press
 */
export const SecondaryButton: React.FC<BaseButtonProps> = ({
  children,
  label,
  onClick,
  href,
  className = '',
  id,
  showArrow = false,
  arrowType = 'right',
  disabled = false,
  type = 'button',
  ariaLabel,
  target,
  rel,
  size = 'md',
  fullWidth = false,
}) => {
  const content = label || children;
  const ArrowIcon = arrowType === 'upRight' ? ArrowUpRight : ArrowRight;

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-[11px]',
    md: 'px-6 py-3.5 text-xs',
    lg: 'px-8 py-4 text-sm',
  }[size];

  const baseClasses = `
    relative inline-flex items-center justify-between gap-3.5
    ${sizeClasses}
    ${fullWidth ? 'w-full' : ''}
    bg-[var(--bg-subsurface)] text-[var(--text-primary)] font-dosis font-bold tracking-[0.2em] uppercase
    rounded-[2px] border border-[var(--border-subtle)]
    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
    hover:border-[#F2613F] hover:bg-[var(--bg-surface)] hover:-translate-y-[2px] hover:shadow-sm
    active:scale-[0.985] active:translate-y-0
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
    disabled:opacity-50 disabled:pointer-events-none cursor-pointer
    group select-none overflow-hidden
    ${className}
  `;

  const innerContent = (
    <>
      {/* 1. Creative Ink/Paper Wash sweeping across the surface */}
      <span
        className="absolute inset-0 bg-[#F2613F]/[0.10] origin-left scale-x-0 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Left Edge Orange Architectural Micro-Bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-[#F2613F] origin-top scale-y-0 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 pointer-events-none"
        aria-hidden="true"
      />

      {/* 3. Button Typography & Directional Indicator */}
      <div className="relative z-10 flex items-center justify-between w-full gap-3.5 pointer-events-none">
        <span className="whitespace-nowrap transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
          {content}
        </span>
        {showArrow && (
          <span
            className={`inline-flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-[var(--text-muted)] group-hover:text-[#F2613F] ${
              arrowType === 'upRight'
                ? 'group-hover:translate-x-1.5 group-hover:-translate-y-1'
                : 'group-hover:translate-x-1.5'
            }`}
          >
            <ArrowIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        onClick={onClick}
        className={baseClasses}
        aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
        target={target}
        rel={rel}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
    >
      {innerContent}
    </button>
  );
};

/**
 * TEXT LINK / INLINE ACTION
 *
 * Lightweight editorial action for inline and card contexts:
 * - Clean text with directional arrow
 * - Hover: expanding orange underline draws in from left (origin-left, 250ms)
 * - Arrow translates outward 5px
 * - Text shifts 1px for subtle physical tactile response
 */
export const TextLink: React.FC<BaseButtonProps> = ({
  children,
  label,
  onClick,
  href,
  className = '',
  id,
  showArrow = true,
  arrowType = 'right',
  ariaLabel,
  target,
  rel,
}) => {
  const content = label || children;
  const ArrowIcon = arrowType === 'upRight' ? ArrowUpRight : ArrowRight;

  const baseClasses = `
    relative inline-flex items-center gap-2.5 text-xs font-dosis font-bold tracking-[0.2em] uppercase
    text-[var(--text-primary)] hover:text-[var(--text-primary)]
    transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
    group select-none py-1
    focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F2613F]
    ${className}
  `;

  const innerContent = (
    <>
      <span className="relative transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
        {content}
        {/* Architectural Underline */}
        <span
          className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#F2613F] origin-left scale-x-0 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 pointer-events-none"
          aria-hidden="true"
        />
      </span>
      {showArrow && (
        <span
          className={`inline-flex items-center justify-center transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] text-[#F2613F] ${
            arrowType === 'upRight'
              ? 'group-hover:translate-x-1 group-hover:-translate-y-1'
              : 'group-hover:translate-x-1.5'
          }`}
        >
          <ArrowIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        id={id}
        href={href}
        onClick={onClick}
        className={baseClasses}
        aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
        target={target}
        rel={rel}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={baseClasses}
      aria-label={ariaLabel || (typeof content === 'string' ? content : undefined)}
    >
      {innerContent}
    </button>
  );
};

/**
 * ICON BUTTON
 *
 * Geometric, architectural frame for utility and modal actions (Close, Menu, etc.):
 * - Square frame with restrained border
 * - Hover: border turns brand orange (#F2613F), subtle orange corner reticle appears, gentle lift
 * - Active: tactile compression scale(0.96)
 */
export interface NexusIconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  className?: string;
  id?: string;
  title?: string;
  ariaExpanded?: boolean;
}

export const NexusIconButton: React.FC<NexusIconButtonProps> = ({
  icon,
  onClick,
  ariaLabel,
  className = '',
  id,
  title,
  ariaExpanded,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      title={title || ariaLabel}
      className={`
        relative inline-flex items-center justify-center p-2.5 sm:p-3
        bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[2px]
        transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-[#F2613F] hover:bg-[var(--bg-elevated)] hover:-translate-y-0.5 hover:shadow-xs
        active:scale-[0.96] active:translate-y-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
        cursor-pointer group select-none overflow-hidden
        ${className}
      `}
    >
      {/* Top-Right Architectural Corner Reticle */}
      <span
        className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-[#F2613F] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        aria-hidden="true"
      />
      {/* Icon with subtle hover reaction */}
      <span className="relative z-10 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
        {icon}
      </span>
    </button>
  );
};

/**
 * FILTER & CATEGORY BUTTON
 *
 * Architectural selector for categories, disciplines, and groups:
 * - Stable state: crisp border with editorial uppercase tracking
 * - Active state: elevated panel #22201F with bright text #F5EFE6 and orange active reticle
 * - Hover state: subtle lift and border engagement
 */
export interface NexusFilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
  id?: string;
}

export const NexusFilterButton: React.FC<NexusFilterButtonProps> = ({
  label,
  active,
  onClick,
  count,
  className = '',
  id,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-2 px-3.5 py-1.5
        font-dosis text-xs uppercase tracking-[0.2em] font-bold rounded-[2px]
        transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F] focus-visible:ring-offset-1
        ${
          active
            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[#F2613F] shadow-xs'
            : 'bg-[var(--bg-subsurface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface)] hover:-translate-y-[1px]'
        }
        active:scale-[0.98]
        group
        ${className}
      `}
    >
      {/* Active Orange Indicator Notch */}
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#F2613F] shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className={`text-[10px] tracking-normal opacity-60 ${active ? 'text-[#F2613F]' : ''}`}>
          ({count})
        </span>
      )}
    </button>
  );
};

/**
 * DIRECTIONAL ACTION BUTTON
 *
 * For editorial step progression, next/prev cycles, and compact section advances.
 */
export interface NexusDirectionalButtonProps {
  label: string;
  onClick?: () => void;
  direction?: 'right' | 'upRight' | 'refresh';
  className?: string;
  id?: string;
  icon?: React.ReactNode;
}

export const NexusDirectionalButton: React.FC<NexusDirectionalButtonProps> = ({
  label,
  onClick,
  direction = 'right',
  className = '',
  id,
  icon,
}) => {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-between gap-3 px-3.5 py-2
        bg-[var(--bg-surface)] text-[var(--text-primary)] font-dosis font-bold text-xs tracking-[0.18em] uppercase
        border border-[var(--border-subtle)] rounded-[2px]
        transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-[#F2613F] hover:bg-[var(--bg-elevated)] hover:-translate-y-[1px] hover:shadow-xs
        active:scale-[0.98] active:translate-y-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2613F]
        cursor-pointer group select-none
        ${className}
      `}
    >
      <span className="transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
        {label}
      </span>
      <span className="inline-flex items-center text-[#F2613F] transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
        {icon || <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
      </span>
    </button>
  );
};

// Re-export ExploreNexusButton so any legacy imports remain unbroken,
// while ExploreNexusButton itself remains completely untouched in ExploreButton.tsx
export { ExploreNexusButton } from '../home/ExploreButton.tsx';
export type { ExploreNexusButtonProps } from '../home/ExploreButton.tsx';
