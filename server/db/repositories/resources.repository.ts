import { BaseRepository } from './base.repository.ts';

export interface ResourceRecord {
  id: string;
  title: string;
  description: string;
  category: 'Guide' | 'Schematic' | 'DesignSystem' | 'StarterKit';
  url: string;
  tags: string; // JSON array
  published_status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ResourceFilterOptions {
  category?: string;
  tag?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export class ResourcesRepository extends BaseRepository<ResourceRecord> {
  constructor() {
    super('resources');
  }

  public findPublishedPaginated(options: ResourceFilterOptions = {}): {
    items: ResourceRecord[];
    total: number;
  } {
    let whereClause = " WHERE published_status = 'published'";
    const params: (string | number | null)[] = [];

    if (options.category) {
      whereClause += ' AND LOWER(category) = LOWER(?)';
      params.push(options.category);
    }
    if (options.tag) {
      whereClause += ' AND LOWER(tags) LIKE LOWER(?)';
      params.push(`%${options.tag}%`);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q);
    }

    const countSql = `SELECT COUNT(*) as count FROM resources${whereClause}`;
    const countRow = this.db.prepare(countSql).get(...params) as { count: number };
    const total = Number(countRow?.count || 0);

    let querySql = `SELECT * FROM resources${whereClause} ORDER BY category ASC, title ASC`;
    const queryParams = [...params];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      queryParams.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...queryParams) as unknown as ResourceRecord[];
    return { items, total };
  }

  public findPublishedById(id: string): ResourceRecord | null {
    const stmt = this.db.prepare("SELECT * FROM resources WHERE id = ? AND published_status = 'published'");
    const row = stmt.get(id);
    return (row as unknown as ResourceRecord) || null;
  }

  public findById(id: string): ResourceRecord | null {
    const stmt = this.db.prepare('SELECT * FROM resources WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as ResourceRecord) || null;
  }

  public create(data: Omit<ResourceRecord, 'created_at' | 'updated_at'>): ResourceRecord {
    const now = new Date().toISOString();
    const record: ResourceRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO resources (
        id, title, description, category, url, tags, published_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.title,
      record.description,
      record.category,
      record.url,
      record.tags,
      record.published_status,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public update(id: string, data: Partial<ResourceRecord>): ResourceRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: ResourceRecord = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE resources SET
        title = ?, description = ?, category = ?, url = ?, tags = ?,
        published_status = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.description,
      updated.category,
      updated.url,
      updated.tags,
      updated.published_status,
      updated.updated_at,
      id
    );

    return updated;
  }
}

export const resourcesRepository = new ResourcesRepository();
