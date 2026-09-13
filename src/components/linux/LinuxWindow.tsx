/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LinuxWindowData } from './types.ts';
import { Minus, Square, X, Folder, Terminal, Info, ExternalLink } from 'lucide-react';

interface LinuxWindowProps {
  window: LinuxWindowData;
  isActive: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export const LinuxWindow: React.FC<LinuxWindowProps> = ({
  window: win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  children,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDownHeader = (e: React.PointerEvent) => {
    if (win.isMaximized) return; // Prevent dragging while maximized
    // Ignore clicks on control buttons
    if ((e.target as HTMLElement).closest('button')) return;

    onFocus(win.id);
    isDraggingRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { x: win.x, y: win.y };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    const newX = Math.max(10, Math.min(windowStartPos.current.x + deltaX, window.innerWidth - 100));
    const newY = Math.max(34, Math.min(windowStartPos.current.y + deltaY, window.innerHeight - 80));

    onMove(win.id, newX, newY);
  };

  const handlePointerUpHeader = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  if (win.isMinimized) {
    return null;
  }

  const getWindowIcon = () => {
    switch (win.type) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-[#F2613F]" />;
      case 'file-manager':
        return <Folder className="w-3.5 h-3.5 text-[#F2613F]" />;
      case 'system-info':
        return <Info className="w-3.5 h-3.5 text-[#F2613F]" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-[#F2613F]" />;
    }
  };

  return (
    <div
      id={`window-${win.id}`}
      onMouseDown={() => onFocus(win.id)}
      onTouchStart={() => onFocus(win.id)}
      style={{
        position: 'fixed',
        left: win.isMaximized ? 0 : `${win.x}px`,
        top: win.isMaximized ? 32 : `${win.y}px`,
        width: win.isMaximized ? '100vw' : `${win.width}px`,
        height: win.isMaximized ? 'calc(100vh - 72px)' : `${win.height}px`,
        maxWidth: 'calc(100vw - 12px)',
        maxHeight: 'calc(100vh - 76px)',
        zIndex: win.zIndex,
      }}
      className={`flex flex-col bg-[#181818] border rounded-[3px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] select-text transition-[width,height,left,top] duration-150 overflow-hidden ${
        isActive
          ? 'border-[rgba(242,97,63,0.45)] ring-1 ring-[rgba(242,97,63,0.25)] shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
          : 'border-[rgba(245,239,230,0.10)] opacity-95'
      }`}
    >
      {/* Active Orange Header Border Indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#F2613F] z-20" />
      )}

      {/* Linux Window Title Bar */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        onPointerCancel={handlePointerUpHeader}
        style={{ touchAction: 'none' }}
        className={`h-10 sm:h-9 px-3 flex items-center justify-between border-b cursor-grab active:cursor-grabbing select-none shrink-0 transition-colors ${
          isActive
            ? 'bg-[#22201F] border-[rgba(245,239,230,0.14)] text-[#F5EFE6]'
            : 'bg-[#181818] border-[rgba(245,239,230,0.08)] text-[#857E74]'
        }`}
      >
        {/* Left Title & Icon */}
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {getWindowIcon()}
          <span className="font-mono text-xs font-bold tracking-tight truncate">
            {win.title}
          </span>
          {win.filePath && (
            <span className="font-mono text-[10px] text-[#857E74] truncate hidden sm:inline">
              — {win.filePath}
            </span>
          )}
        </div>

        {/* Linux-Style Right Window Control Buttons (Minimize, Maximize, Close) with Touch Target */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Minimize */}
          <button
            type="button"
            title="Minimize window"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(win.id);
            }}
            className="w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded-[2px] bg-white/[0.06] hover:bg-white/[0.14] text-[#C2BBB0] hover:text-[#F5EFE6] transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            title={win.isMaximized ? 'Restore window' : 'Maximize window'}
            onClick={(e) => {
              e.stopPropagation();
              onMaximize(win.id);
            }}
            className="w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded-[2px] bg-white/[0.06] hover:bg-white/[0.14] text-[#C2BBB0] hover:text-[#F5EFE6] transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            title="Close window"
            onClick={(e) => {
              e.stopPropagation();
              onClose(win.id);
            }}
            className="w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded-[2px] bg-white/[0.06] hover:bg-[#F2613F] text-[#C2BBB0] hover:text-[#F5EFE6] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>

      {/* Window Content Body */}
      <div className="flex-1 overflow-auto bg-[#141414] text-[#F5EFE6] flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};
