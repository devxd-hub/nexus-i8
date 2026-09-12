import { Request, Response, NextFunction } from 'express';
import { siteConfigService } from './siteConfig.service.ts';
import { apiSuccess } from '../../utils/apiResponse.ts';

export class SiteConfigController {
  public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await siteConfigService.getConfig();
      res.json(apiSuccess(config));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await siteConfigService.updateConfig(req.body);
      res.json(apiSuccess(updated));
    } catch (err) {
      next(err);
    }
  }
}

export const siteConfigController = new SiteConfigController();
