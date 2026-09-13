import { LocalStorageProvider } from './localStorageProvider.ts';
import { S3StorageProvider } from './s3StorageProvider.ts';
import type { IStorageProvider } from './storageProvider.interface.ts';

export * from './storageProvider.interface.ts';
export * from './localStorageProvider.ts';
export * from './s3StorageProvider.ts';

function createStorageProvider(): IStorageProvider {
  const driver = process.env.STORAGE_DRIVER || 'local';
  if (driver === 's3' && process.env.S3_BUCKET) {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storageProvider = createStorageProvider();
