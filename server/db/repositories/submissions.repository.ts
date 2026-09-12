import { BaseRepository } from './base.repository.ts';

export interface SubmissionRecord {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string | null;
  metadata: string | null; // JSON
  status: 'Unread' | 'Reviewed' | 'Archived';
  created_at: string;
  updated_at: string;
}

export class SubmissionsRepository extends BaseRepository<SubmissionRecord> {
  constructor() {
    super('submissions');
  }

  public findAll(filter?: { status?: string; category?: string }): SubmissionRecord[] {
    let sql = 'SELECT * FROM submissions WHERE 1=1';
    const params: (string | number | null)[] = [];

    if (filter?.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    if (filter?.category) {
      sql += ' AND category = ?';
      params.push(filter.category);
    }
    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as unknown as SubmissionRecord[];
  }

  public findById(id: string): SubmissionRecord | null {
    const stmt = this.db.prepare('SELECT * FROM submissions WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as SubmissionRecord) || null;
  }

  public create(data: Omit<SubmissionRecord, 'created_at' | 'updated_at'>): SubmissionRecord {
    const now = new Date().toISOString();
    const record: SubmissionRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO submissions (
        id, name, email, category, message, metadata, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.name,
      record.email,
      record.category,
      record.message,
      record.metadata,
      record.status,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public updateStatus(id: string, status: SubmissionRecord['status']): SubmissionRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, now, id);

    return {
      ...existing,
      status,
      updated_at: now,
    };
  }
}

export const submissionsRepository = new SubmissionsRepository();
