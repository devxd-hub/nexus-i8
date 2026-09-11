/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppRoute } from '../types.ts';
import { LinuxDesktop } from '../components/linux/LinuxDesktop.tsx';

interface ProjectsPageProps {
  onRouteChange: (route: AppRoute) => void;
}

/**
 * PROJECTS PAGE — NEXUS LINUX WORKSPACE EXPERIENCE
 *
 * An interactive, Linux-like desktop workstation environment where every
 * project is mounted into a virtual filesystem as an interactive folder/application.
 * Includes top system bar, multi-window manager, simulated bash terminal,
 * file manager explorer, and contextual action menus with direct access to
 * real student project artifacts and GitHub repositories.
 */
export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onRouteChange }) => {
  return (
    <div id="nexus-projects-workspace" className="w-full h-full min-h-screen bg-[#0D0E13]">
      <LinuxDesktop onRouteChange={onRouteChange} />
    </div>
  );
};

export default ProjectsPage;
