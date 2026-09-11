/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LinuxWindowData } from './types.ts';
import { Terminal, Folder, Info } from 'lucide-react';

interface LinuxAltTabSwitcherProps {
  windows: LinuxWindowData[];
  selectedIndex: number;
}

export const LinuxAltTabSwitcher: React.FC<LinuxAltTabSwitcherProps> = ({
  windows,
  selectedIndex,
}) => {
  if (windows.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none pointer-events-none">
      <div className="bg-[#14151C]/95 border border-[rgba(239,90,42,0.4)] p-4 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-3">
        {windows.map((win, idx) => {
          const isSelected = idx === selectedIndex;

          return (
            <div
              key={win.id}
              className={`flex flex-col items-center justify-center p-3 rounded-[3px] border transition-all w-28 h-24 text-center ${
                isSelected
                  ? 'bg-[#EF5A2A]/25 border-[#EF5A2A] text-white shadow-[0_0_15px_rgba(239,90,42,0.3)] scale-105'
                  : 'bg-[#1C1E26] border-white/10 text-[#8C8881]'
              }`}
            >
              {win.type === 'terminal' ? (
                <Terminal className="w-8 h-8 text-[#EF5A2A] mb-2" />
              ) : win.type === 'system-info' ? (
                <Info className="w-8 h-8 text-[#EF5A2A] mb-2" />
              ) : (
                <Folder className="w-8 h-8 text-[#EF5A2A] mb-2" />
              )}
              <span className="font-mono text-xs font-bold truncate w-full">
                {win.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
