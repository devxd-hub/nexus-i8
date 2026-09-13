import { Request, Response, NextFunction } from 'express';
import { archiveService } from './archive.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, parsePaginationParams, createPaginationMeta } from '../../utils/apiResponse.ts';

export class ArchiveController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = parsePaginationParams(req.query as Record<string, unknown>, 14);
      const category = req.query.category as string | undefined;
      const year = req.query.year as string | undefined;
      const search = req.query.q as string | undefined;

      const { items, total } = await archiveService.getPaginatedArchive({
        page,
        limit,
        offset,
        category,
        year,
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
      const item = await archiveService.getArchiveItemById(id);
      if (!item) {
        throw new AppError(404, `Archive item not found: ${id}`, undefined, 'ARCHIVE_ITEM_NOT_FOUND');
      }
      res.json(apiSuccess(item));
    } catch (err) {
      next(err);
    }
  }
}

export const archiveController = new ArchiveController();
