import { Request, Response, NextFunction } from 'express';
import { announcementsRepository, type AnnouncementRecord } from '../../db/repositories/announcements.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminAnnouncementsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const priority = req.query.priority as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = announcementsRepository.findAllAdmin({
        page,
        limit,
        status,
        priority,
        search,
      });

      const meta = createPaginationMeta(page, limit, total);
      res.status(200).json(apiSuccess(items, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const announcement = announcementsRepository.findById(id);
      if (!announcement) {
        throw new AppError(404, `Announcement with ID '${id}' was not found`, undefined, 'ANNOUNCEMENT_NOT_FOUND');
      }
      res.status(200).json(apiSuccess(announcement));
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, title, summary, body, priority, publishStatus, expiresAt } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new AppError(400, 'Title is required', undefined, 'INVALID_TITLE');
      }
      if (!summary || typeof summary !== 'string') {
        throw new AppError(400, 'Summary is required', undefined, 'INVALID_SUMMARY');
      }

      const announcementId = id || `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const status = publishStatus || 'draft';
      const now = new Date().toISOString();

      const announcement = announcementsRepository.create({
        id: announcementId,
        title: title.trim(),
        summary: summary.trim(),
        body: body || summary,
        priority: priority === 'Urgent' ? 'Urgent' : 'Normal',
        publish_status: status,
        published_at: status === 'published' ? now : null,
        expires_at: expiresAt || null,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'ANNOUNCEMENT',
          entityId: announcementId,
          details: { title, publishStatus: status },
        },
        req
      );

      res.status(201).json(apiSuccess(announcement, { message: 'Announcement created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expectedUpdatedAt = req.headers['if-match'] as string | undefined || req.body.expected_updated_at;

      const announcement = announcementsRepository.findById(id);
      if (!announcement) {
        throw new AppError(404, `Announcement with ID '${id}' was not found`, undefined, 'ANNOUNCEMENT_NOT_FOUND');
      }

      const updates: Partial<AnnouncementRecord> = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.summary !== undefined) updates.summary = req.body.summary;
      if (req.body.body !== undefined) updates.body = req.body.body;
      if (req.body.priority !== undefined) updates.priority = req.body.priority;
      if (req.body.publishStatus !== undefined) updates.publish_status = req.body.publishStatus;
      if (req.body.expiresAt !== undefined) updates.expires_at = req.body.expiresAt;

      const result = announcementsRepository.updateWithConcurrency(id, updates, expectedUpdatedAt);

      if (result.conflict) {
        throw new AppError(
          409,
          'Conflict: This announcement was modified by another administrator. Please refresh and retry.',
          undefined,
          'CONCURRENCY_CONFLICT'
        );
      }

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE',
          entityType: 'ANNOUNCEMENT',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(result.announcement, { message: 'Announcement updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        throw new AppError(400, "Status must be one of: 'draft', 'published', 'archived'", undefined, 'INVALID_STATUS');
      }

      if (status === 'archived' && req.admin?.role !== 'super_admin') {
        throw new AppError(403, 'Forbidden: Only super_admin can archive content', undefined, 'INSUFFICIENT_PERMISSIONS');
      }

      const announcement = announcementsRepository.findById(id);
      if (!announcement) {
        throw new AppError(404, `Announcement with ID '${id}' was not found`, undefined, 'ANNOUNCEMENT_NOT_FOUND');
      }

      const previousStatus = announcement.publish_status;
      const updated = announcementsRepository.updateStatus(id, status);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: status === 'published' ? 'PUBLISH' : status === 'archived' ? 'ARCHIVE' : 'STATUS_CHANGE',
          entityType: 'ANNOUNCEMENT',
          entityId: id,
          details: { previousStatus, newStatus: status },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: `Announcement status updated to '${status}'` }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const announcement = announcementsRepository.findById(id);
      if (!announcement) {
        throw new AppError(404, `Announcement with ID '${id}' was not found`, undefined, 'ANNOUNCEMENT_NOT_FOUND');
      }

      announcementsRepository.deleteAnnouncement(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'ANNOUNCEMENT',
          entityId: id,
          details: { title: announcement.title },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Announcement deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminAnnouncementsController = new AdminAnnouncementsController();
