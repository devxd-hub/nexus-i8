/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { AppRoute } from './types.ts';

export default function App() {
  const shouldReduceMotion = useReducedMotion();

  // Normalize initial route from current browser pathname if valid
  const getInitialRoute = (): AppRoute => {
    if (typeof window === 'undefined') return '/';
    const path = window.location.pathname as AppRoute;
    const validRoutes: AppRoute[] = ['/', '/about', '/projects', '/gallery', '/team', '/contact'];
    return validRoutes.includes(path) ? path : '/';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isHandoffStarted, setIsHandoffStarted] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      const validRoutes: AppRoute[] = ['/', '/about', '/projects', '/gallery', '/team', '/contact'];
      setCurrentRoute(validRoutes.includes(path) ? path : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleRouteChange = (route: AppRoute) => {
    setCurrentRoute(route);
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
  };

  // Render the corresponding active page
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/about':
        return <AboutPage onRouteChange={handleRouteChange} />;
      case '/projects':
        return <ProjectsPage onRouteChange={handleRouteChange} />;
      case '/gallery':
        return <GalleryPage onRouteChange={handleRouteChange} />;
      case '/team':
        return <TeamPage onRouteChange={handleRouteChange} />;
      case '/contact':
        return <ContactPage onRouteChange={handleRouteChange} />;
      case '/':
      default:
        return <HomePage onRouteChange={handleRouteChange} />;
    }
  };

  const isProjectsWorkspace = currentRoute === '/projects';

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
