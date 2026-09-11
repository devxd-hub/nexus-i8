/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { AppRoute, NavItem } from '../../types.ts';

interface NavbarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '/about' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'GALLERY', href: '/gallery' },
  { label: 'TEAM', href: '/team' },
  { label: 'CONTACT', href: '/contact' },
];

/**
 * REFINED FLOATING PILL NAVBAR
 *
 * Micro-Interaction Architecture:
 * - Tactile Pill Rail: Elevated translucent pill track with fine-tuned border and blur.
 * - Smooth Sliding Active Pill (`layoutId="nexus-nav-active-pill"`): Pure, high-precision
 *   motion spring pill that glides seamlessly between active routes.
 * - Gentle Hover Underlay: Subtle secondary highlight for interactive feedback.
 * - Zero artificial dots/clutter: Pure typographic clarity and optical balance.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const isScrolledRef = useRef(false);

  // High-performance scroll listener with hysteresis to prevent oscillation / layout-thrashing
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // Hysteresis deadband: activate above 24px, deactivate below 8px
          if (!isScrolledRef.current && y > 24) {
            isScrolledRef.current = true;
            setIsScrolled(true);
          } else if (isScrolledRef.current && y <= 8) {
            isScrolledRef.current = false;
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open & listen for Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (href: AppRoute, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    onRouteChange(href);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="nexus-main-navbar"
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? 'bg-[#F3EEE5]/92 backdrop-blur-md border-b border-[rgba(10,10,9,0.08)] shadow-[0_4px_20px_-4px_rgba(10,10,9,0.05)]'
          : 'bg-[#F3EEE5]/40 backdrop-blur-xs border-b border-transparent shadow-none'
      }`}
    >
      <Container>
        {/* Stable, Non-Collapsing Navbar Height (prevents layout shifts and coordinate jumps) */}
        <div className="h-18 flex items-center justify-between">
          {/* ====================================================
              1. LEFT: NEXUS BRAND MARK
             ==================================================== */}
          <div className="flex items-center">
            <a
              href="/"
              onClick={(e) => handleNavClick('/', e)}
              className="group relative flex items-center py-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EF5A2A] rounded-xs select-none"
              aria-label="NEXUS College Community Home"
            >
              <div id="navbar-brand-anchor" className="flex items-center gap-3">
                {/* Iconic NEXUS X */}
                <div
                  id="navbar-brand-x"
                  className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0"
                >
                  <img
                    src="/NEXUS-removebg-preview-1.png"
                    alt="NEXUS X"
                    className="w-full h-full object-contain aspect-square pointer-events-none select-none transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    loading="eager"
                  />
                </div>

                {/* Subtitle / Collective Brand Tag */}
                <div className="flex flex-col justify-center">
                  <span
                    id="navbar-brand-subtitle"
                    className="font-dosis uppercase font-bold text-[11px] sm:text-[12px] tracking-[0.22em] text-[#0A0A09] group-hover:text-[#EF5A2A] transition-colors duration-200"
                  >
                    COLLEGE COMMUNITY
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* ====================================================
              2. CENTER/RIGHT: FINE-TUNED PILL RAIL
             ==================================================== */}
          <nav
            ref={navContainerRef}
            aria-label="Main Navigation"
            className="hidden lg:flex items-center p-1 rounded-full bg-[#E8E2D7]/80 backdrop-blur-md border border-[rgba(10,10,9,0.08)] shadow-[0_2px_8px_-2px_rgba(10,10,9,0.04)]"
            onMouseLeave={() => setHoveredHref(null)}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentRoute === item.href;
              const isHovered = hoveredHref === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  className={`relative py-2 px-4 xl:px-5 text-[13.5px] xl:text-[14px] font-dosis font-bold tracking-[0.16em] uppercase transition-colors duration-200 ease-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EF5A2A] rounded-full select-none ${
                    isActive
                      ? 'text-[#0A0A09]'
                      : isHovered
                      ? 'text-[#0A0A09]'
                      : 'text-[#66615A]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active Sliding Pill Surface */}
                  {isActive && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : 'nexus-nav-active-pill'}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(10,10,9,0.08),0_1px_2px_rgba(10,10,9,0.04)] border border-[rgba(10,10,9,0.06)] pointer-events-none"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                        mass: 0.6,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Gentle Hover Underlay for Inactive Items */}
                  {!isActive && isHovered && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : 'nexus-nav-hover-pill'}
                      className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 34,
                        mass: 0.5,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Nav Item Label */}
                  <span className="relative z-10 block leading-none">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* ====================================================
              3. RIGHT: MOBILE MENU TOGGLE
             ==================================================== */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(10,10,9,0.12)] bg-[#E8E2D7]/80 backdrop-blur-md hover:bg-white transition-all duration-200 text-[#0A0A09] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EF5A2A] select-none"
              aria-label={mobileMenuOpen ? 'Close main navigation menu' : 'Open main navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-drawer"
            >
              <span className="font-dosis font-bold text-xs tracking-[0.18em] uppercase">
                {mobileMenuOpen ? 'CLOSE' : 'MENU'}
              </span>
              <span className="font-mono text-xs font-bold text-[#EF5A2A]">
                {mobileMenuOpen ? '✕' : '+'}
              </span>
            </button>
          </div>
        </div>
      </Container>

      {/* ====================================================
          4. MOBILE NAVIGATION DRAWER
         ==================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:hidden bg-[#F3EEE5]/98 backdrop-blur-2xl px-6 py-6 shadow-[0_20px_40px_rgba(10,10,9,0.08)] overflow-hidden border-b border-[rgba(10,10,9,0.08)]"
          >
            {/* Staggered Navigation Pills in Mobile Drawer */}
            <nav aria-label="Mobile Navigation" className="flex flex-col space-y-2">
              {NAV_ITEMS.map((item, idx) => {
                const isActive = currentRoute === item.href;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : 0.03 * idx,
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`flex items-center justify-between px-5 py-3 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-white shadow-[0_2px_10px_rgba(10,10,9,0.06)] border border-[rgba(10,10,9,0.08)] text-[#0A0A09] font-bold'
                        : 'text-[#66615A] hover:text-[#0A0A09] hover:bg-white/40'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="font-dosis font-bold text-base tracking-[0.14em] uppercase">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="font-dosis text-[11px] font-bold text-[#EF5A2A] tracking-[0.18em] uppercase">
                        ACTIVE
                      </span>
                    )}
                  </motion.a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
