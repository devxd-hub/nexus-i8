import { Request, Response, NextFunction } from 'express';
import { resourcesService } from './resources.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, parsePaginationParams, createPaginationMeta } from '../../utils/apiResponse.ts';

export class ResourcesController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = parsePaginationParams(req.query as Record<string, unknown>, 10);
      const category = req.query.category as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.q as string | undefined;

      const { items, total } = await resourcesService.getPaginatedResources({
        page,
        limit,
        offset,
        category,
        tag,
        search,
      });

      const meta = createPaginationMeta(page, limit, total);
      res.json(apiSuccess(items, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await resourcesService.getResourceById(id);
      if (!resource) {
        throw new AppError(404, `Resource not found: ${id}`, undefined, 'RESOURCE_NOT_FOUND');
      }
      res.json(apiSuccess(resource));
    } catch (err) {
      next(err);
    }
  }
}

export const resourcesController = new ResourcesController();
