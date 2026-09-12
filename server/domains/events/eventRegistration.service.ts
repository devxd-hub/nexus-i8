import crypto from 'node:crypto';
import {
  eventRegistrationsRepository,
  type EventRegistrationRecord,
  type EventRegistrationStatus,
} from '../../db/repositories/eventRegistrations.repository.ts';
import { eventsRepository, type EventRecord } from '../../db/repositories/events.repository.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { sanitizeText } from '../../middleware/spamProtection.ts';
import { notificationHooks, NotificationHookService } from '../../services/notificationHook.service.ts';

export const VALID_REGISTRATION_TRANSITIONS: Record<EventRegistrationStatus, EventRegistrationStatus[]> = {
  CONFIRMED: ['CANCELLED', 'ATTENDED'],
  WAITLISTED: ['CONFIRMED', 'CANCELLED'],
  CANCELLED: [],
  ATTENDED: [],
};

export interface RegisterEventDto {
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  organization?: string;
  metadata?: Record<string, any>;
}

export class EventRegistrationService {
  /**
   * Helper to resolve event by ID or Slug
   */
  private resolveEvent(eventIdentifier: string): EventRecord {
    let event = eventsRepository.findById(eventIdentifier);
    if (!event) {
      event = eventsRepository.findBySlug(eventIdentifier);
    }
    if (!event) {
      throw new AppError(404, `Event not found: ${eventIdentifier}`, undefined, 'EVENT_NOT_FOUND');
    }
    return event;
  }

  public async register(eventIdentifier: string, dto: RegisterEventDto): Promise<EventRegistrationRecord> {
    // 1. Resolve event
    const event = this.resolveEvent(eventIdentifier);

    // 2. Validate event status & registration availability
    if (
      event.registration_status === 'CLOSED' ||
      event.status === 'Completed' ||
      event.status === 'Cancelled'
    ) {
      throw new AppError(
        400,
        `Registration for "${event.title}" is currently closed.`,
        undefined,
        'EVENT_REGISTRATION_CLOSED'
      );
    }

    // 3. Validate attendee identity
    const attendeeName = sanitizeText(dto.attendee_name || '');
    if (!attendeeName || attendeeName.length < 2 || attendeeName.length > 100) {
      throw new AppError(400, 'Attendee name must be between 2 and 100 characters', undefined, 'INVALID_NAME');
    }

    const email = (dto.attendee_email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new AppError(400, 'A valid attendee email address is required', undefined, 'INVALID_EMAIL');
    }

    // 4. Duplicate Check
    const existing = eventRegistrationsRepository.findByEventAndEmail(event.id, email);
    if (existing && (existing.status === 'CONFIRMED' || existing.status === 'WAITLISTED')) {
      throw new AppError(
        409,
        `Attendee "${email}" is already registered for this event.`,
        undefined,
        'DUPLICATE_REGISTRATION'
      );
    }

    // 5. Capacity Check
    if (typeof event.capacity === 'number' && event.capacity > 0) {
      const confirmedCount = eventRegistrationsRepository.countConfirmedByEvent(event.id);
      if (confirmedCount >= event.capacity) {
        throw new AppError(
          400,
          `Event "${event.title}" has reached its maximum capacity of ${event.capacity} attendees.`,
          undefined,
          'EVENT_CAPACITY_REACHED'
        );
      }
    }

    // 6. Create Registration Record
    const id = `evreg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const record = eventRegistrationsRepository.create({
      id,
      event_id: event.id,
      attendee_name: attendeeName,
      attendee_email: email,
      attendee_phone: dto.attendee_phone ? sanitizeText(dto.attendee_phone).substring(0, 30) : null,
      organization: dto.organization ? sanitizeText(dto.organization).substring(0, 100) : null,
      status: 'CONFIRMED',
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      registration_timestamp: now,
    });

    // 7. Dispatch Decoupled Notification Hook
    notificationHooks.dispatch('event.registered', {
      registrationId: record.id,
      eventId: event.id,
      attendeeName: record.attendee_name,
      maskedEmail: NotificationHookService.maskEmail(record.attendee_email),
      timestamp: record.registration_timestamp,
    });

    return record;
  }

  public async getRegistrationsForEvent(
    eventId: string,
    filter?: { status?: string; page?: number; limit?: number }
  ): Promise<{ items: EventRegistrationRecord[]; total: number }> {
    const event = this.resolveEvent(eventId);
    return eventRegistrationsRepository.listByEvent(event.id, filter);
  }

  public async updateStatus(
    registrationId: string,
    newStatus: EventRegistrationStatus
  ): Promise<EventRegistrationRecord> {
    const existing = eventRegistrationsRepository.findById(registrationId);
    if (!existing) {
      throw new AppError(404, `Registration not found: ${registrationId}`, undefined, 'REGISTRATION_NOT_FOUND');
    }

    // State machine check
    const allowed = VALID_REGISTRATION_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        400,
        `Cannot transition registration status from ${existing.status} to ${newStatus}. Allowed transitions: ${allowed.join(', ') || 'None (Terminal)'}`,
        undefined,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const updated = eventRegistrationsRepository.updateStatus(registrationId, newStatus);
    if (!updated) {
      throw new AppError(500, 'Failed to update registration status', undefined, 'INTERNAL_SERVER_ERROR');
    }

    if (newStatus === 'CANCELLED') {
      notificationHooks.dispatch('event.cancelled', {
        registrationId: updated.id,
        eventId: updated.event_id,
        timestamp: updated.updated_at,
      });
    }

    return updated;
  }
}

export const eventRegistrationService = new EventRegistrationService();
