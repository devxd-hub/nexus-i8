/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { SectionLabel } from '../primitives/SectionLabel.tsx';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { AppRoute } from '../../types.ts';
import { TEAM_MEMBERS } from '../../data/nexusData.ts';
import { Cpu, Palette, Terminal, Radio, Search, Box, ArrowUpRight, Users } from 'lucide-react';

interface DisciplineItem {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  activeProjects: string[];
  tools: string[];
}

const DISCIPLINES: DisciplineItem[] = [
  {
    id: 'engineering',
    name: 'ENGINEERING',
    category: 'PHYSICAL SYSTEMS',
    icon: Cpu,
    description: 'Embedded firmware, PCB circuit design, low-power telemetry, and sensor calibration.',
    activeProjects: ['VOXEN MIDI', 'HABITAT MESH'],
    tools: ['ESP32', 'C++', 'Oscilloscopes', 'KiCad'],
  },
  {
    id: 'design',
    name: 'DESIGN',
    category: 'VISUAL & ERGONOMICS',
    icon: Palette,
    description: 'Typographic hierarchy, design systems, physical button spacing, and tactile feedback.',
    activeProjects: ['TYPESTREAM', 'ALGOLAB UI'],
    tools: ['Variable Fonts', 'Figma', 'OpenType', 'Print Specs'],
  },
  {
    id: 'coding',
    name: 'CODING',
    category: 'SOFTWARE & ALGORITHMS',
    icon: Terminal,
    description: 'Interactive canvas visualizers, real-time WebSockets, local-first sync, and TypeScript.',
    activeProjects: ['ALGOLAB', 'ARCANUM DISCOURSE'],
    tools: ['TypeScript', 'Canvas API', 'WebSockets', 'Postgres'],
  },
  {
    id: 'media',
    name: 'MEDIA',
    category: 'AUDIO & PUBLICATION',
    icon: Radio,
    description: 'Sonic branding, analog-digital synthesizers, photography documentation, and video essays.',
    activeProjects: ['VOXEN AUDIO', 'DOCUMENTARY ARCHIVE'],
    tools: ['Web Audio API', 'MIDI', '35mm Film', 'Premiere'],
  },
  {
    id: 'research',
    name: 'RESEARCH',
    category: 'SYSTEMS & INQUIRY',
    icon: Search,
    description: 'Academic knowledge graphs, cognitive learning models, and microclimate botany monitoring.',
    activeProjects: ['ARCANUM CITATION', 'HABITAT ECOLOGY'],
    tools: ['LoRa Mesh', 'Citation Graphs', 'Grafana', 'Zotero'],
  },
  {
    id: 'hardware',
    name: 'HARDWARE & FAB',
    category: 'RAPID PROTOTYPING',
    icon: Box,
    description: 'CNC wood milling, 3D resin printing, laser cutting, and brass potentiometer dials.',
    activeProjects: ['VOXEN ENCLOSURES', 'SENSOR PODS'],
    tools: ['ShopBot CNC', 'SLA Resin', 'Hardwood Joinery', 'Laser Engraving'],
  },
];

interface Act04CollectiveNetworkProps {
  onRouteChange: (route: AppRoute) => void;
}

export const Act04CollectiveNetwork: React.FC<Act04CollectiveNetworkProps> = ({ onRouteChange }) => {
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('engineering');
  const activeDiscipline = DISCIPLINES.find((d) => d.id === selectedDisciplineId) || DISCIPLINES[0];

  return (
    <section
      id="act-04-collective"
      className="relative py-24 md:py-36 bg-[#EBE5DB] border-b border-[rgba(10,10,9,0.12)] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16 md:mb-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-mono text-xs font-bold uppercase tracking-widest">
              CHAPTER 05 // 07
            </span>
            <span className="font-dosis text-xs uppercase tracking-[0.22em] font-semibold text-[#66615A]">
              THE INTERDISCIPLINARY SQUADS
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            Where disciplines meet.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              The builders behind the benches.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            NEXUS is not a mono-culture of programmers or designers. We engineer the intersection:
            bridging software, physical fabrication, acoustic hardware, and systems research.
          </p>
        </div>

        {/* 6 Disciplines Interactive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            const isSelected = d.id === selectedDisciplineId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDisciplineId(d.id)}
                className={`p-4 flex flex-col items-start gap-3 rounded-[2px] border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#0A0A09] shadow-md scale-[1.02]'
                    : 'bg-[#FAF6F0] text-[#0A0A09] border-[rgba(10,10,9,0.14)] hover:border-[#EF5A2A]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-[#EF5A2A] text-white' : 'bg-[#E5DFD4] text-[#0A0A09]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider block opacity-70">
                    {d.category}
                  </span>
                  <span className="font-dosis font-bold text-xs uppercase tracking-wider block">
                    {d.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Discipline Deep-Dive Panel */}
        <div className="p-8 sm:p-12 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-sm mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#EF5A2A] uppercase tracking-wider">
                ACTIVE DOMAIN // {activeDiscipline.category}
              </span>
            </div>
            <h3 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#0A0A09]">
              {activeDiscipline.name}
            </h3>
            <p className="font-bitter text-base sm:text-lg text-[#66615A] leading-relaxed">
              {activeDiscipline.description}
            </p>
          </div>

          <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-[rgba(10,10,9,0.12)] pt-6 lg:pt-0 lg:pl-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#66615A] block mb-2 font-bold">
                CONNECTED PROJECTS:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeDiscipline.activeProjects.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-white border border-[rgba(10,10,9,0.12)] text-[#0A0A09] font-mono text-xs font-semibold rounded-[2px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#66615A] block mb-2 font-bold">
                STUDIO TOOLSET:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeDiscipline.tools.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 bg-[#EBE5DB] text-[#66615A] font-mono text-[11px] rounded-[2px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Student Leaders Teaser & Team Link */}
        <div className="p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EF5A2A]" />
              <span className="font-mono text-xs font-bold text-[#0A0A09] uppercase tracking-wider">
                THE 2024–2025 STUDENT SQUAD
              </span>
            </div>
            <p className="font-bitter text-sm text-[#66615A]">
              Meet all 15+ student leads across engineering, design, media, and projects.
            </p>
          </div>

          <button
            onClick={() => onRouteChange('/team')}
            className="px-6 py-3 bg-[#0A0A09] text-[#F3EEE5] hover:bg-[#EF5A2A] transition-colors font-dosis font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer shrink-0 rounded-[2px]"
          >
            <span>VIEW FULL TEAM DIRECTORY</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </section>
  );
};
