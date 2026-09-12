import { Request, Response, NextFunction } from 'express';
import { submissionsService } from './submissions.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, parsePaginationParams, createPaginationMeta } from '../../utils/apiResponse.ts';

export class SubmissionsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = parsePaginationParams(req.query as Record<string, unknown>, 20);
      const status = req.query.status as string | undefined;
      const intent = req.query.intent as string | undefined;
      const items = await submissionsService.getSubmissions({ status, intent });
      const meta = createPaginationMeta(page, limit, items.length);
      res.json(apiSuccess(items, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await submissionsService.getSubmissionById(id);
      if (!item) {
        throw new AppError(404, `Submission not found with id: ${id}`, undefined, 'SUBMISSION_NOT_FOUND');
      }
      res.json(apiSuccess(item));
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, intent, majorOrAffiliation, message } = req.body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        throw new AppError(400, 'Full name is required', undefined, 'INVALID_NAME');
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new AppError(400, 'A valid email address is required', undefined, 'INVALID_EMAIL');
      }

      const created = await submissionsService.createSubmission({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        intent: intent || 'COLLABORATE WITH US',
        majorOrAffiliation: majorOrAffiliation ? String(majorOrAffiliation).trim() : undefined,
        message: message ? String(message).trim() : undefined,
      });

      res.status(201).json(
        apiSuccess(created, {
          message: 'Submission successfully received. The NEXUS squad will be in touch.',
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['Unread', 'Reviewed', 'Archived'].includes(status)) {
        throw new AppError(400, 'Invalid status value. Must be Unread, Reviewed, or Archived', undefined, 'INVALID_STATUS');
      }

      const updated = await submissionsService.updateStatus(id, status);
      if (!updated) {
        throw new AppError(404, `Submission not found with id: ${id}`, undefined, 'SUBMISSION_NOT_FOUND');
      }
      res.json(apiSuccess(updated));
    } catch (err) {
      next(err);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await submissionsService.deleteSubmission(id);
      if (!deleted) {
        throw new AppError(404, `Submission not found with id: ${id}`, undefined, 'SUBMISSION_NOT_FOUND');
      }
      res.json(apiSuccess({ deleted: true }));
    } catch (err) {
      next(err);
    }
  }
}

export const submissionsController = new SubmissionsController();
