import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { storageProvider } from '../../storage/index.ts';
import { mediaAssetsRepository } from '../../db/repositories/mediaAssets.repository.ts';
import { AppError } from '../../middleware/errorHandler.ts';
import { apiSuccess } from '../../utils/apiResponse.ts';

export class MediaController {
  /**
   * Public file delivery with ETag caching and security headers
   */
  public async serveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract key from wildcard parameter
      const rawKey = req.params[0] || (req.params as any).storageKey;
      if (!rawKey) {
        throw new AppError(400, 'Storage key parameter is required', undefined, 'INVALID_STORAGE_KEY');
      }

      // Path traversal check
      const decodedKey = decodeURIComponent(rawKey);
      if (rawKey.includes('..') || decodedKey.includes('..') || rawKey.includes('\0') || decodedKey.includes('\0')) {
        throw new AppError(403, 'Forbidden: Invalid storage key structure', undefined, 'PATH_TRAVERSAL_REJECTED');
      }

      const storageKey = decodedKey.replace(/^\/+/, '');
      const asset = await storageProvider.read(storageKey);

      if (!asset) {
        throw new AppError(404, `Media asset with key '${storageKey}' was not found`, undefined, 'MEDIA_NOT_FOUND');
      }

      // Compute weak ETag from checksum
      const etag = `"${crypto.createHash('md5').update(asset.buffer).digest('hex')}"`;

      // Check If-None-Match header for HTTP 304 cache validation
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }

      res.setHeader('Content-Type', asset.mimeType);
      res.setHeader('Content-Length', asset.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', etag);

      // Defense-in-depth CSP for SVGs
      if (asset.mimeType === 'image/svg+xml') {
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
      }

      res.status(200).end(asset.buffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Public metadata lookup by ID
   */
  public async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          metadata: asset.metadata ? JSON.parse(asset.metadata) : null,
        })
      );
    } catch (err) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();
