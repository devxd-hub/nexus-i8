import { BaseRepository } from './base.repository.ts';

export interface MemberRecord {
  id: string;
  public_id: string;
  name: string;
  email: string | null;
  role: string;
  domain: string | null;
  bio: string | null;
  photo_url: string | null;
  image_position: string | null;
  social_links: string | null; // JSON stringified
  status: 'active' | 'alumni' | 'inactive';
  joined_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberFilterOptions {
  status?: string;
  role?: string;
  domain?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export class MembersRepository extends BaseRepository<MemberRecord> {
  constructor() {
    super('members');
  }

  public findPaginated(options: MemberFilterOptions = {}): { items: MemberRecord[]; total: number } {
    let whereClause = ' WHERE 1=1';
    const params: (string | number | null)[] = [];

    // By default, public API queries only active members
    const status = options.status || 'active';
    if (status !== 'all') {
      whereClause += ' AND LOWER(status) = LOWER(?)';
      params.push(status);
    }

    if (options.role) {
      whereClause += ' AND LOWER(role) LIKE LOWER(?)';
      params.push(`%${options.role}%`);
    }

    if (options.domain) {
      whereClause += ' AND LOWER(domain) LIKE LOWER(?)';
      params.push(`%${options.domain}%`);
    }

    if (options.search) {
      whereClause += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(role) LIKE LOWER(?) OR LOWER(domain) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countSql = `SELECT COUNT(*) as count FROM members${whereClause}`;
    const countRow = this.db.prepare(countSql).get(...params) as { count: number };
    const total = Number(countRow?.count || 0);

    let querySql = `SELECT * FROM members${whereClause} ORDER BY name ASC, created_at ASC`;
    const queryParams = [...params];

    if (options.limit !== undefined) {
      querySql += ' LIMIT ? OFFSET ?';
      queryParams.push(options.limit, options.offset || 0);
    }

    const items = this.db.prepare(querySql).all(...queryParams) as unknown as MemberRecord[];
    return { items, total };
  }

  public findAll(filter?: MemberFilterOptions): MemberRecord[] {
    return this.findPaginated(filter).items;
  }

  public findById(id: string): MemberRecord | null {
    const stmt = this.db.prepare('SELECT * FROM members WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as MemberRecord) || null;
  }

  public findByPublicId(publicId: string): MemberRecord | null {
    const stmt = this.db.prepare('SELECT * FROM members WHERE LOWER(public_id) = LOWER(?) OR id = ?');
    const row = stmt.get(publicId, publicId);
    return (row as unknown as MemberRecord) || null;
  }

  public create(data: Omit<MemberRecord, 'created_at' | 'updated_at'>): MemberRecord {
    const now = new Date().toISOString();
    const record: MemberRecord = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO members (
        id, public_id, name, email, role, domain, bio, photo_url,
        image_position, social_links, status, joined_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.public_id,
      record.name,
      record.email,
      record.role,
      record.domain,
      record.bio,
      record.photo_url,
      record.image_position,
      record.social_links,
      record.status,
      record.joined_date,
      record.created_at,
      record.updated_at
    );

    return record;
  }

  public update(id: string, data: Partial<MemberRecord>): MemberRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: MemberRecord = {
      ...existing,
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE members SET
        public_id = ?, name = ?, email = ?, role = ?, domain = ?, bio = ?,
        photo_url = ?, image_position = ?, social_links = ?, status = ?,
        joined_date = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.public_id,
      updated.name,
      updated.email,
      updated.role,
      updated.domain,
      updated.bio,
      updated.photo_url,
      updated.image_position,
      updated.social_links,
      updated.status,
      updated.joined_date,
      updated.updated_at,
      id
    );

    return updated;
  }

  public findAllAdmin(options: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    domain?: string;
    search?: string;
  } = {}): { items: MemberRecord[]; total: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];

    if (options.status) {
      whereClause += ' AND LOWER(status) = LOWER(?)';
      params.push(options.status);
    }
    if (options.role) {
      whereClause += ' AND LOWER(role) LIKE LOWER(?)';
      params.push(`%${options.role}%`);
    }
    if (options.domain) {
      whereClause += ' AND LOWER(domain) LIKE LOWER(?)';
      params.push(`%${options.domain}%`);
    }
    if (options.search) {
      whereClause += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(role) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM members${whereClause}`);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow.count;

    const query = `
      SELECT * FROM members
      ${whereClause}
      ORDER BY updated_at DESC, name ASC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(query).all(...params, limit, offset) as unknown as MemberRecord[];
    return { items, total };
  }

  public updateWithConcurrency(
    id: string,
    updates: Partial<MemberRecord>,
    expectedUpdatedAt?: string
  ): { success: boolean; conflict?: boolean; member?: MemberRecord } {
    const existing = this.findById(id);
    if (!existing) return { success: false };

    if (expectedUpdatedAt && existing.updated_at !== expectedUpdatedAt) {
      return { success: false, conflict: true, member: existing };
    }

    const updated = this.update(id, updates);
    return { success: true, member: updated || undefined };
  }

  public deleteMember(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM members WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const membersRepository = new MembersRepository();
