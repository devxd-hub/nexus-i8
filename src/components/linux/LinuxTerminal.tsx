/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../../types.ts';
import { PROJECTS } from '../../data/nexusData.ts';

interface LinuxTerminalProps {
  onOpenProject: (project: Project) => void;
  onClose: () => void;
}

interface CommandLog {
  id: string;
  command: string;
  output: React.ReactNode;
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({ onOpenProject, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: 'nexus-workspace --version',
      output: (
        <div className="space-y-1">
          <div className="text-[#EF5A2A] font-bold">NEXUS Workstation v2.6.4-release (x86_64)</div>
          <div className="text-[#A6A095]">
            Interactive project workspace initialized. Type <span className="text-white font-bold">'help'</span> for available commands.
          </div>
        </div>
      ),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    setHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);
    setInput('');

    const [cmd, ...args] = raw.split(' ');
    const normalizedCmd = cmd.toLowerCase();
    const argString = args.join(' ').toLowerCase();

    let outputNode: React.ReactNode = null;

    switch (normalizedCmd) {
      case 'help':
        outputNode = (
          <div className="space-y-1 text-[#D3CDC3]">
            <div className="text-[#EF5A2A] font-bold">AVAILABLE COMMANDS:</div>
            <div>• <span className="text-white font-bold">projects</span> (or <span className="text-white font-bold">ls</span>) — List all repository project packages</div>
            <div>• <span className="text-white font-bold">open &lt;name|id&gt;</span> — Open project inspection window (e.g. 'open algolab')</div>
            <div>• <span className="text-white font-bold">github &lt;name|id&gt;</span> — Launch external GitHub repository in browser</div>
            <div>• <span className="text-white font-bold">cat &lt;project/readme&gt;</span> — Print project summary & context</div>
            <div>• <span className="text-white font-bold">about</span> — Show NEXUS student community origin & mission</div>
            <div>• <span className="text-white font-bold">clear</span> — Clear terminal output buffer</div>
            <div>• <span className="text-white font-bold">exit</span> — Close terminal window</div>
          </div>
        );
        break;

      case 'ls':
      case 'projects':
      case 'dir':
        outputNode = (
          <div className="space-y-1.5">
            <div className="text-[#EF5A2A] font-bold">PROJECTS DIRECTORY (/home/nexus/projects):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {PROJECTS.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-[#EF5A2A]">📁 {p.title.toLowerCase()}/</span>
                  <span className="text-[#8C8881]">[{p.id}]</span>
                  <span className="text-[#D3CDC3] text-[10px] uppercase">({p.category})</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-[#8C8881] pt-1">
              Type 'open &lt;name&gt;' to launch project view.
            </div>
          </div>
        );
        break;

      case 'open': {
        if (!argString) {
          outputNode = <div className="text-[#EF5A2A]">Usage: open &lt;project_name | project_id&gt; (e.g., 'open algolab')</div>;
          break;
        }
        const target = PROJECTS.find(
          (p) =>
            p.title.toLowerCase() === argString ||
            p.id.toLowerCase() === argString ||
            p.title.toLowerCase().includes(argString)
        );
        if (target) {
          onOpenProject(target);
          outputNode = (
            <div className="text-[#EF5A2A]">
              [OK] Launching project window: {target.title} ({target.projectNumber})
            </div>
          );
        } else {
          outputNode = (
            <div className="text-red-400">
              Error: Project '{argString}' not found. Type 'projects' to list directories.
            </div>
          );
        }
        break;
      }

      case 'github': {
        if (!argString) {
          outputNode = <div className="text-[#EF5A2A]">Usage: github &lt;project_name&gt;</div>;
          break;
        }
        const target = PROJECTS.find(
          (p) =>
            p.title.toLowerCase() === argString ||
            p.id.toLowerCase() === argString ||
            p.title.toLowerCase().includes(argString)
        );
        if (target && target.githubUrl) {
          window.open(target.githubUrl, '_blank', 'noopener,noreferrer');
          outputNode = (
            <div className="text-[#EF5A2A]">
              [OK] Opening repository in browser: {target.githubUrl}
            </div>
          );
        } else if (target) {
          outputNode = (
            <div className="text-yellow-400">
              Notice: Project '{target.title}' does not have a public GitHub repository configured.
            </div>
          );
        } else {
          outputNode = <div className="text-red-400">Error: Project not found.</div>;
        }
        break;
      }

      case 'cat': {
        if (!argString) {
          outputNode = <div className="text-[#EF5A2A]">Usage: cat &lt;project_name&gt;</div>;
          break;
        }
        const target = PROJECTS.find(
          (p) =>
            p.title.toLowerCase() === argString ||
            p.id.toLowerCase() === argString ||
            p.title.toLowerCase().includes(argString)
        );
        if (target) {
          outputNode = (
            <div className="p-3 bg-[#181A22] rounded-[2px] text-[#D3CDC3] space-y-2 text-xs">
              <div className="text-[#EF5A2A] font-bold"># {target.title} ({target.projectNumber})</div>
              <div>{target.summary}</div>
              <div className="text-[#8C8881]">{target.description}</div>
              <div className="text-[11px] text-[#EF5A2A]">Leads: {target.leadStudents.join(', ')}</div>
            </div>
          );
        } else {
          outputNode = <div className="text-red-400">File not found.</div>;
        }
        break;
      }

      case 'about':
        outputNode = (
          <div className="space-y-1.5 text-[#D3CDC3] text-xs">
            <div className="text-[#EF5A2A] font-bold">NEXUS — STUDENT INNOVATION COLLECTIVE</div>
            <div>A student-founded community merging technical engineering with artistic craft.</div>
            <div>Building software, physical instruments, and research toolkits since 2024.</div>
          </div>
        );
        break;

      case 'clear':
        setLogs([]);
        return;

      case 'exit':
        onClose();
        return;

      default:
        outputNode = (
          <div className="text-[#A6A095]">
            Command not recognized: '{cmd}'. Type <span className="text-[#EF5A2A] font-bold">'help'</span> for list of commands.
          </div>
        );
    }

    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        command: raw,
        output: outputNode,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInput(history[nextIdx]);
        } else {
          setHistoryIdx(-1);
          setInput('');
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex-1 flex flex-col h-full bg-[#0A0A09] text-[#F3EEE5] font-mono text-xs p-4 overflow-y-auto select-text"
    >
      {/* Historical Output Buffer */}
      <div className="space-y-3 mb-3">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            <div className="flex items-center gap-2 text-[#8C8881]">
              <span className="text-[#EF5A2A] font-bold">nexus@workspace:~$</span>
              <span className="text-white">{log.command}</span>
            </div>
            <div className="pl-4">{log.output}</div>
          </div>
        ))}
      </div>

      {/* Active Input Line */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 mt-auto shrink-0 pt-2 border-t border-white/5">
        <span className="text-[#EF5A2A] font-bold shrink-0">nexus@workspace:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="flex-1 bg-transparent text-[#F3EEE5] outline-none font-mono text-xs caret-[#EF5A2A]"
          placeholder="Type 'help' or 'projects'..."
        />
      </form>

      <div ref={endRef} />
    </div>
  );
};
