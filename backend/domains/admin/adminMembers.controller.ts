import { Request, Response, NextFunction } from 'express';
import { membersRepository, type MemberRecord } from '../../db/repositories/members.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminMembersController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const role = req.query.role as string | undefined;
      const domain = req.query.domain as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = membersRepository.findAllAdmin({
        page,
        limit,
        status,
        role,
        domain,
        search,
      });

      const enriched = items.map((m) => ({
        ...m,
        social_links: m.social_links ? JSON.parse(m.social_links) : {},
      }));

      const meta = createPaginationMeta(page, limit, total);
      res.status(200).json(apiSuccess(enriched, meta));
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const member = membersRepository.findById(id);
      if (!member) {
        throw new AppError(404, `Member with ID '${id}' was not found`, undefined, 'MEMBER_NOT_FOUND');
      }

      res.status(200).json(
        apiSuccess({
          ...member,
          social_links: member.social_links ? JSON.parse(member.social_links) : {},
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        id,
        publicId,
        name,
        email,
        role,
        domain,
        bio,
        photoUrl,
        imagePosition,
        socials,
        status,
        joinedDate,
      } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError(400, 'Member name is required', undefined, 'INVALID_NAME');
      }
      if (!role || typeof role !== 'string') {
        throw new AppError(400, 'Member role is required', undefined, 'INVALID_ROLE');
      }

      const memberId = id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const memberPublicId =
        publicId ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const member = membersRepository.create({
        id: memberId,
        public_id: memberPublicId,
        name: name.trim(),
        email: email || `${memberPublicId}@nexus.campus`,
        role: role.trim(),
        domain: domain || 'Engineering & Design',
        bio: bio || null,
        photo_url: photoUrl || null,
        image_position: imagePosition || null,
        social_links: socials ? JSON.stringify(socials) : null,
        status: (status as MemberRecord['status']) || 'active',
        joined_date: joinedDate || new Date().toISOString().split('T')[0],
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'MEMBER',
          entityId: memberId,
          details: { name, publicId: memberPublicId, role },
        },
        req
      );

      res.status(201).json(apiSuccess(member, { message: 'Member created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expectedUpdatedAt = req.headers['if-match'] as string | undefined || req.body.expected_updated_at;

      const member = membersRepository.findById(id);
      if (!member) {
        throw new AppError(404, `Member with ID '${id}' was not found`, undefined, 'MEMBER_NOT_FOUND');
      }

      const updates: Partial<MemberRecord> = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.publicId !== undefined) updates.public_id = req.body.publicId;
      if (req.body.email !== undefined) updates.email = req.body.email;
      if (req.body.role !== undefined) updates.role = req.body.role;
      if (req.body.domain !== undefined) updates.domain = req.body.domain;
      if (req.body.bio !== undefined) updates.bio = req.body.bio;
      if (req.body.photoUrl !== undefined) updates.photo_url = req.body.photoUrl;
      if (req.body.imagePosition !== undefined) updates.image_position = req.body.imagePosition;
      if (req.body.socials !== undefined) updates.social_links = JSON.stringify(req.body.socials);
      if (req.body.status !== undefined) updates.status = req.body.status;
      if (req.body.joinedDate !== undefined) updates.joined_date = req.body.joinedDate;

      const result = membersRepository.updateWithConcurrency(id, updates, expectedUpdatedAt);

      if (result.conflict) {
        throw new AppError(
          409,
          'Conflict: This member record was updated by another administrator. Please refresh and retry.',
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
          entityType: 'MEMBER',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(result.member, { message: 'Member updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const member = membersRepository.findById(id);
      if (!member) {
        throw new AppError(404, `Member with ID '${id}' was not found`, undefined, 'MEMBER_NOT_FOUND');
      }

      membersRepository.deleteMember(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'MEMBER',
          entityId: id,
          details: { name: member.name, publicId: member.public_id },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Member deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminMembersController = new AdminMembersController();
