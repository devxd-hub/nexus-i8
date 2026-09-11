/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { Container } from '../primitives/Container.tsx';
import { InteractiveNexusX } from '../brand/NexusLogo.tsx';
import { Cpu, Palette, Terminal, Radio, Search, Box, Network } from 'lucide-react';
import { useStoryScroll } from './ScrollStoryContext.tsx';

interface DisciplineNode {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  activeProjects: string[];
  tools: string[];
  x: number;
  y: number;
}

const DISCIPLINE_NODES: DisciplineNode[] = [
  {
    id: 'engineering',
    name: 'ENGINEERING',
    category: 'PHYSICAL SYSTEMS',
    icon: Cpu,
    description: 'Embedded firmware, PCB circuit design, low-power telemetry, and sensor calibration.',
    activeProjects: ['VOXEN MIDI', 'HABITAT MESH'],
    tools: ['ESP32', 'C++', 'Oscilloscopes', 'KiCad'],
    x: 18,
    y: 22,
  },
  {
    id: 'design',
    name: 'DESIGN',
    category: 'VISUAL & ERGONOMICS',
    icon: Palette,
    description: 'Typographic hierarchy, design systems, physical button spacing, and tactile feedback.',
    activeProjects: ['TYPESTREAM', 'ALGOLAB UI'],
    tools: ['Variable Fonts', 'Figma', 'OpenType', 'Print Specs'],
    x: 82,
    y: 24,
  },
  {
    id: 'coding',
    name: 'CODING',
    category: 'SOFTWARE & ALGORITHMS',
    icon: Terminal,
    description: 'Interactive canvas visualizers, real-time WebSockets, local-first sync, and TypeScript.',
    activeProjects: ['ALGOLAB', 'ARCANUM DISCOURSE'],
    tools: ['TypeScript', 'Canvas API', 'WebSockets', 'Postgres'],
    x: 14,
    y: 75,
  },
  {
    id: 'media',
    name: 'MEDIA',
    category: 'AUDIO & PUBLICATION',
    icon: Radio,
    description: 'Sonic branding, analog-digital synthesizers, photography documentation, and video essays.',
    activeProjects: ['VOXEN AUDIO', 'DOCUMENTARY ARCHIVE'],
    tools: ['Web Audio API', 'MIDI', '35mm Film', 'Premiere'],
    x: 84,
    y: 76,
  },
  {
    id: 'research',
    name: 'RESEARCH',
    category: 'SYSTEMS & INQUIRY',
    icon: Search,
    description: 'Academic knowledge graphs, cognitive learning models, and microclimate botany monitoring.',
    activeProjects: ['ARCANUM CITATION', 'HABITAT ECOLOGY'],
    tools: ['LoRa Mesh', 'Citation Graphs', 'Grafana', 'Zotero'],
    x: 50,
    y: 12,
  },
  {
    id: 'hardware',
    name: 'HARDWARE & FAB',
    category: 'RAPID PROTOTYPING',
    icon: Box,
    description: 'CNC wood milling, 3D resin printing, laser cutting, and brass potentiometer dials.',
    activeProjects: ['VOXEN ENCLOSURES', 'SENSOR PODS'],
    tools: ['ShopBot CNC', 'SLA Resin', 'Hardwood Joinery', 'Laser Engraving'],
    x: 50,
    y: 88,
  },
];

export const StoryChapter04Connection: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('engineering');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { smoothProgress } = useStoryScroll();

  // Scroll-driven visual transformations for Chapter 04 (0.40 -> 0.54 timeline)
  const networkScale = useTransform(smoothProgress, [0.40, 0.47, 0.55], [0.96, 1, 0.98]);
  const rayPulseOpacity = useTransform(smoothProgress, [0.40, 0.47, 0.54], [0.4, 1, 0.6]);

  const activeNode = DISCIPLINE_NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) || DISCIPLINE_NODES[0];

  return (
    <section
      id="chapter-04-connection"
      className="relative py-20 sm:py-28 md:py-36 border-b border-[rgba(10,10,9,0.12)] bg-[#EBE5DB] text-[#0A0A09] overflow-hidden"
    >
      <Container className="relative z-10">
        {/* Chapter Header */}
        <div className="max-w-4xl space-y-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#0A0A09] text-[#F3EEE5] font-dosis font-bold text-xs tracking-[0.2em] uppercase rounded-[2px]">
              CHAPTER 04 // 09
            </span>
            <span className="font-dosis text-xs text-[#66615A] uppercase tracking-[0.22em] font-semibold">
              THE HARMONIC CONVERGENCE
            </span>
          </div>

          <h2 className="font-fraunces font-bold text-3xl sm:text-5xl lg:text-6xl text-[#0A0A09] leading-[1.08] tracking-tight uppercase">
            We found connection.
            <span className="block italic text-[#EF5A2A] font-normal text-2xl sm:text-4xl mt-2 font-fraunces">
              The harmonic convergence of craft.
            </span>
          </h2>

          <p className="font-bitter text-lg sm:text-xl text-[#66615A] leading-relaxed max-w-3xl">
            When hardware engineers, software architects, visual designers, and sound artists share a
            single studio table, individual boundaries dissolve into cohesive project teams.
          </p>
        </div>

        {/* 6 Disciplines Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {DISCIPLINE_NODES.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-4 flex flex-col items-start gap-3 rounded-[2px] border text-left transition-all duration-250 cursor-pointer ${
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
                    {node.category}
                  </span>
                  <span className="font-dosis font-bold text-xs uppercase tracking-wider block">
                    {node.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Centerpiece Disciplines Network & Deep Dive with Scroll Depth */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Interactive Network Visual Canvas */}
          <motion.div
            style={{ scale: networkScale }}
            className="lg:col-span-8 relative aspect-[4/3] sm:aspect-[16/10] bg-[#FAF6F0] border border-[rgba(10,10,9,0.18)] shadow-sm rounded-[2px] p-6 flex items-center justify-center overflow-hidden"
          >
            {/* Background Blueprint Grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0A0A09_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            {/* SVG Connecting Vector Rays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              {/* Central Concentric Orbits */}
              <circle cx="50%" cy="50%" r="28%" fill="none" stroke="rgba(10,10,9,0.06)" strokeDasharray="3 3" />
              <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(10,10,9,0.04)" />

              {/* Vector Lines from Nodes to Center X */}
              {DISCIPLINE_NODES.map((node) => {
                const isHovered = hoveredNodeId === node.id || selectedNodeId === node.id;
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2="50%"
                    y2="50%"
                    stroke={isHovered ? '#EF5A2A' : 'rgba(10,10,9,0.15)'}
                    strokeWidth={isHovered ? 2 : 1}
                    strokeDasharray={isHovered ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Secondary Cross-Node Interconnects */}
              <line x1="18%" y1="22%" x2="50%" y2="12%" stroke="rgba(10,10,9,0.08)" />
              <line x1="82%" y1="24%" x2="50%" y2="12%" stroke="rgba(10,10,9,0.08)" />
              <line x1="14%" y1="75%" x2="50%" y2="88%" stroke="rgba(10,10,9,0.08)" />
              <line x1="84%" y1="76%" x2="50%" y2="88%" stroke="rgba(10,10,9,0.08)" />
            </svg>

            {/* Central Anchor: NEXUS X Core */}
            <div className="relative z-10 flex flex-col items-center justify-center p-4 bg-[#0A0A09] text-[#F3EEE5] rounded-full w-20 h-20 sm:w-24 sm:h-24 shadow-md border border-[rgba(239,90,42,0.4)]">
              <InteractiveNexusX sizeClass="w-9 h-9 sm:w-11 sm:h-11" />
              <span className="font-dosis text-[9px] uppercase font-bold tracking-[0.24em] text-[#EF5A2A] mt-1">
                NEXUS
              </span>
            </div>

            {/* Interactive Discipline Nodes on Canvas */}
            {DISCIPLINE_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const NodeIcon = node.icon;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute z-20 flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-[2px] transition-all duration-200 cursor-pointer shadow-xs border ${
                    isSelected || isHovered
                      ? 'bg-[#0A0A09] text-[#F3EEE5] border-[#EF5A2A] scale-105 shadow-md'
                      : 'bg-[#FAF6F0] text-[#0A0A09] border-[rgba(10,10,9,0.2)] hover:border-[#0A0A09]'
                  }`}
                >
                  <NodeIcon
                    className={`w-3.5 h-3.5 ${
                      isSelected || isHovered ? 'text-[#EF5A2A]' : 'text-[#66615A]'
                    }`}
                  />
                  <span className="font-dosis text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap">
                    {node.name}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Active Discipline Detail Card */}
          <div className="lg:col-span-4 p-8 bg-[#FAF6F0] border border-[rgba(10,10,9,0.16)] rounded-[2px] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(10,10,9,0.1)]">
              <div>
                <span className="font-dosis text-xs font-bold tracking-[0.2em] text-[#EF5A2A] uppercase block">
                  ACTIVE DOMAIN // {activeNode.category}
                </span>
                <h3 className="font-fraunces font-bold text-2xl text-[#0A0A09] uppercase">
                  {activeNode.name}
                </h3>
              </div>
              <div className="p-2.5 bg-[#0A0A09] text-[#EF5A2A] rounded-[2px]">
                <activeNode.icon className="w-5 h-5" />
              </div>
            </div>

            <p className="font-bitter text-sm text-[#0A0A09] leading-relaxed">
              {activeNode.description}
            </p>

            {/* Active Projects */}
            <div className="space-y-2 pt-2 border-t border-[rgba(10,10,9,0.08)]">
              <span className="font-dosis text-[11px] font-bold uppercase tracking-[0.2em] text-[#66615A] block">
                CONNECTED PROJECTS
              </span>
              <div className="flex flex-wrap gap-2">
                {activeNode.activeProjects.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 bg-[#EBE5DB] text-[#0A0A09] font-dosis font-bold text-xs tracking-wider rounded-[2px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Tools & Methodologies */}
            <div className="space-y-2 pt-2 border-t border-[rgba(10,10,9,0.08)]">
              <span className="font-dosis text-[11px] font-bold uppercase tracking-[0.2em] text-[#66615A] block">
                STUDIO TOOLSET & METHODS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 bg-white border border-[rgba(10,10,9,0.1)] text-[#66615A] font-dosis text-[11px] tracking-wider rounded-[2px]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Synthesis Banner */}
        <div className="p-6 bg-[#0A0A09] text-[#F3EEE5] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[rgba(243,238,229,0.14)]">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-[#EF5A2A] text-white rounded-[2px]">
              <Network className="w-4 h-4" />
            </span>
            <div>
              <span className="font-dosis text-xs uppercase font-bold tracking-[0.2em] text-[#EF5A2A] block">
                INTERDISCIPLINARY PRINCIPLE
              </span>
              <p className="font-bitter text-xs sm:text-sm text-[#F3EEE5]/90">
                &ldquo;Every project at NEXUS must include at least two distinct discipline leads.&rdquo;
              </p>
            </div>
          </div>

          <span className="font-dosis text-xs text-[#F3EEE5]/60 uppercase tracking-[0.2em] whitespace-nowrap">
            EST. CORE RULE #01
          </span>
        </div>
      </Container>
    </section>
  );
};
