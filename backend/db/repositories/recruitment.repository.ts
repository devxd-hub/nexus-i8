import { BaseRepository } from './base.repository.ts';

export type RecruitmentStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface RecruitmentRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  year_of_study: string | null;
  selected_domain: string;
  interests: string; // JSON string array
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  message: string | null;
  consent: number; // 1 or 0
  status: RecruitmentStatus;
  status_notes: string | null;
  created_at: string;
  updated_at: string;
}

export class RecruitmentRepository extends BaseRepository<RecruitmentRecord> {
  constructor() {
    super('recruitment_submissions');
  }

  public findById(id: string): RecruitmentRecord | null {
    const stmt = this.db.prepare('SELECT * FROM recruitment_submissions WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as RecruitmentRecord) || null;
  }

  public findByEmail(email: string): RecruitmentRecord[] {
    const stmt = this.db.prepare(
      'SELECT * FROM recruitment_submissions WHERE LOWER(email) = LOWER(?) ORDER BY created_at DESC'
    );
    return stmt.all(email) as unknown as RecruitmentRecord[];
  }

  /**
   * Find if user has submitted an active application within the given window in days
   */
  public findRecentActiveByEmail(email: string, windowDays: number = 30): RecruitmentRecord | null {
    const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
    const stmt = this.db.prepare(`
      SELECT * FROM recruitment_submissions 
      WHERE LOWER(email) = LOWER(?) 
        AND created_at >= ?
        AND status NOT IN ('REJECTED', 'WITHDRAWN')
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const row = stmt.get(email, cutoff);
    return (row as unknown as RecruitmentRecord) || null;
  }

  public findAll(filter?: {
    status?: string;
    domain?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { items: RecruitmentRecord[]; total: number } {
    let sql = 'SELECT * FROM recruitment_submissions WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM recruitment_submissions WHERE 1=1';
    const params: (string | number)[] = [];
    const countParams: (string | number)[] = [];

    if (filter?.status) {
      sql += ' AND status = ?';
      countSql += ' AND status = ?';
      params.push(filter.status);
      countParams.push(filter.status);
    }

    if (filter?.domain) {
      sql += ' AND selected_domain = ?';
      countSql += ' AND selected_domain = ?';
      params.push(filter.domain);
      countParams.push(filter.domain);
    }

    if (filter?.search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
      countSql += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
      const queryParam = `%${filter.search}%`;
      params.push(queryParam, queryParam, queryParam);
      countParams.push(queryParam, queryParam, queryParam);
    }

    sql += ' ORDER BY created_at DESC';

    const countStmt = this.db.prepare(countSql);
    const countRow = countStmt.get(...countParams) as { total: number };
    const total = countRow ? countRow.total : 0;

    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const offset = (page - 1) * limit;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(sql);
    const items = stmt.all(...params) as unknown as RecruitmentRecord[];

    return { items, total };
  }

  public create(data: Omit<RecruitmentRecord, 'created_at' | 'updated_at'>): RecruitmentRecord {
    const now = new Date().toISOString();
    const record: RecruitmentRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO recruitment_submissions (
        id, name, email, phone, department, year_of_study, selected_domain,
        interests, portfolio_url, github_url, linkedin_url, message, consent,
        status, status_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.name,
      record.email.toLowerCase().trim(),
      record.phone,
      record.department,
      record.year_of_study,
      record.selected_domain,
      record.interests,
      record.portfolio_url,
      record.github_url,
      record.linkedin_url,
      record.message,
      record.consent,
      record.status,
      record.status_notes,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public updateStatus(
    id: string,
    status: RecruitmentStatus,
    status_notes?: string | null
  ): RecruitmentRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE recruitment_submissions 
      SET status = ?, status_notes = COALESCE(?, status_notes), updated_at = ? 
      WHERE id = ?
    `);
    stmt.run(status, status_notes !== undefined ? status_notes : null, now, id);

    return {
      ...existing,
      status,
      status_notes: status_notes !== undefined ? status_notes : existing.status_notes,
      updated_at: now,
    };
  }

  public deleteById(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM recruitment_submissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const recruitmentRepository = new RecruitmentRepository();
