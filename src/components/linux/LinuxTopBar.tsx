/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppRoute } from '../../types.ts';
import {
  Terminal,
  Folder,
  Cpu,
  Clock,
  ArrowLeft,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
  Maximize,
  Minimize,
  ExternalLink,
} from 'lucide-react';

interface LinuxTopBarProps {
  activeWindowTitle?: string;
  onRouteChange: (route: AppRoute) => void;
  onOpenTerminal: () => void;
  onOpenFileManager: () => void;
  onOpenSystemInfo: () => void;
  openWindowsCount: number;
}

export const LinuxTopBar: React.FC<LinuxTopBarProps> = ({
  activeWindowTitle,
  onRouteChange,
  onOpenTerminal,
  onOpenFileManager,
  onOpenSystemInfo,
  openWindowsCount,
}) => {
  const [time, setTime] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(6);
  const menuRef = useRef<HTMLDivElement>(null);

  // Digital clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle dynamic CPU jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(2, Math.min(24, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Outside click for menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMenuOpen]);

  const navLinks: { label: string; route: AppRoute }[] = [
    { label: 'HOME (WEBSITE)', route: '/' },
    { label: 'ABOUT (NARRATIVE)', route: '/about' },
    { label: 'PROJECTS (WORKSPACE)', route: '/projects' },
    { label: 'GALLERY (EXHIBITION)', route: '/gallery' },
    { label: 'TEAM (SQUAD ARCHIVE)', route: '/team' },
    { label: 'CONTACT (STUDIO ACCESS)', route: '/contact' },
  ];

  return (
    <header className="h-8 w-full bg-[#0D0E13] border-b border-[rgba(243,238,229,0.12)] px-3 flex items-center justify-between font-mono text-xs text-[#F3EEE5] select-none z-50 fixed top-0 left-0 right-0 shadow-xs">
      {/* LEFT: System Launcher & App Indicator */}
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer border ${
            isMenuOpen
              ? 'bg-[#EF5A2A] text-[#0A0A09] font-bold border-[#EF5A2A]'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-[#F3EEE5] border-white/10'
          }`}
          title="NEXUS Application Menu"
        >
          <span className="font-bold text-[#EF5A2A] group-hover:text-black">◆</span>
          <span className="font-bold tracking-wider">NEXUS_OS</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* Launcher Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-8 left-0 w-64 bg-[#14151C] border border-[rgba(243,238,229,0.18)] shadow-[0_16px_40px_rgba(0,0,0,0.8)] rounded-[2px] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] text-[#8C8881] uppercase font-bold tracking-wider border-b border-white/10">
              WEBSITE NAVIGATION
            </div>
            {navLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  setIsMenuOpen(false);
                  onRouteChange(item.route);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  item.route === '/projects'
                    ? 'bg-[#EF5A2A]/20 text-[#EF5A2A] font-bold border-l-2 border-[#EF5A2A]'
                    : 'text-[#D3CDC3] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.route === '/projects' && <span className="text-[10px] font-bold">[ACTIVE]</span>}
              </button>
            ))}

            <div className="pt-2 border-t border-white/10">
              <div className="px-2 py-1 text-[10px] text-[#8C8881] uppercase font-bold tracking-wider">
                WORKSPACE TOOLS
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenTerminal();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs text-[#D3CDC3] hover:bg-white/[0.08] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>NEXUS Terminal (CLI)</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenFileManager();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs text-[#D3CDC3] hover:bg-white/[0.08] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>Files Explorer</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenSystemInfo();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs text-[#D3CDC3] hover:bg-white/[0.08] hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#EF5A2A]" />
                <span>System Specs</span>
              </button>
            </div>
          </div>
        )}

        {/* Focused Window Pill */}
        {activeWindowTitle && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.04] rounded-[2px] border border-white/5 text-[#A6A095]">
            <span className="w-1.5 h-1.5 bg-[#EF5A2A] rounded-full animate-pulse" />
            <span className="truncate max-w-[180px] text-white text-[11px] font-bold">
              {activeWindowTitle}
            </span>
          </div>
        )}
      </div>

      {/* CENTER: Workspace Directory Indicator */}
      <div className="hidden md:flex items-center gap-2 text-[#8C8881] text-[11px]">
        <span>HOST: nexus-workstation-01</span>
        <span>•</span>
        <span className="text-[#D3CDC3]">/home/nexus/projects</span>
      </div>

      {/* RIGHT: System Stats, Tools, Clock, and Exit Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* CPU Monitor Chip */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-[2px] border border-white/5 text-[11px] text-[#A6A095]">
          <Cpu className="w-3 h-3 text-[#EF5A2A]" />
          <span>CPU {cpuUsage}%</span>
        </div>

        {/* Quick Launch Icons */}
        <button
          onClick={onOpenTerminal}
          className="p-1 text-[#A6A095] hover:text-white hover:bg-white/[0.08] rounded-[2px] transition-colors cursor-pointer"
          title="Open Terminal (Ctrl+Alt+T)"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenFileManager}
          className="p-1 text-[#A6A095] hover:text-white hover:bg-white/[0.08] rounded-[2px] transition-colors cursor-pointer"
          title="Open File Manager"
        >
          <Folder className="w-3.5 h-3.5" />
        </button>

        {/* Digital Clock */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-[2px] border border-white/5 text-[11px] text-[#F3EEE5] font-bold">
          <Clock className="w-3 h-3 text-[#EF5A2A]" />
          <span>{time || '00:00:00'}</span>
        </div>

        {/* Exit Workspace / Return to Main Site Button */}
        <button
          onClick={() => onRouteChange('/')}
          className="flex items-center gap-1 px-2.5 py-0.5 bg-[#EF5A2A] hover:bg-[#d94e22] text-[#0A0A09] font-bold text-xs rounded-[2px] transition-colors cursor-pointer ml-1 shadow-xs"
          title="Exit Linux Desktop & Return to Home"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="hidden sm:inline">EXIT WORKSPACE</span>
          <span className="sm:hidden">EXIT</span>
        </button>
      </div>
    </header>
  );
};
