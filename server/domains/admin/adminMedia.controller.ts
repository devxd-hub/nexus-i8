import { Request, Response, NextFunction } from 'express';
import { mediaAssetsRepository, type MediaAssetRecord } from '../../db/repositories/mediaAssets.repository.ts';
import { auditService } from '../../services/audit.service.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess, createPaginationMeta } from '../../utils/apiResponse.ts';

export class AdminMediaController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string | undefined;

      const { items, total } = mediaAssetsRepository.findPaginated({ page, limit, search });
      const enriched = items.map((m) => ({
        ...m,
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
          metadata: asset.metadata ? JSON.parse(asset.metadata) : {},
        })
      );
    } catch (err) {
      next(err);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, storageKey, filename, mimeType, fileSize, metadata } = req.body;

      if (!storageKey || typeof storageKey !== 'string') {
        throw new AppError(400, 'storageKey is required', undefined, 'INVALID_STORAGE_KEY');
      }
      if (!filename || typeof filename !== 'string') {
        throw new AppError(400, 'filename is required', undefined, 'INVALID_FILENAME');
      }
      if (!mimeType || typeof mimeType !== 'string') {
        throw new AppError(400, 'mimeType is required', undefined, 'INVALID_MIME_TYPE');
      }

      const existing = mediaAssetsRepository.findByStorageKey(storageKey);
      if (existing) {
        throw new AppError(409, `An asset with storage_key '${storageKey}' already exists`, undefined, 'STORAGE_KEY_EXISTS');
      }

      const assetId = id || `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const asset = mediaAssetsRepository.create({
        id: assetId,
        storage_key: storageKey.trim(),
        filename: filename.trim(),
        mime_type: mimeType.trim(),
        file_size: typeof fileSize === 'number' ? fileSize : 0,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'CREATE',
          entityType: 'MEDIA',
          entityId: assetId,
          details: { filename, storageKey, mimeType },
        },
        req
      );

      res.status(201).json(apiSuccess(asset, { message: 'Media metadata registered successfully' }));
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const asset = mediaAssetsRepository.findById(id);
      if (!asset) {
        throw new AppError(404, `Media asset with ID '${id}' was not found`, undefined, 'MEDIA_NOT_FOUND');
      }

      const updates: Partial<MediaAssetRecord> = {};
      if (req.body.filename !== undefined) updates.filename = req.body.filename;
      if (req.body.mimeType !== undefined) updates.mime_type = req.body.mimeType;
      if (req.body.fileSize !== undefined) updates.file_size = req.body.fileSize;
      if (req.body.metadata !== undefined) updates.metadata = JSON.stringify(req.body.metadata);

      const updated = mediaAssetsRepository.update(id, updates);

      auditService.log(
        {
          adminId: req.admin?.adminId,
          adminName: req.admin?.name,
          adminRole: req.admin?.role,
          action: 'UPDATE',
          entityType: 'MEDIA',
          entityId: id,
          details: { updatedFields: Object.keys(updates) },
        },
        req
      );

      res.status(200).json(apiSuccess(updated, { message: 'Media asset metadata updated successfully' }));
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

      mediaAssetsRepository.deleteAsset(id);

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

      res.status(200).json(apiSuccess({ deleted: true, id }, { message: 'Media metadata deleted successfully' }));
    } catch (err) {
      next(err);
    }
  }
}

export const adminMediaController = new AdminMediaController();
