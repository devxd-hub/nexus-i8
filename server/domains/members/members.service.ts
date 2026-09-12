import { membersRepository, MemberRecord } from '../../db/repositories/members.repository.ts';

export interface PublicMemberDto {
  id: string;
  publicId: string;
  name: string;
  role: string;
  domain: string | null;
  bio: string | null;
  photoUrl: string | null;
  imagePosition: string | null;
  socials: Record<string, string> | null;
  status: 'active' | 'alumni' | 'inactive';
  joinedDate: string | null;
  createdAt: string;
}

export function formatPublicMember(record: MemberRecord): PublicMemberDto {
  let socials: Record<string, string> | null = null;
  if (record.social_links) {
    try {
      socials = JSON.parse(record.social_links);
    } catch {
      socials = null;
    }
  }

  return {
    id: record.id,
    publicId: record.public_id,
    name: record.name,
    role: record.role,
    domain: record.domain,
    bio: record.bio,
    photoUrl: record.photo_url,
    imagePosition: record.image_position,
    socials,
    status: record.status,
    joinedDate: record.joined_date,
    createdAt: record.created_at,
  };
}

export class MembersService {
  public async getPaginatedMembers(options: {
    page: number;
    limit: number;
    offset: number;
    role?: string;
    domain?: string;
    search?: string;
    status?: string;
  }): Promise<{ items: PublicMemberDto[]; total: number }> {
    const { items, total } = membersRepository.findPaginated({
      status: options.status || 'active',
      role: options.role,
      domain: options.domain,
      search: options.search,
      offset: options.offset,
      limit: options.limit,
    });

    return {
      items: items.map(formatPublicMember),
      total,
    };
  }

  public async getMemberByPublicId(publicId: string): Promise<PublicMemberDto | null> {
    const record = membersRepository.findByPublicId(publicId);
    return record ? formatPublicMember(record) : null;
  }
}

export const membersService = new MembersService();
