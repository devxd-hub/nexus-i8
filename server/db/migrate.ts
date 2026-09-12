import { getDatabase } from './connection.ts';
import { MIGRATIONS_TABLE_SQL, INITIAL_SCHEMA_SQL } from './schema.ts';

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
