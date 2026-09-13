import { Request, Response, NextFunction } from 'express';
import { eventRegistrationService } from './eventRegistration.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';

export class EventRegistrationController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.id || req.params.eventId;
      const { attendee_name, attendee_email, attendee_phone, organization, metadata } = req.body;

      const registration = await eventRegistrationService.register(eventId, {
        attendee_name,
        attendee_email,
        attendee_phone,
        organization,
        metadata,
      });

      res.status(201).json({
        data: {
          id: registration.id,
          event_id: registration.event_id,
          attendee_name: registration.attendee_name,
          attendee_email: registration.attendee_email,
          status: registration.status,
          registration_timestamp: registration.registration_timestamp,
          message: 'Registration confirmed. You are on the attendee list.',
        },
        meta: null,
        error: null,
      });
    } catch (err) {
      next(err);
    }
  }

  public async listForEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.params.id || req.params.eventId;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const { items, total } = await eventRegistrationService.getRegistrationsForEvent(eventId, {
        status,
        page,
        limit,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        data: items.map((r) => ({
          ...r,
          metadata: r.metadata ? JSON.parse(r.metadata) : null,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        error: null,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationId = req.params.id;
      const { status } = req.body;
      if (!status) {
        throw new AppError(400, 'Status is required', undefined, 'INVALID_STATUS');
      }

      const updated = await eventRegistrationService.updateStatus(registrationId, status);

      res.json({
        data: {
          ...updated,
          metadata: updated.metadata ? JSON.parse(updated.metadata) : null,
        },
        meta: null,
        error: null,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const eventRegistrationController = new EventRegistrationController();
