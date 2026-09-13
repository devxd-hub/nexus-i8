export type EidMemberStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI';

export interface EidCardMemberDto {
  uniqueId: string;
  slug: string;
  name: string;
  displayName: string;
  role: string;
  department: string;
  domain: string[];
  image: string | null;
  bio: string | null;
  status: EidMemberStatus;
  clearanceLevel: string;
  specialWord: string;
  quote: string | null;
  nodeLocation: string;
  frequency: string;
  securityZone: string;
  badgeIssue: string;
  skills: string[];
  socials: Record<string, string> | null;
  qrUrl: string;
  createdAt: string;
  updatedAt: string;
}
