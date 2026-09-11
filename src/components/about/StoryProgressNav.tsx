/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Compass } from 'lucide-react';

export interface StoryChapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  { id: 'chapter-01', number: '01', title: 'WHY WE EXIST', subtitle: 'The Inception' },
  { id: 'chapter-02', number: '02', title: 'THE PROBLEM', subtitle: 'The Silo Effect' },
  { id: 'chapter-03', number: '03', title: 'THE CONNECTION', subtitle: 'Convergence of Disciplines' },
  { id: 'chapter-04', number: '04', title: 'HOW WE WORK', subtitle: 'The Sprint Cycle' },
  { id: 'chapter-05', number: '05', title: 'WHAT WE MAKE', subtitle: 'The Shipped Artifacts' },
  { id: 'chapter-06', number: '06', title: 'THE PEOPLE', subtitle: 'The Student Collective' },
  { id: 'chapter-07', number: '07', title: 'WHAT COMES NEXT', subtitle: 'The Horizon & Beyond' },
];

interface StoryProgressNavProps {
  activeChapterIndex: number;
  scrollProgress: number;
  onSelectChapter: (index: number) => void;
}

export const StoryProgressNav: React.FC<StoryProgressNavProps> = ({
  activeChapterIndex,
  scrollProgress,
  onSelectChapter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide when near footer or top if needed, but keep accessible
  const activeChapter = STORY_CHAPTERS[activeChapterIndex] || STORY_CHAPTERS[0];

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
      {/* 1. Global Reading Progress Edge Bar (Right edge hairline) */}
      <div className="fixed right-0 top-0 bottom-0 w-[2px] z-40 pointer-events-none bg-[rgba(10,10,9,0.06)] hidden md:block">
        <motion.div
          className="w-full bg-[#EF5A2A] origin-top"
          style={{ height: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* 2. Floating Story Index Bar (Bottom Right on Desktop, Bottom Center on Mobile) */}
      <nav
        aria-label="Story chapter navigation"
        className="fixed bottom-6 right-4 sm:right-8 z-40 select-none flex flex-col items-end"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 p-4 bg-[#0A0A09] text-[#F3EEE5] border border-[rgba(243,238,229,0.16)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] rounded-[2px] w-72 backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[rgba(243,238,229,0.12)]">
                <span className="font-dosis text-[10px] uppercase font-bold tracking-[0.24em] text-[#EF5A2A] flex items-center gap-1.5">
                  <Compass className="w-3 h-3" />
                  <span>STORY NAVIGATION</span>
                </span>
                <span className="font-dosis text-[10px] text-[#F3EEE5]/60 tracking-wider">
                  {Math.round(scrollProgress * 100)}% COMPLETE
                </span>
              </div>

              <div className="space-y-1">
                {STORY_CHAPTERS.map((chap, idx) => {
                  const isActive = idx === activeChapterIndex;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => {
                        onSelectChapter(idx);
                        setIsExpanded(false);
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-[2px] flex items-center justify-between transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#EF5A2A] text-white font-bold'
                          : 'text-[#F3EEE5]/80 hover:bg-[rgba(243,238,229,0.08)] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-dosis text-xs tracking-wider ${
                            isActive ? 'text-white' : 'text-[#EF5A2A]'
                          }`}
                        >
                          {chap.number}
                        </span>
                        <span className="font-dosis text-xs tracking-[0.14em] uppercase font-semibold">
                          {chap.title}
                        </span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Chapter Controller Pill */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0A0A09]/95 text-[#F3EEE5] border border-[rgba(243,238,229,0.18)] shadow-[0_8px_24px_rgba(10,10,9,0.25)] rounded-[2px] backdrop-blur-md">
          {/* Previous Chapter button */}
          <button
            onClick={handlePrev}
            disabled={activeChapterIndex === 0}
            title="Previous chapter"
            aria-label="Previous chapter"
            className="p-2 text-[#F3EEE5]/70 hover:text-white hover:bg-[rgba(243,238,229,0.1)] disabled:opacity-30 disabled:pointer-events-none rounded-[2px] transition-colors cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Chapter status pill / toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[rgba(243,238,229,0.06)] hover:bg-[rgba(243,238,229,0.12)] border border-[rgba(243,238,229,0.08)] rounded-[2px] transition-colors cursor-pointer group"
          >
            <span className="font-dosis text-xs font-bold text-[#EF5A2A] tracking-[0.18em]">
              {activeChapter.number}
            </span>
            <span className="w-[1px] h-3 bg-[rgba(243,238,229,0.2)]" />
            <span className="font-dosis text-xs font-bold tracking-[0.16em] uppercase text-[#F3EEE5] max-w-[130px] sm:max-w-[170px] truncate">
              {activeChapter.title}
            </span>
            <span className="font-dosis text-[10px] text-[#F3EEE5]/50 group-hover:text-[#EF5A2A] transition-colors ml-1">
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>

          {/* Next Chapter button */}
          <button
            onClick={handleNext}
            disabled={activeChapterIndex === STORY_CHAPTERS.length - 1}
            title="Next chapter"
            aria-label="Next chapter"
            className="p-2 text-[#F3EEE5]/70 hover:text-white hover:bg-[rgba(243,238,229,0.1)] disabled:opacity-30 disabled:pointer-events-none rounded-[2px] transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </>
  );
};
