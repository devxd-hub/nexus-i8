import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../connection.ts';

export abstract class BaseRepository<T extends { id: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected get db(): DatabaseSync {
    return getDatabase();
  }

  public count(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    const row = stmt.get() as { count: number } | undefined;
    return row ? Number(row.count) : 0;
  }

  public findById(id: string): T | null {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`);
    const row = stmt.get(id);
    return (row as unknown as T) || null;
  }

  public deleteById(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }
}
