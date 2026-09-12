import { getDatabase } from './connection.ts';
import { MIGRATIONS_TABLE_SQL, INITIAL_SCHEMA_SQL, ADMIN_AND_AUDIT_SCHEMA_SQL } from './schema.ts';

export interface Migration {
  id: string;
  name: string;
  up: (db: ReturnType<typeof getDatabase>) => void;
}

export const migrations: Migration[] = [
  {
    id: '001_initial_nexus_schema',
    name: 'Initial NEXUS core showcase schema',
    up: (db) => {
      db.exec(INITIAL_SCHEMA_SQL);
    },
  },
  {
    id: '002_admin_and_audit',
    name: 'Admin authentication, RBAC, sessions, and audit logging schema',
    up: (db) => {
      db.exec(ADMIN_AND_AUDIT_SCHEMA_SQL);

      // Add status column to archive_items if not present
      const columns = db.prepare('PRAGMA table_info(archive_items);').all() as Array<{ name: string }>;
      const hasStatus = columns.some((c) => c.name === 'status');
      if (!hasStatus) {
        db.exec("ALTER TABLE archive_items ADD COLUMN status TEXT NOT NULL DEFAULT 'published';");
        db.exec('CREATE INDEX IF NOT EXISTS idx_archive_status ON archive_items(status);');
      }
    },
  },
];

export function runMigrations(customDb?: ReturnType<typeof getDatabase>): { applied: string[]; total: number } {
  const db = customDb || getDatabase();

  // 1. Ensure migrations table exists
  db.exec(MIGRATIONS_TABLE_SQL);

  // 2. Fetch applied migrations
  const stmt = db.prepare('SELECT id FROM _migrations');
  const rows = stmt.all() as Array<{ id: string }>;
  const appliedSet = new Set(rows.map((r) => r.id));

  const newlyApplied: string[] = [];

  // 3. Execute unapplied migrations
  for (const migration of migrations) {
    if (!appliedSet.has(migration.id)) {
      console.log(`[Migration] Applying ${migration.id}: ${migration.name}...`);
      
      // Execute within transaction
      db.exec('BEGIN TRANSACTION;');
      try {
        migration.up(db);
        const recordStmt = db.prepare('INSERT INTO _migrations (id, name, executed_at) VALUES (?, ?, ?)');
        recordStmt.run(migration.id, migration.name, new Date().toISOString());
        db.exec('COMMIT;');
        newlyApplied.push(migration.id);
        console.log(`[Migration] ✓ Applied ${migration.id}`);
      } catch (err) {
        db.exec('ROLLBACK;');
        console.error(`[Migration] ✗ Failed ${migration.id}:`, err);
        throw err;
      }
    }
  }

  return {
    applied: newlyApplied,
    total: migrations.length,
  };
}

// Allow direct execution via CLI (node / tsx)
if (process.argv[1] && process.argv[1].includes('migrate')) {
  try {
    const result = runMigrations();
    console.log(`[Migration] Complete. ${result.applied.length} new migrations applied (${result.total} total).`);
  } catch (err) {
    console.error('[Migration] Failed:', err);
    process.exit(1);
  }
}
