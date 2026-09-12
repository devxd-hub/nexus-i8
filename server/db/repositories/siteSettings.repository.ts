import { getDatabase } from '../connection.ts';

export interface SiteSettingRecord {
  key: string;
  value: string; // JSON string or plain text
  description: string | null;
  updated_at: string;
}

export class SiteSettingsRepository {
  private get db() {
    return getDatabase();
  }

  public get(key: string): SiteSettingRecord | null {
    const stmt = this.db.prepare('SELECT * FROM site_settings WHERE key = ?');
    const row = stmt.get(key);
    return (row as unknown as SiteSettingRecord) || null;
  }

  public getAll(): SiteSettingRecord[] {
    const stmt = this.db.prepare('SELECT * FROM site_settings ORDER BY key ASC');
    return stmt.all() as unknown as SiteSettingRecord[];
  }

  public set(key: string, value: string, description?: string): SiteSettingRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO site_settings (key, value, description, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        description = coalesce(excluded.description, site_settings.description),
        updated_at = excluded.updated_at
    `);
    stmt.run(key, value, description || null, now);

    return {
      key,
      value,
      description: description || null,
      updated_at: now,
    };
  }

  public delete(key: string): boolean {
    const stmt = this.db.prepare('DELETE FROM site_settings WHERE key = ?');
    const result = stmt.run(key);
    return Number(result.changes) > 0;
  }
}

export const siteSettingsRepository = new SiteSettingsRepository();
