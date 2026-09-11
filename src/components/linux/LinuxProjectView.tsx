/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../../types.ts';
import {
  ExternalLink,
  Code,
  FileText,
  Layers,
  CheckCircle2,
  Users,
  Copy,
  Check,
  Tag,
  Calendar,
  Sparkles,
  Github,
} from 'lucide-react';

interface LinuxProjectViewProps {
  project: Project;
}

export const LinuxProjectView: React.FC<LinuxProjectViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'deliverables' | 'json'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const data = JSON.stringify(project, null, 2);
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGithub = () => {
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenDemo = () => {
    if (project.demoUrl) {
      window.open(project.demoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#111217]">
      {/* File Inspector Top Toolbar */}
      <div className="h-10 px-4 bg-[#181A22] border-b border-[rgba(243,238,229,0.1)] flex items-center justify-between gap-4 shrink-0">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 font-mono text-xs rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#EF5A2A] text-[#0A0A09] font-bold'
                : 'text-[#A6A095] hover:text-[#F3EEE5] hover:bg-white/[0.06]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`px-3 py-1 font-mono text-xs rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'readme'
                ? 'bg-[#EF5A2A] text-[#0A0A09] font-bold'
                : 'text-[#A6A095] hover:text-[#F3EEE5] hover:bg-white/[0.06]'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>README.md</span>
          </button>

          <button
            onClick={() => setActiveTab('deliverables')}
            className={`px-3 py-1 font-mono text-xs rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'deliverables'
                ? 'bg-[#EF5A2A] text-[#0A0A09] font-bold'
                : 'text-[#A6A095] hover:text-[#F3EEE5] hover:bg-white/[0.06]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>DELIVERABLES.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 font-mono text-xs rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'json'
                ? 'bg-[#EF5A2A] text-[#0A0A09] font-bold'
                : 'text-[#A6A095] hover:text-[#F3EEE5] hover:bg-white/[0.06]'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>METADATA.json</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 text-[#A6A095] hover:text-[#F3EEE5] bg-white/[0.04] hover:bg-white/[0.1] rounded-[2px] transition-colors cursor-pointer"
            title="Copy metadata JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#EF5A2A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {project.demoUrl && (
            <button
              onClick={handleOpenDemo}
              className="px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.16] text-[#F3EEE5] font-mono text-xs rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <span>LIVE DEMO</span>
              <ExternalLink className="w-3 h-3 text-[#EF5A2A]" />
            </button>
          )}

          {project.githubUrl ? (
            <button
              onClick={handleOpenGithub}
              className="px-2.5 py-1 bg-[#EF5A2A] hover:bg-[#d94e22] text-[#0A0A09] font-mono text-xs font-bold rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Github className="w-3 h-3" />
              <span>GITHUB</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <span
              title="Repository is currently internal or restricted"
              className="px-2 py-1 bg-white/[0.04] text-[#66615A] font-mono text-[11px] rounded-[2px] border border-white/5 cursor-not-allowed select-none"
            >
              REPO RESTRICTED
            </span>
          )}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-[#F3EEE5] select-text">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-3xl">
            {/* Header Identity */}
            <div className="pb-4 border-b border-[rgba(243,238,229,0.1)]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#EF5A2A] mb-1">
                <span>{project.projectNumber}</span>
                <span>//</span>
                <span>STATUS: {project.status.toUpperCase()}</span>
                <span>//</span>
                <span>{project.year}</span>
              </div>
              <h1 className="font-fraunces font-bold text-3xl sm:text-4xl text-white tracking-tight">
                {project.title}
              </h1>
              <p className="font-mono text-xs text-[#A6A095] uppercase tracking-wider mt-1">
                {project.disciplines}
              </p>
            </div>

            {/* Core Summary */}
            <div className="p-4 bg-[#181A22] border border-[rgba(243,238,229,0.08)] rounded-[2px]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#EF5A2A] block mb-1">
                EXECUTIVE SUMMARY
              </span>
              <p className="font-bitter text-base text-[#F3EEE5] leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Deep Description */}
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#A6A095]">
                PROJECT CONTEXT & METHODOLOGY
              </span>
              <p className="font-bitter text-sm text-[#D3CDC3] leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Student Leads & Tech Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Student Leads */}
              <div className="p-4 bg-[#181A22] border border-[rgba(243,238,229,0.08)] rounded-[2px] space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#EF5A2A] flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  <span>STUDENT SQUAD LEADS</span>
                </span>
                <ul className="space-y-1">
                  {project.leadStudents.map((lead) => (
                    <li key={lead} className="font-mono text-xs text-[#F3EEE5] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#EF5A2A] rounded-full" />
                      <span>{lead}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="p-4 bg-[#181A22] border border-[rgba(243,238,229,0.08)] rounded-[2px] space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#EF5A2A] flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  <span>TECHNOLOGY STACK</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#232530] text-[#D3CDC3] font-mono text-[11px] rounded-[2px] border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Deliverables Checklist */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="p-4 bg-[#181A22] border border-[rgba(243,238,229,0.08)] rounded-[2px] space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#EF5A2A] block">
                  SHIPPED ARTIFACT DELIVERABLES
                </span>
                <ul className="space-y-1.5">
                  {project.deliverables.map((item) => (
                    <li key={item} className="flex items-center gap-2 font-mono text-xs text-[#D3CDC3]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#EF5A2A] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* README.md TAB */}
        {activeTab === 'readme' && (
          <div className="max-w-3xl font-mono text-xs space-y-4">
            <div className="p-4 bg-[#0A0A09] border border-[rgba(243,238,229,0.12)] rounded-[2px] text-[#A6A095] space-y-4">
              <div className="pb-3 border-b border-white/10 text-white">
                <span className="text-[#EF5A2A]"># </span>
                <span className="font-bold text-lg">{project.title}</span>
                <p className="text-xs text-[#A6A095] mt-1">{project.summary}</p>
              </div>

              <div>
                <span className="text-[#EF5A2A]">## </span>
                <span className="text-white font-bold">1. Background & Scope</span>
                <p className="text-[#D3CDC3] mt-1 font-bitter text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div>
                <span className="text-[#EF5A2A]">## </span>
                <span className="text-white font-bold">2. Architecture & Modules</span>
                <div className="mt-2 p-3 bg-[#16171E] rounded-[2px] text-[#F3EEE5] text-[11px] space-y-1 border border-white/5">
                  <div>📁 src/</div>
                  <div className="pl-4">├── 📄 engine.ts // Core system logic</div>
                  <div className="pl-4">├── 📄 render.ts // Visualization canvas pipeline</div>
                  <div className="pl-4">└── 📄 schema.ts // Type definitions</div>
                </div>
              </div>

              <div>
                <span className="text-[#EF5A2A]">## </span>
                <span className="text-white font-bold">3. Squad Authors</span>
                <ul className="list-disc list-inside mt-1 text-[#D3CDC3]">
                  {project.leadStudents.map((lead) => (
                    <li key={lead}>{lead}</li>
                  ))}
                </ul>
              </div>

              {project.githubUrl && (
                <div className="pt-2 border-t border-white/10 text-[#A6A095]">
                  <span>Git Repository: </span>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#EF5A2A] underline hover:text-white"
                  >
                    {project.githubUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DELIVERABLES.txt TAB */}
        {activeTab === 'deliverables' && (
          <div className="max-w-3xl font-mono text-xs space-y-2">
            <div className="p-4 bg-[#0A0A09] border border-[rgba(243,238,229,0.12)] rounded-[2px] text-[#D3CDC3] space-y-3">
              <div className="text-[#EF5A2A] font-bold">
                === PROJECT ARTIFACT SPECIFICATION: {project.projectNumber} ===
              </div>
              <div className="text-[#8C8881]">
                Generated on: Cohort {project.year} // Status: {project.status}
              </div>
              <hr className="border-white/10" />
              <div className="space-y-2">
                {project.deliverables?.map((item, idx) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-[#EF5A2A]">[PASS]</span>
                    <span>0{idx + 1}. {item}</span>
                  </div>
                ))}
              </div>
              <hr className="border-white/10" />
              <div className="text-[11px] text-[#8C8881]">
                All milestones verified by NEXUS Core Engineering Review Guild.
              </div>
            </div>
          </div>
        )}

        {/* METADATA.json TAB */}
        {activeTab === 'json' && (
          <div className="max-w-3xl font-mono text-xs">
            <pre className="p-4 bg-[#0A0A09] border border-[rgba(243,238,229,0.12)] rounded-[2px] text-[#D3CDC3] overflow-x-auto leading-relaxed">
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Status Footer Bar */}
      <div className="h-7 px-4 bg-[#14151C] border-t border-[rgba(243,238,229,0.08)] flex items-center justify-between font-mono text-[10px] text-[#8C8881] shrink-0">
        <div className="flex items-center gap-3">
          <span>PATH: /home/nexus/projects/{project.title.toLowerCase()}</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#EF5A2A] rounded-full" />
          <span className="text-[#F3EEE5] uppercase">{project.category}</span>
        </div>
      </div>
    </div>
  );
};
