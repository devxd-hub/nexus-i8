/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Project, AppRoute } from '../../types.ts';
import { ContextMenuState, SortMode } from './types.ts';
import {
  Terminal,
  Folder,
  ArrowUpDown,
  RotateCw,
  Info,
  ExternalLink,
  FileText,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface LinuxContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onOpenTerminal: () => void;
  onOpenFileManager: () => void;
  onOpenSystemInfo: () => void;
  onOpenProject: (project: Project) => void;
  onOpenProperties: (project: Project) => void;
  onSort: (mode: SortMode) => void;
  onRefresh: () => void;
  onReturnToWeb: () => void;
}

export const LinuxContextMenu: React.FC<LinuxContextMenuProps> = ({
  state,
  onClose,
  onOpenTerminal,
  onOpenFileManager,
  onOpenSystemInfo,
  onOpenProject,
  onOpenProperties,
  onSort,
  onRefresh,
  onReturnToWeb,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!state.isOpen) return null;

  // Viewport edge clamping calculation
  const menuWidth = 220;
  const menuHeight = state.targetType === 'project-folder' ? 180 : 250;

  const posX = Math.min(state.x, window.innerWidth - menuWidth - 10);
  const posY = Math.min(state.y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${posX}px`,
        top: `${posY}px`,
        zIndex: 9999,
      }}
      className="w-56 bg-[#16171F] border border-[rgba(243,238,229,0.18)] rounded-[3px] shadow-[0_12px_32px_rgba(0,0,0,0.8)] py-1.5 text-[#F3EEE5] font-mono text-xs select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {state.targetType === 'project-folder' && state.targetProject ? (
        /* FOLDER CONTEXT MENU */
        <div className="space-y-0.5">
          <div className="px-3 py-1 text-[10px] text-[#EF5A2A] font-bold border-b border-white/10 uppercase truncate">
            📁 {state.targetProject.title}
          </div>

          <button
            onClick={() => {
              onOpenProject(state.targetProject!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Open Project</span>
          </button>

          <button
            onClick={() => {
              onOpenProperties(state.targetProject!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Properties & Specs</span>
          </button>

          {state.targetProject.githubUrl && (
            <button
              onClick={() => {
                window.open(state.targetProject!.githubUrl, '_blank', 'noopener,noreferrer');
                onClose();
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#EF5A2A]" />
              <span>Open GitHub</span>
            </button>
          )}

          {state.targetProject.demoUrl && (
            <button
              onClick={() => {
                window.open(state.targetProject!.demoUrl, '_blank', 'noopener,noreferrer');
                onClose();
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#EF5A2A]" />
              <span>Open Live Demo</span>
            </button>
          )}
        </div>
      ) : (
        /* DESKTOP BACKGROUND CONTEXT MENU */
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onOpenTerminal();
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#EF5A2A]" />
              <span>Open Terminal</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+Alt+T</span>
          </button>

          <button
            onClick={() => {
              onOpenFileManager();
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Folder className="w-3.5 h-3.5 text-[#EF5A2A]" />
            <span>Open Files Explorer</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <div className="px-3 py-1 text-[10px] text-[#8C8881] uppercase font-bold tracking-wider">
            Sort Projects
          </div>

          <button
            onClick={() => {
              onSort('name');
              onClose();
            }}
            className="w-full px-4 py-1 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>• By Name (A-Z)</span>
          </button>

          <button
            onClick={() => {
              onSort('year');
              onClose();
            }}
            className="w-full px-4 py-1 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>• By Year (Newest)</span>
          </button>

          <button
            onClick={() => {
              onSort('category');
              onClose();
            }}
            className="w-full px-4 py-1 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>• By Category</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Workspace</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+R</span>
          </button>

          <button
            onClick={() => {
              onOpenSystemInfo();
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#EF5A2A] hover:text-[#0A0A09] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About NEXUS Workspace</span>
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            onClick={() => {
              onReturnToWeb();
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-white hover:text-[#0A0A09] text-[#EF5A2A] flex items-center gap-2 cursor-pointer transition-colors font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Web (Exit)</span>
          </button>
        </div>
      )}
    </div>
  );
};
