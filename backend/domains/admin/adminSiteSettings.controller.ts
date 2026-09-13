import { Request, Response, NextFunction } from 'express';
import { siteSettingsRepository } from '../../db/repositories/siteSettings.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess } from '../../utils/apiResponse.ts';

export class AdminSiteSettingsController {
  public async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = siteSettingsRepository.getAll();
      const settingsMap: Record<string, unknown> = {};

      for (const record of records) {
        try {
          settingsMap[record.key] = JSON.parse(record.value);
        } catch {
          settingsMap[record.key] = record.value;
        }
      }

      res.status(200).json(
        apiSuccess({
          records,
          settings: settingsMap,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') {
        throw new AppError(400, 'Settings object is required', undefined, 'INVALID_SETTINGS_PAYLOAD');
      }

      const updatedKeys: string[] = [];
      for (const [key, val] of Object.entries(settings)) {
        const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
        siteSettingsRepository.set(key, valStr);
        updatedKeys.push(key);
      }

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE',
          entityType: 'SITE_SETTINGS',
          entityId: 'global',
          details: { updatedKeys },
        },
        req
      );

      res.status(200).json(
        apiSuccess(
          { updatedKeys },
          {
            message: `${updatedKeys.length} setting(s) updated successfully`,
          }
        )
      );
    } catch (err) {
      next(err);
    }
  }
}

export const adminSiteSettingsController = new AdminSiteSettingsController();
