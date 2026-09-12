import type { Project } from '../../../src/types.ts';

export type ProjectEntity = Project & {
  createdAt?: string;
  updatedAt?: string;
};
