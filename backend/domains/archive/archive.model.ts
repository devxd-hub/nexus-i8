import type { GalleryItem } from '../../../frontend/src/types.ts';

export type ArchiveEntity = GalleryItem & {
  createdAt?: string;
  updatedAt?: string;
};
