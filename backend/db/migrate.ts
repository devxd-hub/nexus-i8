import { getDatabase } from './connection.ts';
import {
  MIGRATIONS_TABLE_SQL,
  INITIAL_SCHEMA_SQL,
  ADMIN_AND_AUDIT_SCHEMA_SQL,
  SUBMISSIONS_AND_REGISTRATIONS_SCHEMA_SQL,
  EID_MEMBER_SCHEMA_SQL,
} from './schema.ts';

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
  {
    id: '003_submissions_and_registrations',
    name: 'Recruitment submissions, event registrations, and event capacity schema',
    up: (db) => {
      db.exec(SUBMISSIONS_AND_REGISTRATIONS_SCHEMA_SQL);

      // Add capacity and registration_status columns to events if not present
      const eventColumns = db.prepare('PRAGMA table_info(events);').all() as Array<{ name: string }>;
      const hasCapacity = eventColumns.some((c) => c.name === 'capacity');
      if (!hasCapacity) {
        db.exec('ALTER TABLE events ADD COLUMN capacity INTEGER DEFAULT NULL;');
      }
      const hasRegStatus = eventColumns.some((c) => c.name === 'registration_status');
      if (!hasRegStatus) {
        db.exec("ALTER TABLE events ADD COLUMN registration_status TEXT NOT NULL DEFAULT 'OPEN';");
        db.exec('CREATE INDEX IF NOT EXISTS idx_events_reg_status ON events(registration_status);');
      }
    },
  },
  {
    id: '004_eid_member_foundation',
    name: 'NEXUS E-ID Card member foundation with unique public identifiers',
    up: (db) => {
      const memberColumns = db.prepare('PRAGMA table_info(members);').all() as Array<{ name: string }>;
      const existingColNames = new Set(memberColumns.map((c) => c.name));

      if (!existingColNames.has('unique_id')) {
        db.exec('ALTER TABLE members ADD COLUMN unique_id TEXT;');
      }
      if (!existingColNames.has('display_name')) {
        db.exec('ALTER TABLE members ADD COLUMN display_name TEXT;');
      }
      if (!existingColNames.has('department')) {
        db.exec("ALTER TABLE members ADD COLUMN department TEXT DEFAULT 'ENGINEERING';");
      }
      if (!existingColNames.has('clearance_level')) {
        db.exec("ALTER TABLE members ADD COLUMN clearance_level TEXT DEFAULT 'LVL-03 // SPEC';");
      }
      if (!existingColNames.has('special_word')) {
        db.exec("ALTER TABLE members ADD COLUMN special_word TEXT DEFAULT 'VISIONARY';");
      }
      if (!existingColNames.has('quote')) {
        db.exec('ALTER TABLE members ADD COLUMN quote TEXT;');
      }
      if (!existingColNames.has('node_location')) {
        db.exec("ALTER TABLE members ADD COLUMN node_location TEXT DEFAULT 'SOA LAB 204 // BHUBANESWAR';");
      }
      if (!existingColNames.has('frequency')) {
        db.exec("ALTER TABLE members ADD COLUMN frequency TEXT DEFAULT '108.40 MHz';");
      }
      if (!existingColNames.has('security_zone')) {
        db.exec("ALTER TABLE members ADD COLUMN security_zone TEXT DEFAULT 'SEC // ALPHA';");
      }
      if (!existingColNames.has('badge_issue')) {
        db.exec("ALTER TABLE members ADD COLUMN badge_issue TEXT DEFAULT '2026.Q1';");
      }
      if (!existingColNames.has('skills')) {
        db.exec("ALTER TABLE members ADD COLUMN skills TEXT DEFAULT '[]';");
      }
      if (!existingColNames.has('current_focus')) {
        db.exec('ALTER TABLE members ADD COLUMN current_focus TEXT;');
      }
      if (!existingColNames.has('fun_fact')) {
        db.exec('ALTER TABLE members ADD COLUMN fun_fact TEXT;');
      }

      db.exec(EID_MEMBER_SCHEMA_SQL);
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
