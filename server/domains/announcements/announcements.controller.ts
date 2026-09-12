import { Request, Response, NextFunction } from 'express';
import { announcementsService } from './announcements.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, parsePaginationParams, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AnnouncementsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = parsePaginationParams(req.query as Record<string, unknown>, 10);
      const { items, total } = await announcementsService.getPublishedAnnouncements({
        page,
        limit,
        offset,
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
      const announcement = await announcementsService.getPublishedAnnouncementById(id);
      if (!announcement) {
        throw new AppError(404, `Announcement not found: ${id}`, undefined, 'ANNOUNCEMENT_NOT_FOUND');
      }
      res.json(apiSuccess(announcement));
    } catch (err) {
      next(err);
    }
  }
}

export const announcementsController = new AnnouncementsController();
