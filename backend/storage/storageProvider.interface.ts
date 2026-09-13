export interface StoredAssetResult {
  storageKey: string;
  url: string;
  size: number;
}

export interface ReadAssetResult {
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  /**
   * Save a file buffer to storage under the given storage key.
   */
  save(storageKey: string, buffer: Buffer, mimeType: string): Promise<StoredAssetResult>;

  /**
   * Read a file buffer and metadata from storage.
   */
  read(storageKey: string): Promise<ReadAssetResult | null>;

  /**
   * Delete a file from storage.
   */
  delete(storageKey: string): Promise<boolean>;

  /**
   * Check whether a file exists in storage.
   */
  exists(storageKey: string): Promise<boolean>;

  /**
   * Get the public URL path for accessing the asset.
   */
  getUrl(storageKey: string): string;
}
