import type { TeamMember } from '../../../src/types.ts';

export type MemberEntity = TeamMember & {
  createdAt?: string;
  updatedAt?: string;
};
