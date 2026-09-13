import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { storageProvider } from '../storage/index.ts';
import { mediaAssetsRepository, type MediaAssetRecord } from '../db/repositories/mediaAssets.repository.ts';
import { getDatabase } from '../db/connection.ts';
import { validateMediaUpload } from '../utils/mimeSniffer.ts';
import { AppError } from '../middleware/errorHandler.ts';

export interface MediaUploadOptions {
  buffer: Buffer;
  filename: string;
  category?: 'projects' | 'events' | 'members' | 'archive' | 'resources';
  entityId?: string;
  customStorageKey?: string;
}

export interface MediaMetadataJson {
  checksum: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  format?: string;
  category?: string;
  originalFilename: string;
  variants?: {
    thumb?: {
      key: string;
      url: string;
      width: number;
    };
  };
}

export interface EnrichedMediaAsset extends MediaAssetRecord {
  url: string;
  parsedMetadata: MediaMetadataJson;
}

export class MediaService {
  /**
   * Compute SHA-256 checksum of buffer
   */
  public computeChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Upload and process a new media asset
   */
  public async uploadMedia(options: MediaUploadOptions): Promise<EnrichedMediaAsset> {
    const category = options.category || 'projects';
    const validation = validateMediaUpload(options.buffer, options.filename, category);

    if (!validation.valid || !validation.detectedMime) {
      throw new AppError(
        validation.code === 'FILE_TOO_LARGE' ? 413 : 400,
        validation.error || 'Invalid file payload',
        undefined,
        validation.code || 'INVALID_FILE'
      );
    }

    const bufferToSave = validation.sanitizedBuffer || options.buffer;
    const detectedMime = validation.detectedMime;
    const checksum = this.computeChecksum(bufferToSave);

    // Generate safe collision-resistant storage key
    const ext = path.extname(options.filename).toLowerCase();
    const cleanBase = path
      .basename(options.filename, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40) || 'asset';

    const timestamp = Date.now();
    const rand = crypto.randomBytes(4).toString('hex');
    const storageKey =
      options.customStorageKey ||
      `${category}/${new Date().getFullYear()}/${cleanBase}_${timestamp}_${rand}${ext}`;

    // Extract image metadata and generate thumbnail if applicable
    const metaJson: MediaMetadataJson = {
      checksum,
      category,
      originalFilename: options.filename,
    };

    if (detectedMime.startsWith('image/') && detectedMime !== 'image/svg+xml') {
      try {
        const image = sharp(bufferToSave);
        const imgMeta = await image.metadata();
        if (imgMeta.width && imgMeta.height) {
          metaJson.width = imgMeta.width;
          metaJson.height = imgMeta.height;
          metaJson.aspectRatio = parseFloat((imgMeta.width / imgMeta.height).toFixed(3));
          metaJson.format = imgMeta.format;

          // Generate lightweight WebP thumbnail variant for images > 400px
          if (imgMeta.width > 400) {
            const thumbBuffer = await sharp(bufferToSave)
              .resize({ width: 400, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            const thumbKey = storageKey.replace(/\.[^.]+$/, '-thumb.webp');
            await storageProvider.save(thumbKey, thumbBuffer, 'image/webp');

            metaJson.variants = {
              thumb: {
                key: thumbKey,
                url: storageProvider.getUrl(thumbKey),
                width: 400,
              },
            };
          }
        }
      } catch (err) {
        // If image parser fails on non-standard buffer, proceed without pixel dimensions
        console.warn(`[MediaService] Note: Sharp metadata extraction bypassed for ${options.filename}`);
      }
    }

    // Save main asset to storage provider
    await storageProvider.save(storageKey, bufferToSave, detectedMime);

    // Save record to database
    const assetId = `med-${Date.now()}-${rand}`;
    const record = mediaAssetsRepository.create({
      id: assetId,
      storage_key: storageKey,
      filename: options.filename,
      mime_type: detectedMime,
      file_size: bufferToSave.length,
      metadata: JSON.stringify(metaJson),
    });

    return {
      ...record,
      url: storageProvider.getUrl(storageKey),
      parsedMetadata: metaJson,
    };
  }

  /**
   * Replace file content of an existing media asset
   */
  public async replaceMedia(mediaId: string, newBuffer: Buffer, newFilename?: string): Promise<EnrichedMediaAsset> {
    const existing = mediaAssetsRepository.findById(mediaId);
    if (!existing) {
      throw new AppError(404, `Media asset with ID '${mediaId}' was not found`, undefined, 'MEDIA_NOT_FOUND');
    }

    const filename = newFilename || existing.filename;
    let category = 'projects';
    if (existing.metadata) {
      try {
        const parsed = JSON.parse(existing.metadata);
        if (parsed.category) category = parsed.category;
      } catch {}
    }

    const validation = validateMediaUpload(newBuffer, filename, category);
    if (!validation.valid || !validation.detectedMime) {
      throw new AppError(
        validation.code === 'FILE_TOO_LARGE' ? 413 : 400,
        validation.error || 'Invalid file payload',
        undefined,
        validation.code || 'INVALID_FILE'
      );
    }

    const bufferToSave = validation.sanitizedBuffer || newBuffer;
    const detectedMime = validation.detectedMime;
    const checksum = this.computeChecksum(bufferToSave);

    const metaJson: MediaMetadataJson = {
      checksum,
      category,
      originalFilename: filename,
    };

    if (detectedMime.startsWith('image/') && detectedMime !== 'image/svg+xml') {
      try {
        const image = sharp(bufferToSave);
        const imgMeta = await image.metadata();
        if (imgMeta.width && imgMeta.height) {
          metaJson.width = imgMeta.width;
          metaJson.height = imgMeta.height;
          metaJson.aspectRatio = parseFloat((imgMeta.width / imgMeta.height).toFixed(3));
          metaJson.format = imgMeta.format;

          if (imgMeta.width > 400) {
            const thumbBuffer = await sharp(bufferToSave)
              .resize({ width: 400, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            const thumbKey = existing.storage_key.replace(/\.[^.]+$/, '-thumb.webp');
            await storageProvider.save(thumbKey, thumbBuffer, 'image/webp');

            metaJson.variants = {
              thumb: {
                key: thumbKey,
                url: storageProvider.getUrl(thumbKey),
                width: 400,
              },
            };
          }
        }
      } catch {}
    }

    // Overwrite in storage
    await storageProvider.save(existing.storage_key, bufferToSave, detectedMime);

    // Update database record
    const updated = mediaAssetsRepository.update(mediaId, {
      filename,
      mime_type: detectedMime,
      file_size: bufferToSave.length,
      metadata: JSON.stringify(metaJson),
    });

    return {
      ...updated!,
      url: storageProvider.getUrl(existing.storage_key),
      parsedMetadata: metaJson,
    };
  }

  /**
   * Delete asset from storage and database
   */
  public async deleteMedia(mediaId: string): Promise<boolean> {
    const asset = mediaAssetsRepository.findById(mediaId);
    if (!asset) return false;

    // Delete thumbnail variant if present
    if (asset.metadata) {
      try {
        const meta = JSON.parse(asset.metadata);
        if (meta.variants?.thumb?.key) {
          await storageProvider.delete(meta.variants.thumb.key);
        }
      } catch {}
    }

    // Delete main file
    await storageProvider.delete(asset.storage_key);

    // Delete DB record
    return mediaAssetsRepository.deleteAsset(mediaId);
  }

  /**
   * Find unreferenced media assets across all showcase tables
   */
  public getOrphans(): MediaAssetRecord[] {
    const db = getDatabase();
    const allAssets = mediaAssetsRepository.findAll();

    // Query distinct references from projects, events, members, archive, resources
    const projectRefs = (
      db.prepare('SELECT cover_image, demo_url, repository_url FROM projects').all() as any[]
    ).flatMap((r) => [r.cover_image, r.demo_url, r.repository_url].filter(Boolean));

    const eventRefs = (
      db.prepare('SELECT cover_image FROM events').all() as any[]
    ).map((r) => r.cover_image).filter(Boolean);

    const memberRefs = (
      db.prepare('SELECT photo_url FROM members').all() as any[]
    ).map((r) => r.photo_url).filter(Boolean);

    const archiveRefs = (
      db.prepare('SELECT media_reference FROM archive_items').all() as any[]
    ).map((r) => r.media_reference).filter(Boolean);

    const resourceRefs = (
      db.prepare('SELECT url FROM resources').all() as any[]
    ).map((r) => r.url).filter(Boolean);

    const allReferences = new Set([
      ...projectRefs,
      ...eventRefs,
      ...memberRefs,
      ...archiveRefs,
      ...resourceRefs,
    ]);

    // An asset is an orphan if neither its storage_key nor its URL is referenced anywhere
    return allAssets.filter((asset) => {
      const url = storageProvider.getUrl(asset.storage_key);
      const isReferenced =
        allReferences.has(asset.storage_key) ||
        allReferences.has(url) ||
        allReferences.has(asset.id);
      return !isReferenced;
    });
  }

  /**
   * Batch clean up unreferenced media assets
   */
  public async cleanupOrphans(): Promise<{ purgedCount: number; purgedKeys: string[] }> {
    const orphans = this.getOrphans();
    const purgedKeys: string[] = [];

    for (const orphan of orphans) {
      const deleted = await this.deleteMedia(orphan.id);
      if (deleted) {
        purgedKeys.push(orphan.storage_key);
      }
    }

    return {
      purgedCount: purgedKeys.length,
      purgedKeys,
    };
  }
}

export const mediaService = new MediaService();
