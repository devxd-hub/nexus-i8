import { Request, Response, NextFunction } from 'express';
import { adminUsersRepository, type AdminRole, type AdminStatus } from '../../db/repositories/adminUsers.repository.ts';
import { adminSessionsRepository } from '../../db/repositories/adminSessions.repository.ts';
import { hashPassword } from '../../utils/crypto.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess } from '../../utils/apiResponse.ts';

export class AdminUsersController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = adminUsersRepository.listAllSafe();
      res.status(200).json(
        apiSuccess(users, {
          total: users.length,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = adminUsersRepository.findSafeById(id);
      if (!user) {
        throw new AppError(404, `Admin user with ID '${id}' was not found`, undefined, 'USER_NOT_FOUND');
      }
      res.status(200).json(apiSuccess(user));
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, password, role } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new AppError(400, 'Name is required', undefined, 'INVALID_NAME');
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new AppError(400, 'Valid email is required', undefined, 'INVALID_EMAIL');
      }
      if (!password || typeof password !== 'string' || password.length < 8) {
        throw new AppError(400, 'Password must be at least 8 characters long', undefined, 'WEAK_PASSWORD');
      }
      if (role !== 'super_admin' && role !== 'content_admin') {
        throw new AppError(400, "Role must be 'super_admin' or 'content_admin'", undefined, 'INVALID_ROLE');
      }

      const existing = adminUsersRepository.findByEmail(email);
      if (existing) {
        throw new AppError(409, 'An admin account with this email already exists', undefined, 'EMAIL_EXISTS');
      }

      const { hash, salt } = await hashPassword(password);
      const id = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      adminUsersRepository.create({
        id,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password_hash: hash,
        salt,
        role,
        status: 'active',
        failed_attempts: 0,
        locked_until: null,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'ADMIN_USER',
          entityId: id,
          details: { email, name, role },
        },
        req
      );

      const safeUser = adminUsersRepository.findSafeById(id);
      res.status(201).json(apiSuccess(safeUser, { message: 'Admin account created successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, role, status, password } = req.body;

      const user = adminUsersRepository.findById(id);
      if (!user) {
        throw new AppError(404, `Admin user with ID '${id}' was not found`, undefined, 'USER_NOT_FOUND');
      }

      const updates: {
        name?: string;
        email?: string;
        role?: AdminRole;
        status?: AdminStatus;
        password_hash?: string;
        salt?: string;
      } = {};

      if (name !== undefined) updates.name = String(name).trim();
      if (email !== undefined) updates.email = String(email).trim();
      if (role !== undefined) {
        if (role !== 'super_admin' && role !== 'content_admin') {
          throw new AppError(400, "Role must be 'super_admin' or 'content_admin'", undefined, 'INVALID_ROLE');
        }
        updates.role = role;
      }
      if (status !== undefined) {
        if (!['active', 'inactive', 'suspended'].includes(status)) {
          throw new AppError(400, "Status must be 'active', 'inactive', or 'suspended'", undefined, 'INVALID_STATUS');
        }
        updates.status = status;
        if (status !== 'active') {
          // Invalidate active sessions if account deactivated
          adminSessionsRepository.deleteByAdminId(id);
        }
      }
      if (password !== undefined) {
        if (typeof password !== 'string' || password.length < 8) {
          throw new AppError(400, 'Password must be at least 8 characters long', undefined, 'WEAK_PASSWORD');
        }
        const { hash, salt } = await hashPassword(password);
        updates.password_hash = hash;
        updates.salt = salt;
      }

      const updated = adminUsersRepository.updateAdmin(id, updates);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE',
          entityType: 'ADMIN_USER',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: 'Admin account updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (req.admin?.adminId === id) {
        throw new AppError(400, 'Cannot delete your own administrative account', undefined, 'CANNOT_DELETE_SELF');
      }

      const user = adminUsersRepository.findById(id);
      if (!user) {
        throw new AppError(404, `Admin user with ID '${id}' was not found`, undefined, 'USER_NOT_FOUND');
      }

      adminSessionsRepository.deleteByAdminId(id);
      adminUsersRepository.deleteById(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'ADMIN_USER',
          entityId: id,
          details: { email: user.email, name: user.name, role: user.role },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Admin account deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminUsersController = new AdminUsersController();
