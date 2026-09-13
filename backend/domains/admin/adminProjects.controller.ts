import { Request, Response, NextFunction } from 'express';
import { projectsRepository, type ProjectRecord } from '../../db/repositories/projects.repository.ts';
import { membersRepository } from '../../db/repositories/members.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminProjectsController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const { items, total } = projectsRepository.findAllAdmin({
        page,
        limit,
        status,
        category,
        search,
      });

      // Batch load members to prevent N+1 queries
      const projectIds = items.map((p) => p.id);
      const membersMap = projectsRepository.getMembersForProjects(projectIds);

      const enriched = items.map((p) => ({
        ...p,
        technologies: JSON.parse(p.technologies || '[]'),
        deliverables: p.deliverables ? JSON.parse(p.deliverables) : [],
        members: membersMap.get(p.id) || [],
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
      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      const members = projectsRepository.getMembers(id);
      const relatedEvents = projectsRepository.getRelatedEvents(id);

      res.status(200).json(
        apiSuccess({
          ...project,
          technologies: JSON.parse(project.technologies || '[]'),
          deliverables: project.deliverables ? JSON.parse(project.deliverables) : [],
          members,
          relatedEvents,
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
        slug,
        projectNumber,
        title,
        category,
        year,
        shortDescription,
        fullDescription,
        disciplines,
        status,
        featured,
        technologies,
        deliverables,
        coverImage,
        demoUrl,
        repositoryUrl,
      } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new AppError(400, 'Title is required', undefined, 'INVALID_TITLE');
      }
      if (!category || typeof category !== 'string') {
        throw new AppError(400, 'Category is required', undefined, 'INVALID_CATEGORY');
      }
      if (!shortDescription || typeof shortDescription !== 'string') {
        throw new AppError(400, 'Short description is required', undefined, 'INVALID_DESCRIPTION');
      }

      const projectId = id || `nxs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const projectSlug =
        slug ||
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const initialStatus = status || 'Draft';

      const project = projectsRepository.createProject({
        id: projectId,
        slug: projectSlug,
        project_number: projectNumber || null,
        title: title.trim(),
        category: category.trim(),
        year: year || new Date().getFullYear().toString(),
        short_description: shortDescription.trim(),
        full_description: fullDescription || shortDescription,
        disciplines: disciplines || category,
        status: initialStatus,
        featured: featured ? 1 : 0,
        technologies: JSON.stringify(Array.isArray(technologies) ? technologies : []),
        deliverables: deliverables ? JSON.stringify(deliverables) : null,
        cover_image: coverImage || null,
        demo_url: demoUrl || null,
        repository_url: repositoryUrl || null,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'PROJECT',
          entityId: projectId,
          details: { title, slug: projectSlug, status: initialStatus },
        },
        req
      );

      res.status(201).json(apiSuccess(project, { message: 'Project created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expectedUpdatedAt = req.headers['if-match'] as string | undefined || req.body.expected_updated_at;

      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      const updates: Partial<ProjectRecord> = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.slug !== undefined) updates.slug = req.body.slug;
      if (req.body.projectNumber !== undefined) updates.project_number = req.body.projectNumber;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.year !== undefined) updates.year = req.body.year;
      if (req.body.shortDescription !== undefined) updates.short_description = req.body.shortDescription;
      if (req.body.fullDescription !== undefined) updates.full_description = req.body.fullDescription;
      if (req.body.disciplines !== undefined) updates.disciplines = req.body.disciplines;
      if (req.body.status !== undefined) updates.status = req.body.status;
      if (req.body.featured !== undefined) updates.featured = req.body.featured ? 1 : 0;
      if (req.body.technologies !== undefined) {
        updates.technologies = JSON.stringify(req.body.technologies);
      }
      if (req.body.deliverables !== undefined) {
        updates.deliverables = JSON.stringify(req.body.deliverables);
      }
      if (req.body.coverImage !== undefined) updates.cover_image = req.body.coverImage;
      if (req.body.demoUrl !== undefined) updates.demo_url = req.body.demoUrl;
      if (req.body.repositoryUrl !== undefined) updates.repository_url = req.body.repositoryUrl;

      const result = projectsRepository.updateProject(id, updates, expectedUpdatedAt);

      if (result.conflict) {
        throw new AppError(
          409,
          'Conflict: This project was updated by another administrator. Please refresh and retry.',
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
          entityType: 'PROJECT',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(result.project, { message: 'Project updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['Draft', 'Published', 'Archived', 'Active', 'Completed'].includes(status)) {
        throw new AppError(400, "Status must be one of: 'Draft', 'Published', 'Archived', 'Active', 'Completed'", undefined, 'INVALID_STATUS');
      }

      // Permissions check: archiving or deleting is restricted to super_admin
      if (status === 'Archived' && req.admin?.role !== 'super_admin') {
        throw new AppError(403, 'Forbidden: Only super_admin can archive content', undefined, 'INSUFFICIENT_PERMISSIONS');
      }

      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      const previousStatus = project.status;
      const updated = projectsRepository.updateStatus(id, status);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: status === 'Published' ? 'PUBLISH' : status === 'Archived' ? 'ARCHIVE' : 'STATUS_CHANGE',
          entityType: 'PROJECT',
          entityId: id,
          details: { previousStatus, newStatus: status },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: `Project status transitioned to '${status}'` }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      projectsRepository.deleteProject(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'PROJECT',
          entityId: id,
          details: { title: project.title, slug: project.slug },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Project deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { memberId, role } = req.body;

      if (!memberId) {
        throw new AppError(400, 'memberId is required', undefined, 'INVALID_MEMBER_ID');
      }

      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      const member = membersRepository.findById(memberId);
      if (!member) {
        throw new AppError(404, `Member with ID '${memberId}' was not found`, undefined, 'MEMBER_NOT_FOUND');
      }

      projectsRepository.addMember(id, memberId, role);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'ADD_MEMBER',
          entityType: 'PROJECT',
          entityId: id,
          details: { memberId, memberName: member.name, role },
        },
        req
      );

      const members = projectsRepository.getMembers(id);
      res.status(200).json(apiSuccess(members, { message: 'Member added to project' }));
    } catch (err) {
      next(err);
    }
  }

  public async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, memberId } = req.params;

      const project = projectsRepository.findById(id);
      if (!project) {
        throw new AppError(404, `Project with ID '${id}' was not found`, undefined, 'PROJECT_NOT_FOUND');
      }

      projectsRepository.removeMember(id, memberId);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'REMOVE_MEMBER',
          entityType: 'PROJECT',
          entityId: id,
          details: { memberId },
        },
        req
      );

      const members = projectsRepository.getMembers(id);
      res.status(200).json(apiSuccess(members, { message: 'Member removed from project' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminProjectsController = new AdminProjectsController();
