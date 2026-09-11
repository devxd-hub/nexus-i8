/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../../types.ts';
import { Cpu, Code, Layers, Sparkles, Globe, Terminal, Folder } from 'lucide-react';

interface LinuxFolderIconProps {
  project: Project;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, project: Project) => void;
  index: number;
}

export const LinuxFolderIcon: React.FC<LinuxFolderIconProps> = ({
  project,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
  index,
}) => {
  // Category mini-indicator icon
  const getCategoryIcon = () => {
    switch (project.category) {
      case 'Technology':
        return <Code className="w-3 h-3 text-[#EF5A2A]" />;
      case 'Physical Computing':
        return <Cpu className="w-3 h-3 text-[#EF5A2A]" />;
      case 'Creative Production':
        return <Sparkles className="w-3 h-3 text-[#EF5A2A]" />;
      case 'Community Tools':
        return <Globe className="w-3 h-3 text-[#EF5A2A]" />;
      default:
        return <Layers className="w-3 h-3 text-[#EF5A2A]" />;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Project folder ${project.title}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, project);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onDoubleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`group flex flex-col items-center justify-center p-3 rounded-[3px] transition-all duration-150 cursor-pointer select-none text-center outline-none relative ${
        isSelected
          ? 'bg-[#EF5A2A]/20 border border-[#EF5A2A] shadow-[0_0_12px_rgba(239,90,42,0.25)]'
          : 'bg-transparent border border-transparent hover:bg-white/[0.04] hover:border-white/10'
      }`}
      style={{
        width: '108px',
      }}
    >
      {/* Folder Visual Construct */}
      <div className="relative w-14 h-11 mb-2 flex items-center justify-center transition-transform duration-150 group-hover:-translate-y-0.5">
        {/* Custom Linux Desktop Folder SVG */}
        <svg
          viewBox="0 0 56 44"
          className="w-full h-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Tab */}
          <path
            d="M2 7C2 4.79086 3.79086 3 6 3H22L27 9H50C52.2091 9 54 10.7909 54 13V38C54 40.2091 52.2091 42 50 42H6C3.79086 42 2 40.2091 2 38V7Z"
            fill="#1E2026"
            stroke="rgba(243,238,229,0.18)"
            strokeWidth="1.2"
          />

          {/* Orange Accent Top Ridge */}
          <path
            d="M6 3H22L27 9H6C3.79086 9 2 7.20914 2 5V7C2 4.79086 3.79086 3 6 3Z"
            fill="#EF5A2A"
          />

          {/* Front Body Flap */}
          <path
            d="M2 15C2 13.3431 3.34315 12 5 12H51C52.6569 12 54 13.3431 54 15V38C54 40.2091 52.2091 42 50 42H6C3.79086 42 2 40.2091 2 38V15Z"
            fill={isSelected ? '#2A2C35' : '#17181F'}
            stroke={isSelected ? '#EF5A2A' : 'rgba(243,238,229,0.22)'}
            strokeWidth="1.2"
          />

          {/* Inner Crease Line */}
          <line
            x1="6"
            y1="18"
            x2="50"
            y2="18"
            stroke="rgba(243,238,229,0.08)"
            strokeWidth="1"
          />
        </svg>

        {/* Category Badge Icon Center Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pt-2 pointer-events-none">
          <div className="p-1 rounded-[2px] bg-[#0A0A09]/70 border border-[rgba(243,238,229,0.12)]">
            {getCategoryIcon()}
          </div>
        </div>

        {/* Small Project Number Tag in Corner */}
        <span className="absolute -bottom-1 -right-1 font-mono text-[8px] font-bold text-[#EF5A2A] px-1 py-0.2 bg-[#0A0A09] border border-[rgba(239,90,42,0.4)] rounded-[2px]">
          {project.projectNumber.split('/')[1]?.trim() || `0${index + 1}`}
        </span>
      </div>

      {/* Folder Name & Info */}
      <div className="w-full">
        <span
          className={`font-mono text-[11px] font-bold tracking-tight block truncate px-1 py-0.5 rounded-[2px] ${
            isSelected
              ? 'bg-[#EF5A2A] text-[#0A0A09]'
              : 'text-[#F3EEE5] group-hover:text-white'
          }`}
        >
          {project.title.toLowerCase()}
        </span>

        <span className="font-mono text-[9px] text-[#8C8881] block truncate uppercase mt-0.5">
          {project.year} // {project.category.slice(0, 8)}
        </span>
      </div>
    </div>
  );
};
