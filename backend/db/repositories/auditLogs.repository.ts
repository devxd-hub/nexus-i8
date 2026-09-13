import { BaseRepository } from './base.repository.ts';

export interface AuditLogRecord {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  admin_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface CreateAuditLogParams {
  id?: string;
  adminId?: string | null;
  adminName?: string | null;
  adminRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string | null;
}

export class AuditLogsRepository extends BaseRepository<AuditLogRecord> {
  constructor() {
    super('audit_logs');
  }

  public record(params: CreateAuditLogParams): AuditLogRecord {
    const id = params.id || `aud-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const detailsStr: string | null =
      typeof params.details === 'object' && params.details !== null
        ? JSON.stringify(params.details)
        : typeof params.details === 'string'
        ? params.details
        : null;

    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, admin_id, admin_name, admin_role, action, entity_type, entity_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      params.adminId || null,
      params.adminName || null,
      params.adminRole || null,
      params.action,
      params.entityType,
      params.entityId || null,
      detailsStr,
      params.ipAddress || null,
      now
    );

    return {
      id,
      admin_id: params.adminId || null,
      admin_name: params.adminName || null,
      admin_role: params.adminRole || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      details: detailsStr,
      ip_address: params.ipAddress || null,
      created_at: now,
    };
  }

  public findPaginated(
    options: {
      action?: string;
      entityType?: string;
      adminId?: string;
      page?: number;
      limit?: number;
    } = {}
  ): { items: AuditLogRecord[]; total: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (options.action) {
      conditions.push('action = ?');
      params.push(options.action);
    }
    if (options.entityType) {
      conditions.push('entity_type = ?');
      params.push(options.entityType);
    }
    if (options.adminId) {
      conditions.push('admin_id = ?');
      params.push(options.adminId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = this.db.prepare(`SELECT COUNT(*) AS total FROM audit_logs ${whereClause}`);
    const countRow = countStmt.get(...params) as { total: number } | undefined;
    const total = countRow ? Number(countRow.total) : 0;

    const selectStmt = this.db.prepare(`
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const items = selectStmt.all(...params, limit, offset) as unknown as AuditLogRecord[];

    return { items, total };
  }
}

export const auditLogsRepository = new AuditLogsRepository();
