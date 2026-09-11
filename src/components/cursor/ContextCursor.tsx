/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * ContextCursor
 * Optional, ultra-minimal contextual indicator for desktop fine pointers.
 * Displays a tiny editorial badge ("VIEW →" or "OPEN →") ONLY when hovering
 * marked interactive elements (e.g. data-cursor="project" or data-cursor="gallery").
 *
 * Fully hardware accelerated with direct DOM transform updates (0 React re-renders on mousemove).
 * Native cursor is preserved. No giant glowing circles, no trails, no particles.
 */
export const ContextCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with hover and fine pointer
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setIsEnabled(true);

    let currentVisible = false;
    let currentText: string | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX + 14}px, ${e.clientY + 14}px, 0)`;
      }

      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      if (target) {
        const cursorType = target.getAttribute('data-cursor');
        let nextText: string | null = null;
        if (cursorType === 'project') {
          nextText = 'VIEW →';
        } else if (cursorType === 'gallery') {
          nextText = 'OPEN →';
        }

        if (nextText) {
          if (!currentVisible || currentText !== nextText) {
            currentVisible = true;
            currentText = nextText;
            setCursorText(nextText);
            setIsVisible(true);
          }
          return;
        }
      }

      if (currentVisible) {
        currentVisible = false;
        currentText = null;
        setIsVisible(false);
      }
    };

    const handleMouseLeave = () => {
      currentVisible = false;
      currentText = null;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-150 ease-out ${
        isVisible && cursorText ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        willChange: 'transform, opacity',
      }}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] text-[10px] font-dosis font-bold tracking-[0.2em] uppercase border border-[rgba(239,90,42,0.4)] shadow-md select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A2A]" />
        <span>{cursorText}</span>
      </div>
    </div>
  );
};
