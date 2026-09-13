/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../../types.ts';
import { Cpu, HardDrive, Terminal, Shield, Award, Users } from 'lucide-react';

export const LinuxSystemInfo: React.FC = () => {
  return (
    <div className="flex-1 p-6 bg-[#141414] text-[#F5EFE6] font-mono text-xs overflow-y-auto space-y-6 select-text">
      {/* OS Banner */}
      <div className="flex items-center gap-4 pb-4 border-b border-[rgba(245,239,230,0.10)]">
        <div className="w-12 h-12 rounded-[3px] bg-[#181818] border border-[#F2613F] flex items-center justify-center text-[#F2613F] font-bold text-xl">
          ◆
        </div>
        <div>
          <h2 className="font-fraunces font-bold text-xl text-[#F5EFE6]">NEXUS Workstation OS</h2>
          <p className="text-[#857E74] text-xs">Version 2.6.4 (Architect Edition / x86_64)</p>
        </div>
      </div>

      {/* System Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-[#181818] border border-[rgba(245,239,230,0.10)] rounded-[2px] space-y-1">
          <div className="text-[#F2613F] font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>KERNEL ARCHITECTURE</span>
          </div>
          <div className="text-[#C2BBB0]">NEXUS-VFS-React-Compositor 6.1.0</div>
          <div className="text-[#857E74] text-[10px]">6 Project Nodes Mounted</div>
        </div>

        <div className="p-3 bg-[#181818] border border-[rgba(245,239,230,0.10)] rounded-[2px] space-y-1">
          <div className="text-[#F2613F] font-bold flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>STUDIO STORAGE</span>
          </div>
          <div className="text-[#C2BBB0]">/home/nexus/projects [Read-Only]</div>
          <div className="text-[#857E74] text-[10px]">Verified Artifacts: 100%</div>
        </div>
      </div>

      {/* About The Collective */}
      <div className="space-y-2">
        <span className="text-[10px] text-[#F2613F] uppercase tracking-widest font-bold block">
          ABOUT THE NEXUS REPOSITORY
        </span>
        <p className="font-bitter text-sm text-[#C2BBB0] leading-relaxed">
          The NEXUS Projects Workspace is an interactive engineering archive representing interdisciplinary prototypes, hardware instruments, open-source software, and environmental sensor networks built by student squads.
        </p>
      </div>

      {/* Shortcut Guide */}
      <div className="p-4 bg-[#181818] border border-[rgba(245,239,230,0.10)] rounded-[2px] space-y-2">
        <span className="text-[10px] text-[#F2613F] uppercase tracking-widest font-bold block">
          KEYBOARD SHORTCUTS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#857E74]">
          <div><span className="text-[#F5EFE6] font-bold">Ctrl+Alt+T</span> : Open Terminal</div>
          <div><span className="text-[#F5EFE6] font-bold">Alt+Tab</span> : Cycle Open Windows</div>
          <div><span className="text-[#F5EFE6] font-bold">Enter</span> : Open Selected Folder</div>
          <div><span className="text-[#F5EFE6] font-bold">Esc</span> : Close Menus / Modals</div>
        </div>
      </div>
    </div>
  );
};

interface LinuxPropertiesViewProps {
  project: Project;
}

export const LinuxPropertiesView: React.FC<LinuxPropertiesViewProps> = ({ project }) => {
  return (
    <div className="flex-1 p-6 bg-[#141414] text-[#F5EFE6] font-mono text-xs overflow-y-auto space-y-4 select-text">
      <div className="flex items-center gap-3 pb-3 border-b border-[rgba(245,239,230,0.10)]">
        <div className="w-10 h-10 rounded-[2px] bg-[#181818] border border-[rgba(245,239,230,0.10)] flex items-center justify-center text-[#F2613F] text-lg font-bold">
          📁
        </div>
        <div>
          <h3 className="font-bold text-[#F5EFE6] text-base">{project.title.toLowerCase()}</h3>
          <p className="text-[#857E74] text-[11px]">Folder ({project.projectNumber})</p>
        </div>
      </div>

      <div className="space-y-2 text-[#C2BBB0]">
        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Location:</span>
          <span className="col-span-2 text-[#F5EFE6]">/home/nexus/projects/{project.title.toLowerCase()}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Discipline:</span>
          <span className="col-span-2 text-[#F5EFE6]">{project.disciplines}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Cohort Year:</span>
          <span className="col-span-2 text-[#F5EFE6]">{project.year}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Status:</span>
          <span className="col-span-2 text-[#F2613F] font-bold">{project.status}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Squad Leads:</span>
          <span className="col-span-2 text-[#F5EFE6]">{project.leadStudents.join(', ')}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 border-b border-[rgba(245,239,230,0.10)]">
          <span className="text-[#857E74]">Permissions:</span>
          <span className="col-span-2 text-[#F5EFE6]">rwxr-xr-x (nexus:staff)</span>
        </div>
      </div>
    </div>
  );
};
