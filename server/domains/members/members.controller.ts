import { Request, Response, NextFunction } from 'express';
import { membersService } from './members.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, parsePaginationParams, createPaginationMeta } from '../../utils/apiResponse.ts';

export class MembersController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = parsePaginationParams(req.query as Record<string, unknown>, 24);
      const role = req.query.role as string | undefined;
      const domain = req.query.domain as string | undefined;
      const search = req.query.q as string | undefined;

      const { items, total } = await membersService.getPaginatedMembers({
        page,
        limit,
        offset,
        role,
        domain,
        search,
      });

      const meta = createPaginationMeta(page, limit, total);
      res.json(apiSuccess(items, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getByPublicId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const member = await membersService.getMemberByPublicId(id);
      if (!member) {
        throw new AppError(404, `Member not found: ${id}`, undefined, 'MEMBER_NOT_FOUND');
      }
      res.json(apiSuccess(member));
    } catch (err) {
      next(err);
    }
  }
}

export const membersController = new MembersController();
