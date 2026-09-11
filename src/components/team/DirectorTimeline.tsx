/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TimelineStep {
  id: string;
  index: string;
  label: string;
}

interface DirectorTimelineProps {
  steps: TimelineStep[];
  activeId: string;
  onSelectStep?: (id: string) => void;
}

/**
 * DIRECTOR'S TIMELINE
 * An extremely subtle, understated vertical progress indicator.
 * Displays minimalist numbers (01, 02, 03, ...) that quietly update with scroll
 * to provide natural orientation without resembling a SaaS dashboard.
 */
export const DirectorTimeline: React.FC<DirectorTimelineProps> = ({
  steps,
  activeId,
  onSelectStep,
}) => {
  return (
    <aside
      aria-label="Scene Timeline"
      className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3 pointer-events-auto select-none"
    >
      <div className="flex flex-col items-end gap-2 pr-1">
        {steps.map((step) => {
          const isActive = activeId === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (onSelectStep) {
                  onSelectStep(step.id);
                } else {
                  const el = document.getElementById(step.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              aria-label={`Jump to ${step.label} (${step.index})`}
              aria-current={isActive ? 'step' : undefined}
              className="group flex items-center gap-2 text-right transition-all duration-300 py-0.5 cursor-pointer bg-transparent border-0"
            >
              {/* Optional understated hover title */}
              <span
                className={`text-[10px] font-dosis font-bold tracking-[0.24em] uppercase transition-all duration-300 ${
                  isActive
                    ? 'text-[#EF5A2A] opacity-100 translate-x-0'
                    : 'text-[#66615A] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0'
                }`}
              >
                {step.label}
              </span>

              {/* Number Index */}
              <span
                className={`font-dosis text-xs tracking-[0.18em] transition-all duration-300 ${
                  isActive
                    ? 'font-bold text-[#EF5A2A] scale-110'
                    : 'font-normal text-[#66615A]/60 group-hover:text-[#0A0A09]'
                }`}
              >
                {step.index}
              </span>

              {/* Minimal tick indicator */}
              <span
                className={`w-1.5 h-[1.5px] transition-all duration-300 ${
                  isActive
                    ? 'w-3 bg-[#EF5A2A]'
                    : 'bg-[#66615A]/30 group-hover:bg-[#66615A]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};
