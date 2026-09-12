import type { GalleryItem } from '../../../src/types.ts';

export type ArchiveEntity = GalleryItem & {
  createdAt?: string;
  updatedAt?: string;
};
