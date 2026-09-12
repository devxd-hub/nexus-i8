import type { IStorageProvider, StoredAssetResult, ReadAssetResult } from './storageProvider.interface.ts';
import { LocalStorageProvider } from './localStorageProvider.ts';

export class S3StorageProvider implements IStorageProvider {
  private bucket: string;
  private endpoint: string;
  private fallback: LocalStorageProvider;
  private isConfigured: boolean;

  constructor() {
    this.bucket = process.env.S3_BUCKET || '';
    this.endpoint = process.env.S3_ENDPOINT || 'https://s3.amazonaws.com';
    this.fallback = new LocalStorageProvider();
    this.isConfigured = Boolean(
      process.env.S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  }

  public async save(storageKey: string, buffer: Buffer, mimeType: string): Promise<StoredAssetResult> {
    if (!this.isConfigured) {
      return this.fallback.save(storageKey, buffer, mimeType);
    }
    // Future expansion: AWS S3 / Cloudflare R2 client
    return this.fallback.save(storageKey, buffer, mimeType);
  }

  public async read(storageKey: string): Promise<ReadAssetResult | null> {
    if (!this.isConfigured) {
      return this.fallback.read(storageKey);
    }
    return this.fallback.read(storageKey);
  }

  public async delete(storageKey: string): Promise<boolean> {
    if (!this.isConfigured) {
      return this.fallback.delete(storageKey);
    }
    return this.fallback.delete(storageKey);
  }

  public async exists(storageKey: string): Promise<boolean> {
    if (!this.isConfigured) {
      return this.fallback.exists(storageKey);
    }
    return this.fallback.exists(storageKey);
  }

  public getUrl(storageKey: string): string {
    if (!this.isConfigured) {
      return this.fallback.getUrl(storageKey);
    }
    const cleanKey = storageKey.replace(/^\/+/, '');
    return `${this.endpoint}/${this.bucket}/${cleanKey}`;
  }
}
