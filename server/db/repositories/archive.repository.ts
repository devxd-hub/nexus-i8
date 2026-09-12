import { BaseRepository } from './base.repository.ts';

export interface ArchiveRecord {
  id: string;
  title: string;
  year: string;
  category: 'People' | 'Workshops' | 'Projects' | 'Events' | 'Prototyping' | 'Collaboration' | 'Presentations';
  description: string;
  caption: string;
  media_reference: string;
  aspect_ratio: string | null;
  author: string | null;
  location: string | null;
  related_project_id: string | null;
  related_event_id: string | null;
  created_at: string;
}

export interface ArchiveFilterOptions {
  category?: string;
  year?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export class ArchiveRepository extends BaseRepository<ArchiveRecord> {
  constructor() {
    super('archive_items');
  }

  public findPaginated(options: ArchiveFilterOptions = {}): { items: ArchiveRecord[]; total: number } {
    let whereClause = ' WHERE 1=1';
    const params: (string | number | null)[] = [];

    if (options.category) {
      whereClause += ' AND LOWER(category) = LOWER(?)';
      params.push(options.category);
    }
    if (options.year) {
      whereClause += ' AND year = ?';
      params.push(options.year);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(caption) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countSql = `SELECT COUNT(*) as count FROM archive_items${whereClause}`;
    const countRow = this.db.prepare(countSql).get(...params) as { count: number };
    const total = Number(countRow?.count || 0);

    let querySql = `SELECT * FROM archive_items${whereClause} ORDER BY year DESC, created_at ASC`;
    const queryParams = [...params];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      queryParams.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...queryParams) as unknown as ArchiveRecord[];
    return { items, total };
  }

  public findById(id: string): ArchiveRecord | null {
    const stmt = this.db.prepare('SELECT * FROM archive_items WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as ArchiveRecord) || null;
  }

  public create(data: Omit<ArchiveRecord, 'created_at'>): ArchiveRecord {
    const now = new Date().toISOString();
    const record: ArchiveRecord = {
      ...data,
      created_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO archive_items (
        id, title, year, category, description, caption, media_reference,
        aspect_ratio, author, location, related_project_id, related_event_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.title,
      record.year,
      record.category,
      record.description,
      record.caption,
      record.media_reference,
      record.aspect_ratio,
      record.author,
      record.location,
      record.related_project_id,
      record.related_event_id,
      record.created_at
    );

    return record;
  }

  public update(id: string, data: Partial<ArchiveRecord>): ArchiveRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: ArchiveRecord = {
      ...existing,
      ...data,
      id,
    };

    const stmt = this.db.prepare(`
      UPDATE archive_items SET
        title = ?, year = ?, category = ?, description = ?, caption = ?,
        media_reference = ?, aspect_ratio = ?, author = ?, location = ?,
        related_project_id = ?, related_event_id = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.year,
      updated.category,
      updated.description,
      updated.caption,
      updated.media_reference,
      updated.aspect_ratio,
      updated.author,
      updated.location,
      updated.related_project_id,
      updated.related_event_id,
      id
    );

    return updated;
  }
}

export const archiveRepository = new ArchiveRepository();
