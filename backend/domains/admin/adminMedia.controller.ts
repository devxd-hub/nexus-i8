import { Request, Response, NextFunction } from 'express';
import { mediaAssetsRepository, type MediaAssetRecord } from '../../db/repositories/mediaAssets.repository.ts';
import { mediaService } from '../../services/media.service.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';
import { storageProvider } from '../../storage/index.ts';

export class AdminMediaController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string | undefined;

      const { items, total } = mediaAssetsRepository.findPaginated({ page, limit, search });
      const enriched = items.map((m) => ({
        ...m,
        url: storageProvider.getUrl(m.storage_key),
        metadata: m.metadata ? JSON.parse(m.metadata) : {},
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
      const asset = mediaAssetsRepository.findById(id);
      if (!asset) {
        throw new AppError(404, `Media asset with ID '${id}' was not found`, undefined, 'MEDIA_NOT_FOUND');
      }

      res.status(200).json(
        apiSuccess({
          ...asset,
          url: storageProvider.getUrl(asset.storage_key),
          metadata: asset.metadata ? JSON.parse(asset.metadata) : {},
        })
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Upload binary or base64 media asset
   */
  public async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let buffer: Buffer;
      let filename: string;
      let category: 'projects' | 'events' | 'members' | 'archive' | 'resources' = 'projects';
      let customStorageKey: string | undefined;

      if (req.is('application/json')) {
        const { content, filename: fname, category: cat, storageKey } = req.body;
        if (!content || typeof content !== 'string') {
          throw new AppError(400, 'Content (base64) is required', undefined, 'INVALID_PAYLOAD');
        }
        if (!fname || typeof fname !== 'string') {
          throw new AppError(400, 'Filename is required', undefined, 'INVALID_FILENAME');
        }

        // Handle data URLs like data:image/png;base64,...
        const base64Data = content.includes(';base64,') ? content.split(';base64,')[1] : content;
        buffer = Buffer.from(base64Data, 'base64');
        filename = fname;
        if (cat) category = cat;
        if (storageKey) customStorageKey = storageKey;
      } else if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
        filename = (req.headers['x-filename'] as string) || `upload_${Date.now()}.bin`;
        category = (req.headers['x-category'] as any) || 'projects';
      } else {
        throw new AppError(400, 'Unsupported upload format. Use application/json with base64 content or raw binary payload.', undefined, 'UNSUPPORTED_MEDIA_TYPE');
      }

      const asset = await mediaService.uploadMedia({
        buffer,
        filename,
        category,
        customStorageKey,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPLOAD_MEDIA',
          entityType: 'MEDIA',
          entityId: asset.id,
          details: { filename: asset.filename, storageKey: asset.storage_key, size: asset.file_size },
        },
        req
      );

      res.status(201).json(apiSuccess(asset, { message: 'Media asset uploaded and processed successfully' }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update metadata or filename of existing media asset
   */
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const asset = mediaAssetsRepository.findById(id);
      if (!asset) {
        throw new AppError(404, `Media asset with ID '${id}' was not found`, undefined, 'MEDIA_NOT_FOUND');
      }

      const updates: Partial<MediaAssetRecord> = {};
      if (req.body.filename !== undefined) updates.filename = req.body.filename;
      if (req.body.metadata !== undefined) {
        updates.metadata = typeof req.body.metadata === 'object' ? JSON.stringify(req.body.metadata) : String(req.body.metadata);
      }

      const updated = mediaAssetsRepository.update(id, updates);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE_MEDIA_METADATA',
          entityType: 'MEDIA',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: 'Media metadata updated successfully' }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Replace existing media asset content
   */
  public async replace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { content, filename: fname } = req.body;

      if (!content || typeof content !== 'string') {
        throw new AppError(400, 'Content (base64) is required', undefined, 'INVALID_PAYLOAD');
      }

      const base64Data = content.includes(';base64,') ? content.split(';base64,')[1] : content;
      const buffer = Buffer.from(base64Data, 'base64');

      const updated = await mediaService.replaceMedia(id, buffer, fname);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'REPLACE_MEDIA',
          entityType: 'MEDIA',
          entityId: id,
          details: { filename: updated.filename, size: updated.file_size },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: 'Media asset replaced successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const asset = mediaAssetsRepository.findById(id);
      if (!asset) {
        throw new AppError(404, `Media asset with ID '${id}' was not found`, undefined, 'MEDIA_NOT_FOUND');
      }

      await mediaService.deleteMedia(id);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'DELETE',
          entityType: 'MEDIA',
          entityId: id,
          details: { filename: asset.filename, storageKey: asset.storage_key },
        },
        req
      );

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Media asset deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async getOrphans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orphans = mediaService.getOrphans();
      res.status(200).json(
        apiSuccess(orphans, {
          totalOrphans: orphans.length,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async cleanupOrphans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await mediaService.cleanupOrphans();

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CLEANUP_ORPHANS',
          entityType: 'MEDIA',
          entityId: 'batch',
          details: { purgedCount: result.purgedCount, purgedKeys: result.purgedKeys },
        },
        req
      );

      res.status(200).json(
        apiSuccess(result, {
          message: `Orphan cleanup complete. ${result.purgedCount} asset(s) removed.`,
        })
      );
    } catch (err) {
      next(err);
    }
  }
}

export const adminMediaController = new AdminMediaController();

