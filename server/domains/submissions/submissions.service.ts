import { submissionsRepository, SubmissionRecord } from '../../db/repositories/submissions.repository.ts';

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
    fullName: string;
    email: string;
    intent: string;
    majorOrAffiliation?: string;
    message?: string;
  }): Promise<SubmissionRecord> {
    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return submissionsRepository.create({
      id,
      name: data.fullName,
      email: data.email,
      category: data.intent,
      message: data.message || null,
      metadata: data.majorOrAffiliation ? JSON.stringify({ majorOrAffiliation: data.majorOrAffiliation }) : null,
      status: 'Unread',
    });
  }

  public async updateStatus(id: string, status: SubmissionRecord['status']): Promise<SubmissionRecord | null> {
    return submissionsRepository.updateStatus(id, status);
  }

  public async deleteSubmission(id: string): Promise<boolean> {
    return submissionsRepository.deleteById(id);
  }
}

export const submissionsService = new SubmissionsService();
