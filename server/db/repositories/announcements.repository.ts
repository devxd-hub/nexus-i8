import { BaseRepository } from './base.repository.ts';

export interface AnnouncementRecord {
  id: string;
  title: string;
  summary: string;
  body: string;
  priority: 'Normal' | 'Urgent';
  publish_status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export class AnnouncementsRepository extends BaseRepository<AnnouncementRecord> {
  constructor() {
    super('announcements');
  }

  public findPublishedPaginated(options: { offset?: number; limit?: number } = {}): {
    items: AnnouncementRecord[];
    total: number;
  } {
    const countRow = this.db
      .prepare("SELECT COUNT(*) as count FROM announcements WHERE publish_status = 'published'")
      .get() as { count: number };
    const total = Number(countRow?.count || 0);

    let querySql = `
      SELECT * FROM announcements
      WHERE publish_status = 'published'
      ORDER BY published_at DESC, created_at DESC
    `;
    const params: number[] = [];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      params.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...params) as unknown as AnnouncementRecord[];
    return { items, total };
  }

  public findPublishedById(id: string): AnnouncementRecord | null {
    const stmt = this.db.prepare("SELECT * FROM announcements WHERE id = ? AND publish_status = 'published'");
    const row = stmt.get(id);
    return (row as unknown as AnnouncementRecord) || null;
  }

  public findById(id: string): AnnouncementRecord | null {
    const stmt = this.db.prepare('SELECT * FROM announcements WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as AnnouncementRecord) || null;
  }

  public create(data: Omit<AnnouncementRecord, 'created_at' | 'updated_at'>): AnnouncementRecord {
    const now = new Date().toISOString();
    const record: AnnouncementRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO announcements (
        id, title, summary, body, priority, publish_status,
        published_at, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.title,
      record.summary,
      record.body,
      record.priority,
      record.publish_status,
      record.published_at,
      record.expires_at,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public update(id: string, data: Partial<AnnouncementRecord>): AnnouncementRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: AnnouncementRecord = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE announcements SET
        title = ?, summary = ?, body = ?, priority = ?, publish_status = ?,
        published_at = ?, expires_at = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.summary,
      updated.body,
      updated.priority,
      updated.publish_status,
      updated.published_at,
      updated.expires_at,
      updated.updated_at,
      id
    );

    return updated;
  }

  public findAllAdmin(options: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
  } = {}): { items: AnnouncementRecord[]; total: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];

    if (options.status) {
      whereClause += ' AND LOWER(publish_status) = LOWER(?)';
      params.push(options.status);
    }
    if (options.priority) {
      whereClause += ' AND LOWER(priority) = LOWER(?)';
      params.push(options.priority);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(summary) LIKE LOWER(?) OR LOWER(body) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM announcements${whereClause}`);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow.count;

    const query = `
      SELECT * FROM announcements
      ${whereClause}
      ORDER BY updated_at DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(query).all(...params, limit, offset) as unknown as AnnouncementRecord[];
    return { items, total };
  }

  public updateWithConcurrency(
    id: string,
    updates: Partial<AnnouncementRecord>,
    expectedUpdatedAt?: string
  ): { success: boolean; conflict?: boolean; announcement?: AnnouncementRecord } {
    const existing = this.findById(id);
    if (!existing) return { success: false };

    if (expectedUpdatedAt && existing.updated_at !== expectedUpdatedAt) {
      return { success: false, conflict: true, announcement: existing };
    }

    const updated = this.update(id, updates);
    return { success: true, announcement: updated || undefined };
  }

  public updateStatus(id: string, status: 'draft' | 'published' | 'archived'): AnnouncementRecord | null {
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    let query = 'UPDATE announcements SET publish_status = ?, updated_at = ?';
    const params: (string | null)[] = [status, now];

    if (status === 'published') {
      query += ', published_at = COALESCE(published_at, ?)';
      params.push(publishedAt);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const stmt = this.db.prepare(query);
    const result = stmt.run(...params);
    if (result.changes === 0) return null;
    return this.findById(id);
  }

  public deleteAnnouncement(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM announcements WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const announcementsRepository = new AnnouncementsRepository();
