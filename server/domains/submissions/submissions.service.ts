import crypto from 'node:crypto';
import { submissionsRepository, SubmissionRecord } from '../../db/repositories/submissions.repository.ts';
import { notificationHooks, NotificationHookService } from '../../services/notificationHook.service.ts';
import { sanitizeText } from '../../middleware/spamProtection.ts';

export const ALLOWED_CONTACT_CATEGORIES = [
  'collaboration',
  'sponsorship',
  'workshop',
  'project',
  'general inquiry',
  'COLLABORATE WITH US',
  'ASK A QUESTION',
  'JOIN SQUAD',
  'GENERAL',
];

export class SubmissionsService {
  public async getSubmissions(query?: { status?: string; category?: string; intent?: string }): Promise<SubmissionRecord[]> {
    return submissionsRepository.findAll({
      status: query?.status,
      category: query?.category || query?.intent,
    });
  }

  public async getSubmissionById(id: string): Promise<SubmissionRecord | null> {
    return submissionsRepository.findById(id);
  }

  public async createSubmission(data: {
    fullName?: string;
    name?: string;
    email: string;
    intent?: string;
    category?: string;
    majorOrAffiliation?: string;
    message?: string;
  }): Promise<SubmissionRecord> {
    const rawName = data.name || data.fullName || '';
    const name = sanitizeText(rawName);
    const email = data.email.trim().toLowerCase();
    const category = (data.category || data.intent || 'general inquiry').trim();
    const message = data.message ? sanitizeText(data.message) : null;

    const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const record = submissionsRepository.create({
      id,
      name,
      email,
      category,
      message,
      metadata: data.majorOrAffiliation ? JSON.stringify({ majorOrAffiliation: sanitizeText(data.majorOrAffiliation) }) : null,
      status: 'Unread',
    });

    // Fire decoupled notification hook
    notificationHooks.dispatch('contact.submitted', {
      id: record.id,
      category: record.category,
      name: record.name,
      maskedEmail: NotificationHookService.maskEmail(record.email),
      timestamp: record.created_at,
    });

    return record;
  }

  public async updateStatus(id: string, status: SubmissionRecord['status']): Promise<SubmissionRecord | null> {
    return submissionsRepository.updateStatus(id, status);
  }

  public async deleteSubmission(id: string): Promise<boolean> {
    return submissionsRepository.deleteById(id);
  }
}

export const submissionsService = new SubmissionsService();
