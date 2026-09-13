import { auditLogsRepository, type AuditLogRecord, type CreateAuditLogParams } from '../db/repositories/auditLogs.repository.ts';
import type { Request } from 'express';

export class AuditService {
  public log(params: CreateAuditLogParams, req?: Request): AuditLogRecord {
    const ipAddress = params.ipAddress || (req ? req.ip || req.socket.remoteAddress : null);
    return auditLogsRepository.record({
      ...params,
      ipAddress: ipAddress ? String(ipAddress) : null,
    });
  }

  public getPaginated(options: {
    action?: string;
    entityType?: string;
    adminId?: string;
    page?: number;
    limit?: number;
  }): { items: AuditLogRecord[]; total: number } {
    return auditLogsRepository.findPaginated(options);
  }
}

export const auditService = new AuditService();
