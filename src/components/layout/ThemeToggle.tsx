/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useCinematicTransition } from '../../context/CinematicTransitionContext.tsx';

interface ThemeToggleProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

/**
 * NEXUS EDITORIAL THEME TOGGLE
 *
 * Minimal, accessible, and seamless integration with the existing pill-navigation system:
 * - Uses existing typography (Dosis 700 uppercase tracking)
 * - Subtle motion-spring sliding pill indicator matching navbar active state
 * - Strict keyboard accessibility (role="switch", aria-checked, Space/Enter trigger)
 * - Zero glowing AI effects or 3D clutter
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'desktop' }) => {
  const { theme } = useTheme();
  const { requestTransition, isTransitioning } = useCinematicTransition();
  const shouldReduceMotion = useReducedMotion();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    requestTransition(isDark ? 'light' : 'dark');
  };

  const handleSetTheme = (t: 'light' | 'dark') => {
    if (t !== theme) requestTransition(t);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] ${className}`}>
        <span className="font-dosis font-bold text-xs tracking-[0.18em] uppercase text-[var(--text-secondary)] pl-2">
          THEME / {isDark ? 'DARK' : 'LIGHT'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode. Currently in ${isDark ? 'Dark' : 'Light'} Mode.`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={isTransitioning}
          className="relative flex items-center p-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#F2613F] select-none disabled:cursor-not-allowed"
        >
          {/* Light button option */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSetTheme('light');
            }}
            className={`relative z-10 px-3 py-1 font-dosis font-bold text-[11px] tracking-[0.16em] uppercase rounded-full transition-colors duration-200 ${
              !isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            LIGHT
          </span>

          {/* Dark button option */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleSetTheme('dark');
            }}
            className={`relative z-10 px-3 py-1 font-dosis font-bold text-[11px] tracking-[0.16em] uppercase rounded-full transition-colors duration-200 ${
              isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            DARK
          </span>

          {/* Sliding Indicator */}
          <motion.div
            layoutId={shouldReduceMotion ? undefined : 'nexus-theme-indicator-mobile'}
            className="absolute rounded-full bg-[var(--bg-elevated)] shadow-xs border border-[var(--border-strong)] pointer-events-none"
            style={{
              top: 4,
              bottom: 4,
              left: !isDark ? 4 : 'calc(50% + 1px)',
              right: !isDark ? 'calc(50% + 1px)' : 4,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 35,
              mass: 0.5,
            }}
            aria-hidden="true"
          />
        </button>
      </div>
    );
  }

  // Desktop minimal segmented toggle
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Toggle theme between Light and Dark mode. Currently in ${isDark ? 'Dark' : 'Light'} mode.`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={isTransitioning}
      className={`relative inline-flex items-center p-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#F2613F] select-none cursor-pointer disabled:cursor-not-allowed ${className}`}
    >
      {/* Light Option */}
      <span
        className={`relative z-10 px-2.5 py-1 text-[11px] xl:text-[12px] font-dosis font-bold tracking-[0.16em] uppercase rounded-full transition-colors duration-200 ${
          !isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        LT
      </span>

      {/* Dark Option */}
      <span
        className={`relative z-10 px-2.5 py-1 text-[11px] xl:text-[12px] font-dosis font-bold tracking-[0.16em] uppercase rounded-full transition-colors duration-200 ${
          isDark ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        DK
      </span>

      {/* Sliding Active Pill */}
      <motion.div
        layoutId={shouldReduceMotion ? undefined : 'nexus-theme-indicator-desktop'}
        className="absolute rounded-full bg-[var(--bg-elevated)] shadow-xs border border-[var(--border-strong)] pointer-events-none"
        style={{
          top: 3,
          bottom: 3,
          left: !isDark ? 3 : 'calc(50% + 1px)',
          right: !isDark ? 'calc(50% + 1px)' : 3,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 35,
          mass: 0.5,
        }}
        aria-hidden="true"
      />
    </button>
  );
};

export default ThemeToggle;
