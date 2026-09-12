import { BaseRepository } from './base.repository.ts';

export interface ProjectRecord {
  id: string;
  slug: string;
  project_number: string | null;
  title: string;
  category: string;
  year: string;
  short_description: string;
  full_description: string;
  disciplines: string;
  status: 'Active' | 'Completed' | 'Incubating';
  featured: number; // 0 or 1
  technologies: string; // JSON array
  deliverables: string | null; // JSON array
  cover_image: string | null;
  demo_url: string | null;
  repository_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberSummary {
  project_id: string;
  member_id: string;
  public_id: string;
  name: string;
  role: string | null;
  photo_url: string | null;
}

export interface ProjectFilterOptions {
  category?: string;
  status?: string;
  technology?: string;
  featured?: boolean;
  search?: string;
  offset?: number;
  limit?: number;
}

export class ProjectsRepository extends BaseRepository<ProjectRecord> {
  constructor() {
    super('projects');
  }

  public findPaginated(options: ProjectFilterOptions = {}): { items: ProjectRecord[]; total: number } {
    let whereClause = ' WHERE 1=1';
    const params: (string | number | null)[] = [];

    if (options.category) {
      whereClause += ' AND LOWER(category) = LOWER(?)';
      params.push(options.category);
    }
    if (options.status) {
      whereClause += ' AND LOWER(status) = LOWER(?)';
      params.push(options.status);
    }
    if (options.featured !== undefined) {
      whereClause += ' AND featured = ?';
      params.push(options.featured ? 1 : 0);
    }
    if (options.technology) {
      whereClause += ' AND LOWER(technologies) LIKE LOWER(?)';
      params.push(`%${options.technology}%`);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(short_description) LIKE LOWER(?) OR LOWER(technologies) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    // Total count
    const countSql = `SELECT COUNT(*) as count FROM projects${whereClause}`;
    const countRow = this.db.prepare(countSql).get(...params) as { count: number };
    const total = Number(countRow?.count || 0);

    // Items with deterministic sort
    let querySql = `SELECT * FROM projects${whereClause} ORDER BY year DESC, project_number ASC, created_at DESC`;
    const queryParams = [...params];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      queryParams.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...queryParams) as unknown as ProjectRecord[];

    return { items, total };
  }

  public findById(id: string): ProjectRecord | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as ProjectRecord) || null;
  }

  public findBySlug(slug: string): ProjectRecord | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE LOWER(slug) = LOWER(?) OR id = ?');
    const row = stmt.get(slug, slug);
    return (row as unknown as ProjectRecord) || null;
  }

  public findFeatured(): ProjectRecord[] {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE featured = 1 ORDER BY year DESC, project_number ASC');
    return stmt.all() as unknown as ProjectRecord[];
  }

  public create(data: Omit<ProjectRecord, 'created_at' | 'updated_at'>): ProjectRecord {
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, slug, project_number, title, category, year, short_description,
        full_description, disciplines, status, featured, technologies,
        deliverables, cover_image, demo_url, repository_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.slug,
      record.project_number,
      record.title,
      record.category,
      record.year,
      record.short_description,
      record.full_description,
      record.disciplines,
      record.status,
      record.featured,
      record.technologies,
      record.deliverables,
      record.cover_image,
      record.demo_url,
      record.repository_url,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public update(id: string, data: Partial<ProjectRecord>): ProjectRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: ProjectRecord = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE projects SET
        slug = ?, project_number = ?, title = ?, category = ?, year = ?,
        short_description = ?, full_description = ?, disciplines = ?, status = ?,
        featured = ?, technologies = ?, deliverables = ?, cover_image = ?,
        demo_url = ?, repository_url = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.slug,
      updated.project_number,
      updated.title,
      updated.category,
      updated.year,
      updated.short_description,
      updated.full_description,
      updated.disciplines,
      updated.status,
      updated.featured,
      updated.technologies,
      updated.deliverables,
      updated.cover_image,
      updated.demo_url,
      updated.repository_url,
      updated.updated_at,
      id
    );

    return updated;
  }

  // Batch query to avoid N+1 queries when loading members for a list of projects
  public getMembersForProjects(projectIds: string[]): Map<string, ProjectMemberSummary[]> {
    const map = new Map<string, ProjectMemberSummary[]>();
    if (projectIds.length === 0) return map;

    const placeholders = projectIds.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT pm.project_id, pm.member_id, pm.role, m.name, m.public_id, m.photo_url
      FROM project_members pm
      JOIN members m ON pm.member_id = m.id
      WHERE pm.project_id IN (${placeholders})
      ORDER BY pm.created_at ASC
    `);

    const rows = stmt.all(...projectIds) as unknown as ProjectMemberSummary[];
    for (const row of rows) {
      const list = map.get(row.project_id) || [];
      list.push(row);
      map.set(row.project_id, list);
    }
    return map;
  }

  public getMembers(projectId: string): ProjectMemberSummary[] {
    const map = this.getMembersForProjects([projectId]);
    return map.get(projectId) || [];
  }

  public addMember(projectId: string, memberId: string, role?: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO project_members (project_id, member_id, role, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(projectId, memberId, role || null, new Date().toISOString());
  }

  public removeMember(projectId: string, memberId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM project_members WHERE project_id = ? AND member_id = ?');
    const res = stmt.run(projectId, memberId);
    return Number(res.changes) > 0;
  }

  public getRelatedEvents(projectId: string): Array<{ id: string; title: string; event_date: string; event_type: string }> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT e.id, e.title, e.event_date, e.event_type
      FROM events e
      JOIN archive_items a ON a.related_event_id = e.id
      WHERE a.related_project_id = ?
      ORDER BY e.event_date DESC
    `);
    return stmt.all(projectId) as unknown as Array<{ id: string; title: string; event_date: string; event_type: string }>;
  }
}

export const projectsRepository = new ProjectsRepository();
