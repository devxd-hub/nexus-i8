import { BaseRepository } from './base.repository.ts';

export interface MemberRecord {
  id: string;
  public_id: string;
  unique_id?: string | null;
  name: string;
  display_name?: string | null;
  email: string | null;
  role: string;
  domain: string | null;
  department?: string | null;
  bio: string | null;
  photo_url: string | null;
  image_position: string | null;
  social_links: string | null; // JSON stringified
  status: 'active' | 'alumni' | 'inactive' | 'ACTIVE' | 'ALUMNI' | 'INACTIVE';
  clearance_level?: string | null;
  special_word?: string | null;
  quote?: string | null;
  node_location?: string | null;
  frequency?: string | null;
  security_zone?: string | null;
  badge_issue?: string | null;
  skills?: string | null; // JSON stringified array
  current_focus?: string | null;
  fun_fact?: string | null;
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

  public findByUniqueId(uniqueId: string): MemberRecord | null {
    const stmt = this.db.prepare('SELECT * FROM members WHERE UPPER(unique_id) = UPPER(?)');
    const row = stmt.get(uniqueId);
    return (row as unknown as MemberRecord) || null;
  }

  public findByIdentifier(identifier: string): MemberRecord | null {
    const stmt = this.db.prepare(
      'SELECT * FROM members WHERE UPPER(unique_id) = UPPER(?) OR LOWER(public_id) = LOWER(?) OR id = ?'
    );
    const row = stmt.get(identifier, identifier, identifier);
    return (row as unknown as MemberRecord) || null;
  }

  public findBySlugAndUniqueId(slug: string, uniqueId: string): MemberRecord | null {
    const stmt = this.db.prepare(
      'SELECT * FROM members WHERE LOWER(public_id) = LOWER(?) AND UPPER(unique_id) = UPPER(?)'
    );
    const row = stmt.get(slug, uniqueId);
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
        id, public_id, unique_id, name, display_name, email, role, domain, department, bio, photo_url,
        image_position, social_links, status, clearance_level, special_word, quote, node_location,
        frequency, security_zone, badge_issue, skills, current_focus, fun_fact, joined_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.public_id,
      record.unique_id || null,
      record.name,
      record.display_name || null,
      record.email,
      record.role,
      record.domain,
      record.department || null,
      record.bio,
      record.photo_url,
      record.image_position,
      record.social_links,
      record.status,
      record.clearance_level || null,
      record.special_word || null,
      record.quote || null,
      record.node_location || null,
      record.frequency || null,
      record.security_zone || null,
      record.badge_issue || null,
      record.skills || null,
      record.current_focus || null,
      record.fun_fact || null,
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
        public_id = ?, unique_id = ?, name = ?, display_name = ?, email = ?, role = ?, domain = ?, department = ?, bio = ?,
        photo_url = ?, image_position = ?, social_links = ?, status = ?, clearance_level = ?, special_word = ?,
        quote = ?, node_location = ?, frequency = ?, security_zone = ?, badge_issue = ?, skills = ?,
        current_focus = ?, fun_fact = ?, joined_date = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.public_id,
      updated.unique_id || null,
      updated.name,
      updated.display_name || null,
      updated.email,
      updated.role,
      updated.domain,
      updated.department || null,
      updated.bio,
      updated.photo_url,
      updated.image_position,
      updated.social_links,
      updated.status,
      updated.clearance_level || null,
      updated.special_word || null,
      updated.quote || null,
      updated.node_location || null,
      updated.frequency || null,
      updated.security_zone || null,
      updated.badge_issue || null,
      updated.skills || null,
      updated.current_focus || null,
      updated.fun_fact || null,
      updated.joined_date,
      updated.updated_at,
      id
    );

    return updated;
  }

  public upsert(data: Partial<MemberRecord> & { id: string; public_id: string }): MemberRecord {
    const existing = this.findById(data.id) || this.findByPublicId(data.public_id);
    if (existing) {
      const updated = this.update(existing.id, data);
      return updated!;
    } else {
      return this.create({
        id: data.id,
        public_id: data.public_id,
        unique_id: data.unique_id || null,
        name: data.name || '',
        display_name: data.display_name || null,
        email: data.email || null,
        role: data.role || '',
        domain: data.domain || null,
        department: data.department || null,
        bio: data.bio || null,
        photo_url: data.photo_url || null,
        image_position: data.image_position || null,
        social_links: data.social_links || null,
        status: data.status || 'ACTIVE',
        clearance_level: data.clearance_level || null,
        special_word: data.special_word || null,
        quote: data.quote || null,
        node_location: data.node_location || null,
        frequency: data.frequency || null,
        security_zone: data.security_zone || null,
        badge_issue: data.badge_issue || null,
        skills: data.skills || null,
        current_focus: data.current_focus || null,
        fun_fact: data.fun_fact || null,
        joined_date: data.joined_date || null,
      });
    }
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
