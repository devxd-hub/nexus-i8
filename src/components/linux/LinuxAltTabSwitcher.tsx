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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0C]/80 select-none pointer-events-none">
      <div className="bg-[#181818] border border-[rgba(242,97,63,0.4)] p-4 rounded-[4px] shadow-xl flex items-center gap-3">
        {windows.map((win, idx) => {
          const isSelected = idx === selectedIndex;

          return (
            <div
              key={win.id}
              className={`flex flex-col items-center justify-center p-3 rounded-[3px] border transition-all w-28 h-24 text-center ${
                isSelected
                  ? 'bg-[#22201F] border-[#F2613F] text-[#F5EFE6] scale-105'
                  : 'bg-[#141414] border-[rgba(245,239,230,0.10)] text-[#857E74]'
              }`}
            >
              {win.type === 'terminal' ? (
                <Terminal className="w-8 h-8 text-[#F2613F] mb-2" />
              ) : win.type === 'system-info' ? (
                <Info className="w-8 h-8 text-[#F2613F] mb-2" />
              ) : (
                <Folder className="w-8 h-8 text-[#F2613F] mb-2" />
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
