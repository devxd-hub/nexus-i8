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

  public findPaginated(options: { page?: number; limit?: number; search?: string } = {}): {
    items: MediaAssetRecord[];
    total: number;
  } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];

    if (options.search) {
      whereClause += ' AND (LOWER(filename) LIKE LOWER(?) OR LOWER(storage_key) LIKE LOWER(?) OR LOWER(mime_type) LIKE LOWER(?))';
      const q = `%${options.search}%`;
      params.push(q, q, q);
    }

    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM media_assets${whereClause}`);
    const countRow = countStmt.get(...params) as { count: number };
    const total = countRow.count;

    const query = `
      SELECT * FROM media_assets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = this.db.prepare(query).all(...params, limit, offset) as unknown as MediaAssetRecord[];
    return { items, total };
  }

  public update(id: string, data: Partial<MediaAssetRecord>): MediaAssetRecord | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: MediaAssetRecord = {
      ...existing,
      ...data,
      id,
    };

    const stmt = this.db.prepare(`
      UPDATE media_assets SET
        filename = ?, mime_type = ?, file_size = ?, metadata = ?
      WHERE id = ?
    `);

    stmt.run(updated.filename, updated.mime_type, updated.file_size, updated.metadata, id);
    return updated;
  }

  public deleteAsset(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM media_assets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const mediaAssetsRepository = new MediaAssetsRepository();
