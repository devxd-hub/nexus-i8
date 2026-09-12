/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { ContextCursor } from './components/cursor/ContextCursor.tsx';
import { CinematicPreloader } from './components/preloader/CinematicPreloader.tsx';
import { NexusPenguin } from './components/mascot/NexusPenguin.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ProjectsPage } from './pages/ProjectsPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { TeamPage } from './pages/TeamPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AppRoute, Project } from './types.ts';
import { PROJECTS } from './data/nexusData.ts';

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const scrollPositions = useRef<Record<string, number>>({});

  // Helper to extract Project from route or query params
  const getProjectFromRoute = (route: string): Project | null => {
    if (!route.startsWith('/projects')) return null;

    // Check path /projects/:id
    let idOrSlug = route.replace(/^\/projects\/?/, '').split('?')[0].trim();

    // Check query params ?id=... if present
    if (!idOrSlug && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      idOrSlug = params.get('id') || '';
    }

    if (!idOrSlug) return null;

    const normalized = idOrSlug.toLowerCase();
    return (
      PROJECTS.find(
        (p) =>
          p.id.toLowerCase() === normalized ||
          p.title.toLowerCase() === normalized ||
          p.projectNumber.toLowerCase().replace(/\s+/g, '') === normalized.replace(/\s+/g, '') ||
          p.title.toLowerCase().replace(/\s+/g, '-') === normalized
      ) || null
    );
  };

  // Normalize initial route from current browser pathname if valid
  const getInitialRoute = (): AppRoute => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname;
    if (path === '/crew') return '/team';
    if (path.startsWith('/projects')) return path as AppRoute;
    const validRoutes: AppRoute[] = ['/', '/about', '/projects', '/gallery', '/team', '/contact'];
    return (validRoutes.includes(path as AppRoute) ? path : '/') as AppRoute;
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isHandoffStarted, setIsHandoffStarted] = useState(false);

  // Restore scroll position when returning to a route
  useEffect(() => {
    const savedPos = scrollPositions.current[currentRoute];
    if (savedPos !== undefined) {
      const frameId = requestAnimationFrame(() => {
        window.scrollTo({ top: savedPos, behavior: 'instant' as ScrollBehavior });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [currentRoute]);

  // Handle browser Back & Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      let targetRoute: AppRoute = '/';

      if (path === '/crew') {
        targetRoute = '/team';
      } else if (path.startsWith('/projects')) {
        targetRoute = path as AppRoute;
      } else {
        const validRoutes: AppRoute[] = ['/', '/about', '/projects', '/gallery', '/team', '/contact'];
        targetRoute = validRoutes.includes(path as AppRoute) ? (path as AppRoute) : '/';
      }

      // Save scroll for leaving route
      scrollPositions.current[currentRoute] = window.scrollY;
      setCurrentRoute(targetRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentRoute]);

  const handleRouteChange = (route: AppRoute) => {
    if (typeof window !== 'undefined') {
      scrollPositions.current[currentRoute] = window.scrollY;
    }
    const normalizedRoute = (route === '/crew' ? '/team' : route) as AppRoute;
    setCurrentRoute(normalizedRoute);
    if (window.location.pathname !== normalizedRoute) {
      window.history.pushState(null, '', normalizedRoute);
    }
  };

  // Render the corresponding active page
  const renderCurrentPage = () => {
    if (currentRoute.startsWith('/projects')) {
      const initialProject = getProjectFromRoute(currentRoute);
      return (
        <ProjectsPage
          onRouteChange={handleRouteChange}
          initialProject={initialProject}
        />
      );
    }

    switch (currentRoute) {
      case '/about':
        return <AboutPage onRouteChange={handleRouteChange} />;
      case '/gallery':
        return <GalleryPage onRouteChange={handleRouteChange} />;
      case '/team':
      case '/crew':
        return <TeamPage onRouteChange={handleRouteChange} />;
      case '/contact':
        return <ContactPage onRouteChange={handleRouteChange} />;
      case '/':
      default:
        return <HomePage onRouteChange={handleRouteChange} />;
    }
  };

  const isProjectsWorkspace = currentRoute.startsWith('/projects');

  return (
    <div className={`min-h-screen flex flex-col ${isProjectsWorkspace ? 'bg-[#0D0E13] text-[#F3EEE5]' : 'bg-[#F3EEE5] text-[#0A0A09]'}`}>
      {/* Cinematic Brand Preloader: "THE X IS THE NEXUS" */}
      {showPreloader && (
        <CinematicPreloader
          onHandoffStart={() => setIsHandoffStarted(true)}
          onComplete={() => {
            setShowPreloader(false);
            setIsHandoffStarted(true);
          }}
        />
      )}

      {/* Global Isolated Mascot Director (Active on standard website pages) */}
      {!isProjectsWorkspace && (
        <NexusPenguin currentRoute={currentRoute} preloaderFinished={!showPreloader} />
      )}

      {/* Contextual Cursor for fine-pointer desktop interactions */}
      <ContextCursor />

      {/* Persistent Global Responsive Navbar (Shown on all standard pages) */}
      {!isProjectsWorkspace && (
        <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />
      )}

      {/* Primary Route View */}
      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentRoute}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full flex-1 flex flex-col"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Global Footer (Shown on standard website pages) */}
      {!isProjectsWorkspace && <Footer onRouteChange={handleRouteChange} />}
    </div>
  );
}
