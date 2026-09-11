/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LinuxWindowData } from './types.ts';
import { Terminal, Folder, Info, Layers, X } from 'lucide-react';

interface LinuxDockProps {
  windows: LinuxWindowData[];
  activeWindowId: string | null;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onOpenTerminal: () => void;
  onOpenFileManager: () => void;
  onOpenSystemInfo: () => void;
}

export const LinuxDock: React.FC<LinuxDockProps> = ({
  windows,
  activeWindowId,
  onFocusWindow,
  onMinimizeWindow,
  onCloseWindow,
  onOpenTerminal,
  onOpenFileManager,
  onOpenSystemInfo,
}) => {
  const getWindowIcon = (win: LinuxWindowData) => {
    switch (win.type) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-[#EF5A2A]" />;
      case 'file-manager':
        return <Folder className="w-3.5 h-3.5 text-[#EF5A2A]" />;
      case 'system-info':
        return <Info className="w-3.5 h-3.5 text-[#EF5A2A]" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-[#EF5A2A]" />;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#0D0E13]/95 backdrop-blur-md border-t border-[rgba(243,238,229,0.1)] px-3 flex items-center justify-between z-40 select-none font-mono text-xs">
      {/* Left: Quick Launch Pinned Docks */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenFileManager}
          className="p-1.5 hover:bg-white/[0.08] rounded-[2px] text-[#A6A095] hover:text-[#EF5A2A] transition-colors cursor-pointer"
          title="File Manager"
        >
          <Folder className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenTerminal}
          className="p-1.5 hover:bg-white/[0.08] rounded-[2px] text-[#A6A095] hover:text-[#EF5A2A] transition-colors cursor-pointer"
          title="Terminal (Ctrl+Alt+T)"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSystemInfo}
          className="p-1.5 hover:bg-white/[0.08] rounded-[2px] text-[#A6A095] hover:text-[#EF5A2A] transition-colors cursor-pointer"
          title="System Information"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Running Tasks / Window Pills */}
      <div className="flex-1 flex items-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
        {windows.map((win) => {
          const isActive = activeWindowId === win.id && !win.isMinimized;

          return (
            <div
              key={win.id}
              onClick={() => {
                if (win.isMinimized) {
                  onFocusWindow(win.id);
                } else if (isActive) {
                  onMinimizeWindow(win.id);
                } else {
                  onFocusWindow(win.id);
                }
              }}
              className={`group flex items-center gap-2 px-3 py-1 rounded-[2px] border transition-all cursor-pointer max-w-[160px] sm:max-w-[200px] shrink-0 ${
                isActive
                  ? 'bg-[#1D1F28] border-[#EF5A2A] text-white shadow-xs'
                  : win.isMinimized
                  ? 'bg-black/30 border-white/5 text-[#8C8881] opacity-70 hover:opacity-100 hover:bg-white/[0.04]'
                  : 'bg-[#14151C] border-white/10 text-[#D3CDC3] hover:bg-white/[0.06]'
              }`}
            >
              {getWindowIcon(win)}
              <span className="truncate text-xs font-bold">{win.title}</span>

              {/* Close Button on Dock Pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseWindow(win.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-[#EF5A2A] p-0.5 ml-auto transition-opacity"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Right: Active Workspace Badge */}
      <div className="flex items-center gap-2 shrink-0 text-[#8C8881] text-[11px] hidden sm:flex">
        <span>WS:1 [PROJECTS]</span>
        <span className="w-1.5 h-1.5 bg-[#EF5A2A] rounded-full" />
      </div>
    </div>
  );
};
