/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../../types.ts';
import { PROJECTS } from '../../data/nexusData.ts';
import {
  Folder,
  Search,
  Grid,
  List,
  Home,
  HardDrive,
  Clock,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface LinuxFileManagerProps {
  onOpenProject: (project: Project) => void;
}

type FileManagerPlace = 'projects' | 'home' | 'recent';

export const LinuxFileManager: React.FC<LinuxFileManagerProps> = ({ onOpenProject }) => {
  const [currentPlace, setCurrentPlace] = useState<FileManagerPlace>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Home virtual filesystem items in /home/nexus
  const homeItems = [
    {
      id: 'folder-projects',
      name: 'projects',
      type: 'directory',
      icon: Folder,
      detail: `${PROJECTS.length} items`,
      onOpen: () => setCurrentPlace('projects'),
    },
    {
      id: 'file-readme',
      name: 'README.txt',
      type: 'text',
      icon: FileText,
      detail: '1.2 KB',
      onOpen: () => {},
    },
    {
      id: 'file-welcome',
      name: 'welcome.md',
      type: 'markdown',
      icon: FileText,
      detail: '2.4 KB',
      onOpen: () => {},
    },
  ];

  // Sort projects non-mutatively
  const sortProjects = (list: Project[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'status') {
        if (a.status === b.status) {
          return a.title.localeCompare(b.title);
        }
        return a.status === 'Active' ? -1 : 1;
      }
      return 0;
    });
  };

  // Filter projects by search query
  const matchesQuery = (p: Project) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.disciplines.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  const filteredProjects = sortProjects(PROJECTS.filter(matchesQuery));

  // Recent projects: sort by year descending / active first
  const recentProjects = sortProjects(
    [...PROJECTS]
      .sort((a, b) => b.year.localeCompare(a.year))
      .filter(matchesQuery)
  );

  const displayProjects = currentPlace === 'recent' ? recentProjects : filteredProjects;

  const filteredHomeItems = homeItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111217] text-[#F3EEE5] overflow-hidden select-none">
      {/* Top File Manager Navigation Bar */}
      <div className="h-10 px-4 bg-[#181A22] border-b border-[rgba(243,238,229,0.1)] flex items-center justify-between gap-4 shrink-0 font-mono text-xs">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-[#A6A095] overflow-hidden truncate">
          <button
            type="button"
            onClick={() => setCurrentPlace('home')}
            className="flex items-center gap-1 text-[#EF5A2A] hover:underline cursor-pointer focus:outline-none"
          >
            <Home className="w-3.5 h-3.5" />
            <span>home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-[#66615A]" />
          <button
            type="button"
            onClick={() => setCurrentPlace('home')}
            className={`hover:text-white cursor-pointer focus:outline-none ${currentPlace === 'home' ? 'text-white font-bold' : ''}`}
          >
            nexus
          </button>
          {currentPlace !== 'home' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#66615A]" />
              <span className="text-white font-bold">{currentPlace}</span>
            </>
          )}
          <span className="text-[#66615A] text-[10px]">
            ({currentPlace === 'home' ? `${filteredHomeItems.length} items` : `${displayProjects.length} items`})
          </span>
        </div>

        {/* Search & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8881]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#0A0A09] border border-white/10 rounded-[2px] text-xs text-[#F3EEE5] focus:border-[#EF5A2A] outline-none w-32 sm:w-44 font-mono placeholder:text-[#66615A]"
            />
          </div>

          {/* Sort Selector (Name / Status) */}
          {currentPlace !== 'home' && (
            <select
              aria-label="Sort projects"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'status')}
              className="bg-[#0A0A09] border border-white/10 text-xs text-[#F3EEE5] px-2 py-1 rounded-[2px] outline-none cursor-pointer font-mono hidden sm:block"
            >
              <option value="name">Sort: Name</option>
              <option value="status">Sort: Status</option>
            </select>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0A0A09] border border-white/10 rounded-[2px] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-[1px] cursor-pointer ${viewMode === 'grid' ? 'bg-[#EF5A2A] text-[#0A0A09]' : 'text-[#8C8881]'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-[1px] cursor-pointer ${viewMode === 'list' ? 'bg-[#EF5A2A] text-[#0A0A09]' : 'text-[#8C8881]'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main File Explorer Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-44 bg-[#0E0F14] border-r border-[rgba(243,238,229,0.08)] p-3 space-y-4 font-mono text-xs hidden sm:block shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] text-[#66615A] uppercase tracking-wider font-bold block px-2">
              PLACES
            </span>
            <button
              type="button"
              onClick={() => setCurrentPlace('home')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[2px] cursor-pointer transition-colors text-left ${
                currentPlace === 'home'
                  ? 'bg-[#EF5A2A]/15 text-white font-bold border-l-2 border-[#EF5A2A]'
                  : 'text-[#A6A095] hover:bg-white/[0.04]'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${currentPlace === 'home' ? 'text-[#EF5A2A]' : 'text-[#8C8881]'}`} />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPlace('projects')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[2px] cursor-pointer transition-colors text-left ${
                currentPlace === 'projects'
                  ? 'bg-[#EF5A2A]/15 text-white font-bold border-l-2 border-[#EF5A2A]'
                  : 'text-[#A6A095] hover:bg-white/[0.04]'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${currentPlace === 'projects' ? 'text-[#EF5A2A]' : 'text-[#8C8881]'}`} />
              <span>Projects</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPlace('recent')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[2px] cursor-pointer transition-colors text-left ${
                currentPlace === 'recent'
                  ? 'bg-[#EF5A2A]/15 text-white font-bold border-l-2 border-[#EF5A2A]'
                  : 'text-[#A6A095] hover:bg-white/[0.04]'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${currentPlace === 'recent' ? 'text-[#EF5A2A]' : 'text-[#8C8881]'}`} />
              <span>Recent</span>
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-[10px] text-[#66615A] uppercase tracking-wider font-bold block px-2">
              STORAGE
            </span>
            <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[2px] text-[#A6A095]">
              <HardDrive className="w-3.5 h-3.5 text-[#8C8881]" />
              <span>NEXUS-VFS</span>
            </div>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#111217]">
          {currentPlace === 'home' ? (
            /* HOME DIRECTORY VIEW (/home/nexus) */
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredHomeItems.map((item) => {
                  const isSelected = selectedId === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      onDoubleClick={item.onOpen}
                      className={`p-3 rounded-[2px] border transition-all cursor-pointer flex flex-col items-center text-center group ${
                        isSelected
                          ? 'bg-[#EF5A2A]/20 border-[#EF5A2A] shadow-xs'
                          : 'bg-[#181A22] border-white/5 hover:border-white/20 hover:bg-[#1E202A]'
                      }`}
                    >
                      <Icon
                        className={`w-10 h-10 mb-2 ${
                          isSelected
                            ? 'text-[#EF5A2A]'
                            : item.type === 'directory'
                            ? 'text-[#D3CDC3] group-hover:text-[#EF5A2A]'
                            : 'text-[#8C8881] group-hover:text-white'
                        }`}
                      />
                      <span className="font-mono text-xs font-bold text-[#F3EEE5] truncate w-full">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#8C8881] truncate w-full mt-0.5">
                        {item.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full font-mono text-xs">
                <div className="grid grid-cols-12 gap-2 pb-2 mb-2 border-b border-white/10 text-[10px] text-[#8C8881] uppercase tracking-wider font-bold">
                  <span className="col-span-6">Name</span>
                  <span className="col-span-3">Type</span>
                  <span className="col-span-3 text-right">Items / Size</span>
                </div>
                <div className="space-y-1">
                  {filteredHomeItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        onDoubleClick={item.onOpen}
                        className={`grid grid-cols-12 gap-2 p-2 rounded-[2px] items-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#EF5A2A]/20 text-white font-bold border-l-2 border-[#EF5A2A]'
                            : 'hover:bg-white/[0.04] text-[#D3CDC3]'
                        }`}
                      >
                        <div className="col-span-6 flex items-center gap-2 truncate">
                          <Icon className="w-3.5 h-3.5 text-[#EF5A2A] shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="col-span-3 truncate text-[#A6A095] uppercase text-[10px]">
                          {item.type}
                        </span>
                        <span className="col-span-3 text-right text-[#8C8881] text-[11px]">
                          {item.detail}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            /* PROJECTS & RECENT VIEW */
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayProjects.map((p) => {
                  const isSelected = selectedId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      onDoubleClick={() => onOpenProject(p)}
                      className={`p-3 rounded-[2px] border transition-all cursor-pointer flex flex-col items-center text-center group ${
                        isSelected
                          ? 'bg-[#EF5A2A]/20 border-[#EF5A2A] shadow-xs'
                          : 'bg-[#181A22] border-white/5 hover:border-white/20 hover:bg-[#1E202A]'
                      }`}
                    >
                      <Folder className={`w-10 h-10 mb-2 ${isSelected ? 'text-[#EF5A2A]' : 'text-[#D3CDC3] group-hover:text-[#EF5A2A]'}`} />
                      <span className="font-mono text-xs font-bold text-[#F3EEE5] truncate w-full">
                        {p.title.toLowerCase()}
                      </span>
                      <span className="font-mono text-[10px] text-[#8C8881] truncate w-full mt-0.5">
                        {p.category}
                      </span>
                      <span className="font-mono text-[9px] text-[#EF5A2A] mt-1">
                        {p.year} // {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full font-mono text-xs">
                <div className="grid grid-cols-12 gap-2 pb-2 mb-2 border-b border-white/10 text-[10px] text-[#8C8881] uppercase tracking-wider font-bold">
                  <span className="col-span-5">Name</span>
                  <span className="col-span-3">Category</span>
                  <span className="col-span-2">Year</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>
                <div className="space-y-1">
                  {displayProjects.map((p) => {
                    const isSelected = selectedId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        onDoubleClick={() => onOpenProject(p)}
                        className={`grid grid-cols-12 gap-2 p-2 rounded-[2px] items-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#EF5A2A]/20 text-white font-bold border-l-2 border-[#EF5A2A]'
                            : 'hover:bg-white/[0.04] text-[#D3CDC3]'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-2 truncate">
                          <Folder className="w-3.5 h-3.5 text-[#EF5A2A] shrink-0" />
                          <span className="truncate">{p.title.toLowerCase()}</span>
                        </div>
                        <span className="col-span-3 truncate text-[#A6A095]">{p.category}</span>
                        <span className="col-span-2 text-[#A6A095]">{p.year}</span>
                        <span className="col-span-2 text-right text-[#EF5A2A] text-[11px]">
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

