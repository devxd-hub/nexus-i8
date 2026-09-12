import path from 'path';
import fs from 'fs';
import type { IStorageProvider, StoredAssetResult, ReadAssetResult } from './storageProvider.interface.ts';
import { detectMimeFromBuffer } from '../utils/mimeSniffer.ts';

export class LocalStorageProvider implements IStorageProvider {
  private rootDir: string;
  private urlPrefix: string;

  constructor(
    rootDir: string = process.env.MEDIA_UPLOAD_DIR || 'data/uploads',
    urlPrefix: string = '/api/media/file'
  ) {
    this.rootDir = path.resolve(process.cwd(), rootDir);
    this.urlPrefix = urlPrefix.replace(/\/+$/, '');

    if (!fs.existsSync(this.rootDir)) {
      fs.mkdirSync(this.rootDir, { recursive: true });
    }
  }

  /**
   * Safely resolve path and prevent path traversal attacks
   */
  private resolveSafePath(storageKey: string): string {
    // Normalize slashes and strip leading slashes
    const sanitizedKey = storageKey.replace(/\\/g, '/').replace(/^\/+/, '');
    const resolved = path.resolve(this.rootDir, sanitizedKey);

    // Assert that resolved path remains strictly within rootDir
    if (!resolved.startsWith(this.rootDir)) {
      throw new Error(`Security Exception: Path traversal attempt with key '${storageKey}'`);
    }

    return resolved;
  }

  public async save(storageKey: string, buffer: Buffer, mimeType: string): Promise<StoredAssetResult> {
    const filePath = this.resolveSafePath(storageKey);
    const parentDir = path.dirname(filePath);

    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, buffer);

    return {
      storageKey,
      url: this.getUrl(storageKey),
      size: buffer.length,
    };
  }

  public async read(storageKey: string): Promise<ReadAssetResult | null> {
    const filePath = this.resolveSafePath(storageKey);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(filePath);
    const mimeType = detectMimeFromBuffer(buffer) || 'application/octet-stream';

    return {
      buffer,
      mimeType,
      size: buffer.length,
    };
  }

  public async delete(storageKey: string): Promise<boolean> {
    try {
      const filePath = this.resolveSafePath(storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async exists(storageKey: string): Promise<boolean> {
    try {
      const filePath = this.resolveSafePath(storageKey);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  public getUrl(storageKey: string): string {
    const cleanKey = storageKey.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${this.urlPrefix}/${cleanKey}`;
  }
}
