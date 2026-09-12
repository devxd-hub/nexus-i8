import { BaseRepository } from './base.repository.ts';

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_type: 'Workshop' | 'Showcase' | 'OpenStudio' | 'Meeting';
  event_date: string;
  event_time: string;
  venue: string;
  registration_url: string | null;
  cover_image: string | null;
  featured: number; // 0 or 1
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export interface EventFilterOptions {
  status?: string;
  event_type?: string;
  year?: string;
  featured?: boolean;
  offset?: number;
  limit?: number;
}

export class EventsRepository extends BaseRepository<EventRecord> {
  constructor() {
    super('events');
  }

  public findPaginated(options: EventFilterOptions = {}): { items: EventRecord[]; total: number } {
    let whereClause = ' WHERE 1=1';
    const params: (string | number | null)[] = [];

    if (options.status) {
      whereClause += ' AND LOWER(status) = LOWER(?)';
      params.push(options.status);
    } else {
      whereClause += " AND LOWER(status) != 'draft'";
    }
    if (options.event_type) {
      whereClause += ' AND LOWER(event_type) = LOWER(?)';
      params.push(options.event_type);
    }
    if (options.year) {
      whereClause += ' AND event_date LIKE ?';
      params.push(`%${options.year}%`);
    }
    if (options.featured !== undefined) {
      whereClause += ' AND featured = ?';
      params.push(options.featured ? 1 : 0);
    }

    const countSql = `SELECT COUNT(*) as count FROM events${whereClause}`;
    const countRow = this.db.prepare(countSql).get(...params) as { count: number };
    const total = Number(countRow?.count || 0);

    let querySql = `SELECT * FROM events${whereClause} ORDER BY event_date ASC, created_at DESC`;
    const queryParams = [...params];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      queryParams.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...queryParams) as unknown as EventRecord[];
    return { items, total };
  }

  public findUpcoming(): EventRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM events
      WHERE status = 'Upcoming'
      ORDER BY event_date ASC
    `);
    return stmt.all() as unknown as EventRecord[];
  }

  public findPast(): EventRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM events
      WHERE status = 'Completed'
      ORDER BY event_date DESC
    `);
    return stmt.all() as unknown as EventRecord[];
  }

  public findFeatured(): EventRecord[] {
    const stmt = this.db.prepare('SELECT * FROM events WHERE featured = 1 ORDER BY event_date ASC');
    return stmt.all() as unknown as EventRecord[];
  }

  public findById(id: string): EventRecord | null {
    const stmt = this.db.prepare('SELECT * FROM events WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as EventRecord) || null;
  }

  public findBySlug(slug: string): EventRecord | null {
    const stmt = this.db.prepare('SELECT * FROM events WHERE LOWER(slug) = LOWER(?) OR id = ?');
    const row = stmt.get(slug, slug);
    return (row as unknown as EventRecord) || null;
  }

  public create(data: Omit<EventRecord, 'created_at' | 'updated_at'>): EventRecord {
    const now = new Date().toISOString();
    const record: EventRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO events (
        id, slug, title, description, event_type, event_date, event_time,
        venue, registration_url, cover_image, featured, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.slug,
      record.title,
      record.description,
      record.event_type,
      record.event_date,
      record.event_time,
      record.venue,
      record.registration_url,
      record.cover_image,
      record.featured,
      record.status,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public update(id: string, data: Partial<EventRecord>): EventRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: EventRecord = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE events SET
        slug = ?, title = ?, description = ?, event_type = ?, event_date = ?,
        event_time = ?, venue = ?, registration_url = ?, cover_image = ?,
        featured = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.slug,
      updated.title,
      updated.description,
      updated.event_type,
      updated.event_date,
      updated.event_time,
      updated.venue,
      updated.registration_url,
      updated.cover_image,
      updated.featured,
      updated.status,
      updated.updated_at,
      id
    );

    return updated;
  }

  public findAllAdmin(options: {
    page?: number;
    limit?: number;
    status?: string;
    event_type?: string;
    search?: string;
  } = {}): { items: EventRecord[]; total: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];

    if (options.status) {
      whereClause += ' AND LOWER(status) = LOWER(?)';
      params.push(options.status);
    }
    if (options.event_type) {
      whereClause += ' AND LOWER(event_type) = LOWER(?)';
      params.push(options.event_type);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM events${whereClause}`);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow.count;

    const query = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY updated_at DESC, id ASC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(query).all(...params, limit, offset) as unknown as EventRecord[];
    return { items, total };
  }

  public updateWithConcurrency(
    id: string,
    updates: Partial<EventRecord>,
    expectedUpdatedAt?: string
  ): { success: boolean; conflict?: boolean; event?: EventRecord } {
    const existing = this.findById(id);
    if (!existing) return { success: false };

    if (expectedUpdatedAt && existing.updated_at !== expectedUpdatedAt) {
      return { success: false, conflict: true, event: existing };
    }

    const updated = this.update(id, updates);
    return { success: true, event: updated || undefined };
  }

  public updateStatus(id: string, status: string): EventRecord | null {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE events SET status = ?, updated_at = ? WHERE id = ?');
    const result = stmt.run(status, now, id);
    if (result.changes === 0) return null;
    return this.findById(id);
  }

  public deleteEvent(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const eventsRepository = new EventsRepository();
