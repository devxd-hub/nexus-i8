import { Request, Response, NextFunction } from 'express';
import { eventsRepository, type EventRecord } from '../../db/repositories/events.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminEventsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const eventType = req.query.eventType as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = eventsRepository.findAllAdmin({
        page,
        limit,
        status,
        event_type: eventType,
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
      const event = eventsRepository.findById(id);
      if (!event) {
        throw new AppError(404, `Event with ID '${id}' was not found`, undefined, 'EVENT_NOT_FOUND');
      }
      res.status(200).json(apiSuccess(event));
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        id,
        slug,
        title,
        description,
        eventType,
        eventDate,
        eventTime,
        venue,
        registrationUrl,
        coverImage,
        featured,
        status,
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new AppError(400, 'Event title is required', undefined, 'INVALID_TITLE');
      }
      if (!eventType || !['Workshop', 'Showcase', 'OpenStudio', 'Meeting'].includes(eventType)) {
        throw new AppError(400, "Event type must be one of: 'Workshop', 'Showcase', 'OpenStudio', 'Meeting'", undefined, 'INVALID_EVENT_TYPE');
      }
      if (!eventDate || typeof eventDate !== 'string') {
        throw new AppError(400, 'Event date is required', undefined, 'INVALID_DATE');
      }

      const eventId = id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const eventSlug =
        slug ||
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const initialStatus = status || 'Draft';

      const event = eventsRepository.create({
        id: eventId,
        slug: eventSlug,
        title: title.trim(),
        description: description || '',
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime || '18:00',
        venue: venue || 'SOA Main Lab',
        registration_url: registrationUrl || null,
        cover_image: coverImage || null,
        featured: featured ? 1 : 0,
        status: initialStatus as EventRecord['status'],
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'EVENT',
          entityId: eventId,
          details: { title, slug: eventSlug, status: initialStatus },
        },
        req
      );

      res.status(201).json(apiSuccess(event, { message: 'Event created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expectedUpdatedAt = req.headers['if-match'] as string | undefined || req.body.expected_updated_at;

      const event = eventsRepository.findById(id);
      if (!event) {
        throw new AppError(404, `Event with ID '${id}' was not found`, undefined, 'EVENT_NOT_FOUND');
      }

      const updates: Partial<EventRecord> = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.slug !== undefined) updates.slug = req.body.slug;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.eventType !== undefined) updates.event_type = req.body.eventType;
      if (req.body.eventDate !== undefined) updates.event_date = req.body.eventDate;
      if (req.body.eventTime !== undefined) updates.event_time = req.body.eventTime;
      if (req.body.venue !== undefined) updates.venue = req.body.venue;
      if (req.body.registrationUrl !== undefined) updates.registration_url = req.body.registrationUrl;
      if (req.body.coverImage !== undefined) updates.cover_image = req.body.coverImage;
      if (req.body.featured !== undefined) updates.featured = req.body.featured ? 1 : 0;
      if (req.body.status !== undefined) updates.status = req.body.status;

      const result = eventsRepository.updateWithConcurrency(id, updates, expectedUpdatedAt);

      if (result.conflict) {
        throw new AppError(
          409,
          'Conflict: This event was modified by another administrator. Please refresh and retry.',
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
          entityType: 'EVENT',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(result.event, { message: 'Event updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['Draft', 'Upcoming', 'Completed', 'Cancelled', 'Archived'].includes(status)) {
        throw new AppError(400, "Status must be one of: 'Draft', 'Upcoming', 'Completed', 'Cancelled', 'Archived'", undefined, 'INVALID_STATUS');
      }

      if (status === 'Archived' && req.admin?.role !== 'super_admin') {
        throw new AppError(403, 'Forbidden: Only super_admin can archive content', undefined, 'INSUFFICIENT_PERMISSIONS');
      }

      const event = eventsRepository.findById(id);
      if (!event) {
        throw new AppError(404, `Event with ID '${id}' was not found`, undefined, 'EVENT_NOT_FOUND');
      }

      const previousStatus = event.status;
      const updated = eventsRepository.updateStatus(id, status);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: status === 'Upcoming' ? 'PUBLISH' : status === 'Archived' ? 'ARCHIVE' : 'STATUS_CHANGE',
          entityType: 'EVENT',
          entityId: id,
          details: { previousStatus, newStatus: status },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: `Event status updated to '${status}'` }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const event = eventsRepository.findById(id);
      if (!event) {
        throw new AppError(404, `Event with ID '${id}' was not found`, undefined, 'EVENT_NOT_FOUND');
      }

      eventsRepository.deleteEvent(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'EVENT',
          entityId: id,
          details: { title: event.title, slug: event.slug },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Event deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminEventsController = new AdminEventsController();
