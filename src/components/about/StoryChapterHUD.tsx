/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface StoryChapterInfo {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}

export const STORY_CHAPTERS: StoryChapterInfo[] = [
  { id: 'chapter-01-intersection', number: '01', title: 'THE INTERSECTION', subtitle: 'Origin & Foundation' },
  { id: 'chapter-02-thesis', number: '02', title: 'WHY WE EXIST', subtitle: 'The Core Thesis' },
  { id: 'chapter-03-problem', number: '03', title: 'THE STRUCTURAL PROBLEM', subtitle: 'Silos vs Squads' },
  { id: 'chapter-04-connection', number: '04', title: 'THE CONNECTION', subtitle: 'Convergence of Disciplines' },
  { id: 'chapter-05-process', number: '05', title: 'HOW WE WORK', subtitle: 'The 6-Week Sprint Loop' },
  { id: 'chapter-06-artifacts', number: '06', title: 'WHAT WE BUILD', subtitle: 'The Shipped Artifacts' },
  { id: 'chapter-07-people', number: '07', title: 'THE PEOPLE', subtitle: 'The Student Collective' },
  { id: 'chapter-08-archive', number: '08', title: 'THE ARCHIVE', subtitle: 'Photographic Chronology' },
  { id: 'chapter-09-horizon', number: '09', title: 'WHAT COMES NEXT', subtitle: 'The Horizon & Beyond' },
];

interface StoryChapterHUDProps {
  activeChapterIndex: number;
  scrollProgress: number;
  onSelectChapter: (index: number) => void;
}

export const StoryChapterHUD: React.FC<StoryChapterHUDProps> = ({
  activeChapterIndex,
  scrollProgress,
  onSelectChapter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentChapter = STORY_CHAPTERS[activeChapterIndex] || STORY_CHAPTERS[0];

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
      onSelectChapter(activeChapterIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeChapterIndex < STORY_CHAPTERS.length - 1) {
      onSelectChapter(activeChapterIndex + 1);
    }
  };

  return (
    <>
      {/* 1. Global Reading Progress Edge Bar (Right edge hairline on desktop) */}
      <div className="fixed right-0 top-0 bottom-0 w-[2px] z-40 pointer-events-none bg-[rgba(10,10,9,0.06)] hidden md:block">
        <div
          className="w-full bg-[#EF5A2A] origin-top transition-all duration-75"
          style={{ height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* 2. Small Subtle Editorial Chapter Indicator */}
      <aside
        aria-label="Story chapter progression navigation"
        className="fixed bottom-6 right-4 sm:right-6 z-40 select-none flex flex-col items-end"
      >
        {/* Expanded Chapters Menu Popover */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2 p-3.5 bg-[#0A0A09]/95 text-[#F3EEE5] border border-[rgba(243,238,229,0.16)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] rounded-[2px] w-72 sm:w-80 backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[rgba(243,238,229,0.12)]">
                <span className="font-dosis text-[10px] uppercase font-bold tracking-[0.24em] text-[#EF5A2A] flex items-center gap-1.5">
                  <Compass className="w-3 h-3" />
                  <span>CHAPTERS (01–09)</span>
                </span>
                <span className="font-mono text-[10px] text-[#F3EEE5]/60 tracking-wider">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>

              <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
                {STORY_CHAPTERS.map((chap, idx) => {
                  const isActive = idx === activeChapterIndex;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        onSelectChapter(idx);
                        setIsExpanded(false);
                      }}
                      className={`w-full text-left py-1.5 px-2 rounded-[2px] flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#EF5A2A] text-white font-bold'
                          : 'text-[#F3EEE5]/80 hover:bg-[rgba(243,238,229,0.08)] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs tracking-wider ${
                            isActive ? 'text-white' : 'text-[#EF5A2A]'
                          }`}
                        >
                          {chap.number}
                        </span>
                        <span className="font-dosis text-xs tracking-[0.12em] uppercase font-semibold truncate max-w-[190px]">
                          {chap.title}
                        </span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Subtle Editorial Indicator Pill */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A09]/95 text-[#F3EEE5] border border-[rgba(243,238,229,0.18)] shadow-[0_4px_16px_rgba(10,10,9,0.25)] rounded-[2px] backdrop-blur-md">
          {/* Previous Chapter button */}
          <button
            onClick={handlePrev}
            disabled={activeChapterIndex === 0}
            title="Previous chapter"
            aria-label="Previous chapter"
            className="p-1.5 text-[#F3EEE5]/70 hover:text-white hover:bg-[rgba(243,238,229,0.1)] disabled:opacity-25 disabled:pointer-events-none rounded-[2px] transition-colors cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Chapter status pill / toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-2.5 py-1 bg-[rgba(243,238,229,0.06)] hover:bg-[rgba(243,238,229,0.12)] border border-[rgba(243,238,229,0.08)] rounded-[2px] transition-colors cursor-pointer group"
          >
            <span className="font-mono text-xs font-bold text-[#EF5A2A] tracking-[0.14em]">
              {currentChapter.number} / 09
            </span>
            <span className="w-[1px] h-3 bg-[rgba(243,238,229,0.2)]" />
            <span className="font-dosis text-xs font-bold tracking-[0.14em] uppercase text-[#F3EEE5] max-w-[120px] sm:max-w-[150px] truncate">
              {currentChapter.title}
            </span>
            <span className="font-dosis text-[9px] text-[#F3EEE5]/50 group-hover:text-[#EF5A2A] transition-colors ml-0.5">
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>

          {/* Next Chapter button */}
          <button
            onClick={handleNext}
            disabled={activeChapterIndex === STORY_CHAPTERS.length - 1}
            title="Next chapter"
            aria-label="Next chapter"
            className="p-1.5 text-[#F3EEE5]/70 hover:text-white hover:bg-[rgba(243,238,229,0.1)] disabled:opacity-25 disabled:pointer-events-none rounded-[2px] transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
