import { Request, Response, NextFunction } from 'express';
import { resourcesRepository, type ResourceRecord } from '../../db/repositories/resources.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminResourcesController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = resourcesRepository.findAllAdmin({
        page,
        limit,
        status,
        category,
        search,
      });

      const enriched = items.map((r) => ({
        ...r,
        tags: JSON.parse(r.tags || '[]'),
      }));

      const meta = createPaginationMeta(page, limit, total);
      res.status(200).json(apiSuccess(enriched, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const resource = resourcesRepository.findById(id);
      if (!resource) {
        throw new AppError(404, `Resource with ID '${id}' was not found`, undefined, 'RESOURCE_NOT_FOUND');
      }

      res.status(200).json(
        apiSuccess({
          ...resource,
          tags: JSON.parse(resource.tags || '[]'),
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, title, description, category, url, tags, publishedStatus } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new AppError(400, 'Title is required', undefined, 'INVALID_TITLE');
      }
      if (!category || !['Guide', 'Schematic', 'DesignSystem', 'StarterKit'].includes(category)) {
        throw new AppError(400, "Category must be one of: 'Guide', 'Schematic', 'DesignSystem', 'StarterKit'", undefined, 'INVALID_CATEGORY');
      }
      if (!url || typeof url !== 'string') {
        throw new AppError(400, 'URL is required', undefined, 'INVALID_URL');
      }

      const resourceId = id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const status = publishedStatus || 'draft';

      const resource = resourcesRepository.create({
        id: resourceId,
        title: title.trim(),
        description: description || '',
        category,
        url: url.trim(),
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        published_status: status,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'RESOURCE',
          entityId: resourceId,
          details: { title, category, publishedStatus: status },
        },
        req
      );

      res.status(201).json(apiSuccess(resource, { message: 'Resource created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expectedUpdatedAt = req.headers['if-match'] as string | undefined || req.body.expected_updated_at;

      const resource = resourcesRepository.findById(id);
      if (!resource) {
        throw new AppError(404, `Resource with ID '${id}' was not found`, undefined, 'RESOURCE_NOT_FOUND');
      }

      const updates: Partial<ResourceRecord> = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.url !== undefined) updates.url = req.body.url;
      if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);
      if (req.body.publishedStatus !== undefined) updates.published_status = req.body.publishedStatus;

      const result = resourcesRepository.updateWithConcurrency(id, updates, expectedUpdatedAt);

      if (result.conflict) {
        throw new AppError(
          409,
          'Conflict: This resource was modified by another administrator. Please refresh and retry.',
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
          entityType: 'RESOURCE',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(result.resource, { message: 'Resource updated successfully' }));
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

      const resource = resourcesRepository.findById(id);
      if (!resource) {
        throw new AppError(404, `Resource with ID '${id}' was not found`, undefined, 'RESOURCE_NOT_FOUND');
      }

      const previousStatus = resource.published_status;
      const updated = resourcesRepository.updateStatus(id, status);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: status === 'published' ? 'PUBLISH' : status === 'archived' ? 'ARCHIVE' : 'STATUS_CHANGE',
          entityType: 'RESOURCE',
          entityId: id,
          details: { previousStatus, newStatus: status },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: `Resource status updated to '${status}'` }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const resource = resourcesRepository.findById(id);
      if (!resource) {
        throw new AppError(404, `Resource with ID '${id}' was not found`, undefined, 'RESOURCE_NOT_FOUND');
      }

      resourcesRepository.deleteResource(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'RESOURCE',
          entityId: id,
          details: { title: resource.title },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Resource deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminResourcesController = new AdminResourcesController();
