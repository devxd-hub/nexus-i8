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
}

export const announcementsRepository = new AnnouncementsRepository();
