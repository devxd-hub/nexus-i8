import type { Project } from '../../../frontend/src/types.ts';

export type ProjectEntity = Project & {
  createdAt?: string;
  updatedAt?: string;
};
