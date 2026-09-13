import { archiveRepository, ArchiveRecord } from '../../db/repositories/archive.repository.ts';

export interface PublicArchiveDto {
  id: string;
  title: string;
  year: string;
  category: string;
  description: string;
  caption: string;
  imageUrl: string;
  aspectRatio: string | null;
  author: string | null;
  location: string | null;
  createdAt: string;
}

export function formatPublicArchive(record: ArchiveRecord): PublicArchiveDto {
  return {
    id: record.id,
    title: record.title,
    year: record.year,
    category: record.category,
    description: record.description,
    caption: record.caption,
    imageUrl: record.media_reference,
    aspectRatio: record.aspect_ratio,
    author: record.author,
    location: record.location,
    createdAt: record.created_at,
  };
}

export class ArchiveService {
  public async getPaginatedArchive(options: {
    page: number;
    limit: number;
    offset: number;
    category?: string;
    year?: string;
    search?: string;
  }): Promise<{ items: PublicArchiveDto[]; total: number }> {
    const { items, total } = archiveRepository.findPaginated({
      category: options.category,
      year: options.year,
      search: options.search,
      offset: options.offset,
      limit: options.limit,
    });

    return {
      items: items.map(formatPublicArchive),
      total,
    };
  }

  public async getArchiveItemById(id: string): Promise<PublicArchiveDto | null> {
    const record = archiveRepository.findById(id);
    return record ? formatPublicArchive(record) : null;
  }
}

export const archiveService = new ArchiveService();
