import { BaseRepository } from './base.repository.ts';

export type AdminRole = 'super_admin' | 'content_admin';
export type AdminStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
  role: AdminRole;
  status: AdminStatus;
  failed_attempts: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SafeAdminUser = Omit<AdminUserRecord, 'password_hash' | 'salt'>;

export class AdminUsersRepository extends BaseRepository<AdminUserRecord> {
  constructor() {
    super('admin_users');
  }

  public findByEmail(email: string): AdminUserRecord | null {
    const stmt = this.db.prepare('SELECT * FROM admin_users WHERE LOWER(email) = LOWER(?) LIMIT 1');
    const row = stmt.get(email.trim());
    return (row as unknown as AdminUserRecord) || null;
  }

  public create(user: AdminUserRecord): AdminUserRecord {
    const stmt = this.db.prepare(`
      INSERT INTO admin_users (
        id, email, name, password_hash, salt, role, status,
        failed_attempts, locked_until, last_login_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.email,
      user.name,
      user.password_hash,
      user.salt,
      user.role,
      user.status,
      user.failed_attempts,
      user.locked_until,
      user.last_login_at,
      user.created_at,
      user.updated_at
    );

    return user;
  }

  public listAllSafe(): SafeAdminUser[] {
    const stmt = this.db.prepare(
      'SELECT id, email, name, role, status, failed_attempts, locked_until, last_login_at, created_at, updated_at FROM admin_users ORDER BY created_at ASC'
    );
    return stmt.all() as unknown as SafeAdminUser[];
  }

  public findSafeById(id: string): SafeAdminUser | null {
    const stmt = this.db.prepare(
      'SELECT id, email, name, role, status, failed_attempts, locked_until, last_login_at, created_at, updated_at FROM admin_users WHERE id = ? LIMIT 1'
    );
    const row = stmt.get(id);
    return (row as unknown as SafeAdminUser) || null;
  }

  public incrementFailedAttempts(id: string, maxAttempts = 5, lockoutMinutes = 15): { locked: boolean; lockedUntil: string | null } {
    const user = this.findById(id);
    if (!user) return { locked: false, lockedUntil: null };

    const newAttempts = user.failed_attempts + 1;
    let lockedUntil: string | null = null;

    if (newAttempts >= maxAttempts) {
      const lockDate = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      lockedUntil = lockDate.toISOString();
    }

    const stmt = this.db.prepare(`
      UPDATE admin_users
      SET failed_attempts = ?, locked_until = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(newAttempts, lockedUntil, new Date().toISOString(), id);

    return { locked: newAttempts >= maxAttempts, lockedUntil };
  }

  public resetFailedAttemptsAndRecordLogin(id: string): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE admin_users
      SET failed_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(now, now, id);
  }

  public updateAdmin(
    id: string,
    updates: Partial<Pick<AdminUserRecord, 'name' | 'email' | 'role' | 'status' | 'password_hash' | 'salt'>>
  ): SafeAdminUser | null {
    const user = this.findById(id);
    if (!user) return null;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email.toLowerCase().trim());
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.password_hash !== undefined && updates.salt !== undefined) {
      fields.push('password_hash = ?', 'salt = ?');
      values.push(updates.password_hash, updates.salt);
    }

    if (fields.length === 0) return this.findSafeById(id);

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const query = `UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(query).run(...values);

    return this.findSafeById(id);
  }
}

export const adminUsersRepository = new AdminUsersRepository();
