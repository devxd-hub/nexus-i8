import { BaseRepository } from './base.repository.ts';

export interface MediaAssetRecord {
  id: string;
  storage_key: string;
  filename: string;
  mime_type: string;
  file_size: number;
  metadata: string | null; // JSON string
  created_at: string;
}

export class MediaAssetsRepository extends BaseRepository<MediaAssetRecord> {
  constructor() {
    super('media_assets');
  }

  public findAll(): MediaAssetRecord[] {
    const stmt = this.db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC');
    return stmt.all() as unknown as MediaAssetRecord[];
  }

  public findById(id: string): MediaAssetRecord | null {
    const stmt = this.db.prepare('SELECT * FROM media_assets WHERE id = ?');
    const row = stmt.get(id);
    return (row as unknown as MediaAssetRecord) || null;
  }

  public findByStorageKey(storageKey: string): MediaAssetRecord | null {
    const stmt = this.db.prepare('SELECT * FROM media_assets WHERE storage_key = ?');
    const row = stmt.get(storageKey);
    return (row as unknown as MediaAssetRecord) || null;
  }

  public create(data: Omit<MediaAssetRecord, 'created_at'>): MediaAssetRecord {
    const now = new Date().toISOString();
    const record: MediaAssetRecord = {
      ...data,
      created_at: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO media_assets (
        id, storage_key, filename, mime_type, file_size, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.storage_key,
      record.filename,
      record.mime_type,
      record.file_size,
      record.metadata,
      record.created_at
    );

    return record;
  }
}

export const mediaAssetsRepository = new MediaAssetsRepository();
