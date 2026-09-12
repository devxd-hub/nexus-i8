import { BaseRepository } from './base.repository.ts';
import type { AdminRole, AdminStatus } from './adminUsers.repository.ts';

export interface AdminSessionRecord {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuthenticatedAdminSession {
  sessionId: string;
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  expiresAt: string;
}

export class AdminSessionsRepository extends BaseRepository<AdminSessionRecord> {
  constructor() {
    super('admin_sessions');
  }

  public createSession(
    id: string,
    adminId: string,
    tokenHash: string,
    expiresAt: string,
    ipAddress?: string | null,
    userAgent?: string | null
  ): AdminSessionRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, adminId, tokenHash, expiresAt, ipAddress || null, userAgent || null, now);
    return {
      id,
      admin_id: adminId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: now,
    };
  }

  public findActiveSession(tokenHash: string): AuthenticatedAdminSession | null {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      SELECT 
        s.id AS sessionId,
        u.id AS adminId,
        u.email,
        u.name,
        u.role,
        u.status,
        s.expires_at AS expiresAt,
        u.locked_until AS lockedUntil
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > ?
      LIMIT 1
    `);

    interface RawSessionRow {
      sessionId: string;
      adminId: string;
      email: string;
      name: string;
      role: AdminRole;
      status: AdminStatus;
      expiresAt: string;
      lockedUntil: string | null;
    }

    const row = stmt.get(tokenHash, now) as unknown as RawSessionRow | undefined;
    if (!row) return null;

    // Verify account is active and not temporarily locked
    if (row.status !== 'active') return null;
    if (row.lockedUntil && new Date(row.lockedUntil) > new Date()) return null;

    return {
      sessionId: row.sessionId,
      adminId: row.adminId,
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      expiresAt: row.expiresAt,
    };
  }

  public deleteByTokenHash(tokenHash: string): boolean {
    const stmt = this.db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?');
    const result = stmt.run(tokenHash);
    return Number(result.changes) > 0;
  }

  public deleteByAdminId(adminId: string): void {
    const stmt = this.db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?');
    stmt.run(adminId);
  }

  public deleteExpiredSessions(): number {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?');
    const result = stmt.run(now);
    return Number(result.changes);
  }
}

export const adminSessionsRepository = new AdminSessionsRepository();
