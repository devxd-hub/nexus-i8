import {
  projectsRepository,
  ProjectRecord,
  ProjectMemberSummary,
} from '../../db/repositories/projects.repository.ts';

export interface PublicProjectDto {
  id: string;
  slug: string;
  projectNumber: string | null;
  title: string;
  category: string;
  year: string;
  summary: string;
  description: string;
  disciplines: string;
  status: 'Active' | 'Completed' | 'Incubating';
  featured: boolean;
  technologies: string[];
  deliverables: string[];
  coverImage: string | null;
  demoUrl: string | null;
  repositoryUrl: string | null;
  members?: Array<{
    id: string;
    publicId: string;
    name: string;
    role: string | null;
    photoUrl: string | null;
  }>;
  relatedEvents?: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function formatPublicProject(
  record: ProjectRecord,
  members?: ProjectMemberSummary[],
  relatedEvents?: Array<{ id: string; title: string; event_date: string; event_type: string }>
): PublicProjectDto {
  let tech: string[] = [];
  try {
    tech = JSON.parse(record.technologies);
  } catch {
    tech = [];
  }

  let deliverables: string[] = [];
  if (record.deliverables) {
    try {
      deliverables = JSON.parse(record.deliverables);
    } catch {
      deliverables = [];
    }
  }

  return {
    id: record.id,
    slug: record.slug,
    projectNumber: record.project_number,
    title: record.title,
    category: record.category,
    year: record.year,
    summary: record.short_description,
    description: record.full_description,
    disciplines: record.disciplines,
    status: record.status,
    featured: record.featured === 1,
    technologies: tech,
    deliverables,
    coverImage: record.cover_image,
    demoUrl: record.demo_url,
    repositoryUrl: record.repository_url,
    ...(members
      ? {
          members: members.map((m) => ({
            id: m.member_id,
            publicId: m.public_id,
            name: m.name,
            role: m.role,
            photoUrl: m.photo_url,
          })),
        }
      : {}),
    ...(relatedEvents
      ? {
          relatedEvents: relatedEvents.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.event_date,
            type: e.event_type,
          })),
        }
      : {}),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export class ProjectsService {
  public async getPaginatedProjects(options: {
    page: number;
    limit: number;
    offset: number;
    category?: string;
    status?: string;
    technology?: string;
    featured?: boolean;
    search?: string;
  }): Promise<{ items: PublicProjectDto[]; total: number }> {
    const { items, total } = projectsRepository.findPaginated({
      category: options.category,
      status: options.status,
      technology: options.technology,
      featured: options.featured,
      search: options.search,
      offset: options.offset,
      limit: options.limit,
    });

    // Batch load members for all retrieved projects to prevent N+1 queries
    const projectIds = items.map((p) => p.id);
    const membersMap = projectsRepository.getMembersForProjects(projectIds);

    const dtoList = items.map((record) => {
      const members = membersMap.get(record.id) || [];
      return formatPublicProject(record, members);
    });

    return { items: dtoList, total };
  }

  public async getFeaturedProjects(): Promise<PublicProjectDto[]> {
    const records = projectsRepository.findFeatured();
    const projectIds = records.map((p) => p.id);
    const membersMap = projectsRepository.getMembersForProjects(projectIds);

    return records.map((record) => {
      const members = membersMap.get(record.id) || [];
      return formatPublicProject(record, members);
    });
  }

  public async getProjectBySlug(slug: string): Promise<PublicProjectDto | null> {
    const record = projectsRepository.findBySlug(slug);
    if (!record) return null;

    const members = projectsRepository.getMembers(record.id);
    const relatedEvents = projectsRepository.getRelatedEvents(record.id);

    return formatPublicProject(record, members, relatedEvents);
  }

  public async getProjectMembers(slug: string) {
    const record = projectsRepository.findBySlug(slug);
    if (!record) return null;
    return projectsRepository.getMembers(record.id).map((m) => ({
      id: m.member_id,
      publicId: m.public_id,
      name: m.name,
      role: m.role,
      photoUrl: m.photo_url,
    }));
  }

  public async getProjectRelatedEvents(slug: string) {
    const record = projectsRepository.findBySlug(slug);
    if (!record) return null;
    return projectsRepository.getRelatedEvents(record.id).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.event_date,
      type: e.event_type,
    }));
  }
}

export const projectsService = new ProjectsService();
