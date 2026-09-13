import type { TeamMember } from '../../../frontend/src/types.ts';

export type MemberEntity = TeamMember & {
  createdAt?: string;
  updatedAt?: string;
};
