import { Request, Response, NextFunction } from 'express';
import { auditService } from '../../services/audit.service.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminAuditLogsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const action = req.query.action as string | undefined;
      const entityType = req.query.entityType as string | undefined;
      const adminId = req.query.adminId as string | undefined;

      const { items, total } = auditService.getPaginated({
        page,
        limit,
        action,
        entityType,
        adminId,
      });

      const enriched = items.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));

      const meta = createPaginationMeta(page, limit, total);
      res.status(200).json(apiSuccess(enriched, meta));
    } catch (err) {
      next(err);
    }
  }
}

export const adminAuditLogsController = new AdminAuditLogsController();
