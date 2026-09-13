import { Request, Response, NextFunction } from 'express';
import { archiveRepository, type ArchiveRecord } from '../../db/repositories/archive.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminArchiveController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const year = req.query.year as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = archiveRepository.findAllAdmin({
        page,
        limit,
        status,
        category,
        year,
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
      const item = archiveRepository.findById(id);
      if (!item) {
        throw new AppError(404, `Archive item with ID '${id}' was not found`, undefined, 'ARCHIVE_ITEM_NOT_FOUND');
      }
      res.status(200).json(apiSuccess(item));
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        id,
        title,
        year,
        category,
        description,
        caption,
        mediaReference,
        aspectRatio,
        author,
        location,
        relatedProjectId,
        relatedEventId,
        status,
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new AppError(400, 'Title is required', undefined, 'INVALID_TITLE');
      }
      if (!category || typeof category !== 'string') {
        throw new AppError(400, 'Category is required', undefined, 'INVALID_CATEGORY');
      }
      if (!mediaReference || typeof mediaReference !== 'string') {
        throw new AppError(400, 'mediaReference is required', undefined, 'INVALID_MEDIA_REFERENCE');
      }

      const archiveId = id || `arch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const itemStatus = status || 'published';

      const item = archiveRepository.create({
        id: archiveId,
        title: title.trim(),
        year: year || new Date().getFullYear().toString(),
        category: category as ArchiveRecord['category'],
        description: description || '',
        caption: caption || '',
        media_reference: mediaReference,
        aspect_ratio: aspectRatio || null,
        author: author || null,
        location: location || null,
        related_project_id: relatedProjectId || null,
        related_event_id: relatedEventId || null,
        status: itemStatus,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'ARCHIVE',
          entityId: archiveId,
          details: { title, status: itemStatus },
        },
        req
      );

      res.status(201).json(apiSuccess(item, { message: 'Archive item created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const item = archiveRepository.findById(id);
      if (!item) {
        throw new AppError(404, `Archive item with ID '${id}' was not found`, undefined, 'ARCHIVE_ITEM_NOT_FOUND');
      }

      const updates: Partial<ArchiveRecord> = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.year !== undefined) updates.year = req.body.year;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.caption !== undefined) updates.caption = req.body.caption;
      if (req.body.mediaReference !== undefined) updates.media_reference = req.body.mediaReference;
      if (req.body.aspectRatio !== undefined) updates.aspect_ratio = req.body.aspectRatio;
      if (req.body.author !== undefined) updates.author = req.body.author;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.relatedProjectId !== undefined) updates.related_project_id = req.body.relatedProjectId;
      if (req.body.relatedEventId !== undefined) updates.related_event_id = req.body.relatedEventId;
      if (req.body.status !== undefined) updates.status = req.body.status;

      const updated = archiveRepository.update(id, updates);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE',
          entityType: 'ARCHIVE',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: 'Archive item updated successfully' }));
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

      const item = archiveRepository.findById(id);
      if (!item) {
        throw new AppError(404, `Archive item with ID '${id}' was not found`, undefined, 'ARCHIVE_ITEM_NOT_FOUND');
      }

      const previousStatus = item.status;
      const updated = archiveRepository.updateStatus(id, status);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: status === 'published' ? 'PUBLISH' : status === 'archived' ? 'ARCHIVE' : 'STATUS_CHANGE',
          entityType: 'ARCHIVE',
          entityId: id,
          details: { previousStatus, newStatus: status },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: `Archive item status updated to '${status}'` }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const item = archiveRepository.findById(id);
      if (!item) {
        throw new AppError(404, `Archive item with ID '${id}' was not found`, undefined, 'ARCHIVE_ITEM_NOT_FOUND');
      }

      archiveRepository.deleteArchiveItem(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'ARCHIVE',
          entityId: id,
          details: { title: item.title },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Archive item deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminArchiveController = new AdminArchiveController();
