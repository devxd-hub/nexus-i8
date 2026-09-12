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

  public findAllAdmin(options: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {}): { items: ResourceRecord[]; total: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];

    if (options.status) {
      whereClause += ' AND LOWER(published_status) = LOWER(?)';
      params.push(options.status);
    }
    if (options.category) {
      whereClause += ' AND LOWER(category) = LOWER(?)';
      params.push(options.category);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM resources${whereClause}`);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow.count;

    const query = `
      SELECT * FROM resources
      ${whereClause}
      ORDER BY updated_at DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(query).all(...params, limit, offset) as unknown as ResourceRecord[];
    return { items, total };
  }

  public updateWithConcurrency(
    id: string,
    updates: Partial<ResourceRecord>,
    expectedUpdatedAt?: string
  ): { success: boolean; conflict?: boolean; resource?: ResourceRecord } {
    const existing = this.findById(id);
    if (!existing) return { success: false };

    if (expectedUpdatedAt && existing.updated_at !== expectedUpdatedAt) {
      return { success: false, conflict: true, resource: existing };
    }

    const updated = this.update(id, updates);
    return { success: true, resource: updated || undefined };
  }

  public updateStatus(id: string, status: 'draft' | 'published' | 'archived'): ResourceRecord | null {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE resources SET published_status = ?, updated_at = ? WHERE id = ?');
    const result = stmt.run(status, now, id);
    if (result.changes === 0) return null;
    return this.findById(id);
  }

  public deleteResource(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM resources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const resourcesRepository = new ResourcesRepository();
