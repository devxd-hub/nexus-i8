/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, AppRoute } from '../../types.ts';

export type WindowType =
  | 'project'
  | 'terminal'
  | 'file-manager'
  | 'properties'
  | 'system-info'
  | 'readme-viewer';

export interface LinuxWindowData {
  id: string;
  type: WindowType;
  title: string;
  icon?: string;
  project?: Project;
  filePath?: string;
  fileContent?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevGeometry?: { x: number; y: number; width: number; height: number };
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: 'desktop' | 'project-folder' | 'system';
  targetProject?: Project;
}

export type SortMode = 'name' | 'year' | 'category';
export type ViewMode = 'grid' | 'list';

export interface VirtualFile {
  name: string;
  type: 'file' | 'folder' | 'link';
  size?: string;
  modified?: string;
  content?: string;
  project?: Project;
  icon?: string;
  url?: string;
}

export interface VirtualDirectory {
  path: string;
  name: string;
  items: VirtualFile[];
}
