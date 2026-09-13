/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Theme } from './ThemeContext.tsx';

interface CinematicTransitionContextType {
  /** True while a cinematic transition is in progress */
  isTransitioning: boolean;
  /** The theme that will be applied when the screen is fully covered */
  pendingTheme: Theme | null;
  /**
   * Request a cinematic transition to the given theme.
   * Returns true if the request was accepted, false if a transition is
   * already running (debounce guard). The caller must not fire a theme change
   * directly — the CinematicThemeTransition component calls setTheme internally.
   */
  requestTransition: (targetTheme: Theme) => boolean;
  /** Called by CinematicThemeTransition when the animation fully completes. */
  onTransitionComplete: () => void;
}

const CinematicTransitionContext = createContext<CinematicTransitionContextType | undefined>(undefined);

interface CinematicTransitionProviderProps {
  children: React.ReactNode;
}

export const CinematicTransitionProvider: React.FC<CinematicTransitionProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);

  // lockRef is the authoritative source of "is a transition running".
  // It is set synchronously on requestTransition and cleared synchronously
  // on onTransitionComplete — no async delay, which closed a race condition
  // where a click within the post-complete 80ms window could enter requestTransition
  // while React state still said isTransitioning=false.
  const lockRef = useRef(false);

  const requestTransition = useCallback((targetTheme: Theme): boolean => {
    // Hard synchronous guard — if already locked, refuse immediately.
    if (lockRef.current) return false;
    lockRef.current = true;
    setIsTransitioning(true);
    setPendingTheme(targetTheme);
    return true;
  }, []);

  const onTransitionComplete = useCallback(() => {
    // Release lock synchronously so the next requestTransition can proceed
    // on the next user interaction, not after a setTimeout.
    lockRef.current = false;
    setIsTransitioning(false);
    setPendingTheme(null);
  }, []);

  return (
    <CinematicTransitionContext.Provider
      value={{ isTransitioning, pendingTheme, requestTransition, onTransitionComplete }}
    >
      {children}
    </CinematicTransitionContext.Provider>
  );
};

export const useCinematicTransition = (): CinematicTransitionContextType => {
  const ctx = useContext(CinematicTransitionContext);
  if (!ctx) throw new Error('useCinematicTransition must be used within CinematicTransitionProvider');
  return ctx;
};
