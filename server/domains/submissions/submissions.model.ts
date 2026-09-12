export type SubmissionIntent = 'COLLABORATE WITH US' | 'ASK A QUESTION' | 'JOIN SQUAD' | 'GENERAL';

export interface SubmissionEntity {
  id: string;
  intent: SubmissionIntent;
  fullName: string;
  email: string;
  majorOrAffiliation?: string;
  message?: string;
  status: 'Unread' | 'Reviewed' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
}
