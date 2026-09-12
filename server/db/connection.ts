import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

let instance: DatabaseSync | null = null;

export function getDatabase(dbPath?: string): DatabaseSync {
  if (instance) {
    return instance;
  }

  const resolvedPath = dbPath || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/nexus.db');
  
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  instance = new DatabaseSync(resolvedPath);

  // Enable foreign key constraints and high-performance WAL journaling
  instance.exec('PRAGMA foreign_keys = ON;');
  if (resolvedPath !== ':memory:') {
    instance.exec('PRAGMA journal_mode = WAL;');
  }
  instance.exec('PRAGMA synchronous = NORMAL;');

  return instance;
}

export function closeDatabase(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}

/**
 * Execute a multi-step database operation inside an ACID transaction with automatic rollback on error.
 */
export function runTransaction<T>(fn: (db: DatabaseSync) => T, dbPath?: string): T {
  const db = getDatabase(dbPath);
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

