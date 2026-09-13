import { resourcesRepository, ResourceRecord } from '../../db/repositories/resources.repository.ts';

export interface PublicResourceDto {
  id: string;
  title: string;
  description: string;
  category: 'Guide' | 'Schematic' | 'DesignSystem' | 'StarterKit';
  url: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function formatPublicResource(record: ResourceRecord): PublicResourceDto {
  let tags: string[] = [];
  try {
    tags = JSON.parse(record.tags);
  } catch {
    tags = [];
  }

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    url: record.url,
    tags,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export class ResourcesService {
  public async getPaginatedResources(options: {
    page: number;
    limit: number;
    offset: number;
    category?: string;
    tag?: string;
    search?: string;
  }): Promise<{ items: PublicResourceDto[]; total: number }> {
    const { items, total } = resourcesRepository.findPublishedPaginated({
      category: options.category,
      tag: options.tag,
      search: options.search,
      offset: options.offset,
      limit: options.limit,
    });

    return {
      items: items.map(formatPublicResource),
      total,
    };
  }

  public async getResourceById(id: string): Promise<PublicResourceDto | null> {
    const record = resourcesRepository.findPublishedById(id);
    return record ? formatPublicResource(record) : null;
  }
}

export const resourcesService = new ResourcesService();
