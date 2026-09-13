import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess } from '../../utils/apiResponse.ts';

export class AuthController {
  public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await authService.getAdminUsers();
      res.json(
        apiSuccess(
          {
            authenticated: false,
            availableRoles: ['SuperAdmin', 'Editor'],
            seedAdminCount: users.length,
          },
          {
            message: 'Admin authorization foundation initialized. Configure session / JWT provider in the next phase.',
          }
        )
      );
    } catch (err) {
      next(err);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(400, 'Email is required', undefined, 'INVALID_CREDENTIALS');
      }

      const user = await authService.getAdminUserByEmail(email);
      if (!user) {
        throw new AppError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
      }

      res.json(
        apiSuccess(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          {
            message: 'Admin authentication foundation endpoint reached.',
          }
        )
      );
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
