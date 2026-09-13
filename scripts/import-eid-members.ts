import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, runTransaction } from '../backend/db/connection.ts';
import { runMigrations } from '../backend/db/migrate.ts';
import { membersRepository, MemberRecord } from '../backend/db/repositories/members.repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canonical location for Eid-card data within nexus-i8-
const DEFAULT_MEMBERS_JSON_PATH = path.resolve(__dirname, '../Eid-card/data/members.json');

export interface RawEidMember {
  uniqueId?: string;
  id?: string;
  slug?: string;
  name?: string;
  displayName?: string;
  email?: string | null;
  role?: string;
  department?: string;
  domain?: string[] | string;
  image?: string | null;
  photo?: string | null;
  bio?: string | null;
  status?: string;
  clearanceLevel?: string;
  specialWord?: string;
  quote?: string;
  nodeLocation?: string;
  frequency?: string;
  securityZone?: string;
  badgeIssue?: string;
  skills?: string[];
  socials?: Record<string, string> | null;
}

export interface ValidationIssue {
  index: number;
  uniqueId?: string;
  slug?: string;
  name?: string;
  reason: string;
}

export interface ImportResult {
  totalRecords: number;
  created: number;
  updated: number;
  skipped: number;
  rejected: ValidationIssue[];
}

export function validateAndImportEidMembers(
  filePath: string = DEFAULT_MEMBERS_JSON_PATH,
  customDb?: ReturnType<typeof getDatabase>
): ImportResult {
  const db = customDb || getDatabase();

  // 1. Ensure migrations are applied
  runMigrations(db);

  if (!fs.existsSync(filePath)) {
    throw new Error(`[E-ID Import] Seed file not found at: ${filePath}`);
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  let records: RawEidMember[];
  try {
    records = JSON.parse(rawContent);
  } catch (err) {
    throw new Error(`[E-ID Import] Invalid JSON syntax in ${filePath}: ${err}`);
  }

  if (!Array.isArray(records)) {
    throw new Error(`[E-ID Import] Expected JSON array of members in ${filePath}`);
  }

  const result: ImportResult = {
    totalRecords: records.length,
    created: 0,
    updated: 0,
    skipped: 0,
    rejected: [],
  };

  const seenUniqueIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // Fetch existing members map from database
  const allExisting = membersRepository.findAll({ status: 'all' });
  const existingBySlug = new Map<string, MemberRecord>();
  const existingByUniqueId = new Map<string, MemberRecord>();

  for (const m of allExisting) {
    if (m.public_id) existingBySlug.set(m.public_id.toLowerCase(), m);
    if (m.unique_id) existingByUniqueId.set(m.unique_id.toUpperCase(), m);
  }

  // Pre-validate every record
  const validatedRecords: {
    record: RawEidMember;
    uniqueId: string;
    slug: string;
    name: string;
    existingMember: MemberRecord | null;
  }[] = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const index = i + 1;

    // 1. Validate uniqueId
    const uniqueId = (r.uniqueId || r.id || '').trim().toUpperCase();
    if (!uniqueId) {
      result.rejected.push({ index, name: r.name, reason: 'Missing uniqueId' });
      continue;
    }
    if (!/^NX-\d{3,}$/i.test(uniqueId)) {
      result.rejected.push({
        index,
        uniqueId,
        name: r.name,
        reason: `Invalid uniqueId format "${uniqueId}". Expected format: NX-001, NX-026, etc.`,
      });
      continue;
    }
    if (seenUniqueIds.has(uniqueId)) {
      result.rejected.push({
        index,
        uniqueId,
        name: r.name,
        reason: `Duplicate uniqueId "${uniqueId}" found within seed file`,
      });
      continue;
    }
    seenUniqueIds.add(uniqueId);

    // 2. Validate slug
    const slug = (r.slug || '').trim().toLowerCase();
    if (!slug) {
      result.rejected.push({ index, uniqueId, name: r.name, reason: 'Missing slug' });
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      result.rejected.push({
        index,
        uniqueId,
        slug,
        name: r.name,
        reason: `Invalid slug format "${slug}". Must be lowercase alphanumeric with single hyphens.`,
      });
      continue;
    }
    if (seenSlugs.has(slug)) {
      result.rejected.push({
        index,
        uniqueId,
        slug,
        name: r.name,
        reason: `Conflicting slug "${slug}" found multiple times in seed file`,
      });
      continue;
    }
    seenSlugs.add(slug);

    // 3. Validate name
    const name = (r.name || '').trim();
    if (!name) {
      result.rejected.push({ index, uniqueId, slug, reason: 'Missing name' });
      continue;
    }

    // 4. Validate email format if provided
    if (r.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(r.email)) {
        result.rejected.push({
          index,
          uniqueId,
          slug,
          name,
          reason: `Invalid email address format: "${r.email}"`,
        });
        continue;
      }
    }

    // 5. Check database collisions and identity integrity
    const existingSlugMatch = existingBySlug.get(slug);
    const existingUniqueIdMatch = existingByUniqueId.get(uniqueId);

    if (existingSlugMatch && existingUniqueIdMatch && existingSlugMatch.id !== existingUniqueIdMatch.id) {
      result.rejected.push({
        index,
        uniqueId,
        slug,
        name,
        reason: `Conflict: slug "${slug}" belongs to member "${existingSlugMatch.name}" (${existingSlugMatch.id}), but uniqueId "${uniqueId}" is already assigned to "${existingUniqueIdMatch.name}" (${existingUniqueIdMatch.id}).`,
      });
      continue;
    }

    // If slug exists on a different member than unique_id
    let existingMember: MemberRecord | null = null;
    if (existingSlugMatch) {
      existingMember = existingSlugMatch;
      // If the existing member already has a DIFFERENT unique_id, prevent silent overwriting
      if (existingMember.unique_id && existingMember.unique_id.toUpperCase() !== uniqueId) {
        result.rejected.push({
          index,
          uniqueId,
          slug,
          name,
          reason: `Conflict: member "${slug}" already has permanent uniqueId "${existingMember.unique_id}". Cannot overwrite with "${uniqueId}".`,
        });
        continue;
      }
    } else if (existingUniqueIdMatch) {
      existingMember = existingUniqueIdMatch;
      // If unique_id is already assigned to another member with different slug
      if (existingMember.public_id.toLowerCase() !== slug) {
        result.rejected.push({
          index,
          uniqueId,
          slug,
          name,
          reason: `Conflict: uniqueId "${uniqueId}" is already permanently assigned to "${existingMember.public_id}". Cannot reassign to "${slug}".`,
        });
        continue;
      }
    }

    validatedRecords.push({
      record: r,
      uniqueId,
      slug,
      name,
      existingMember,
    });
  }

  // Atomic validation: if any record is rejected or conflicting, abort the batch to prevent corrupting state
  if (result.rejected.length > 0) {
    return result;
  }

  // Safe transactional upsert
  runTransaction(() => {
    for (const item of validatedRecords) {
      const r = item.record;
      const { uniqueId, slug, name, existingMember } = item;

      // Format domain
      let domainStr = '';
      if (Array.isArray(r.domain)) {
        domainStr = r.domain.join(', ');
      } else if (typeof r.domain === 'string') {
        domainStr = r.domain;
      }

      // Format skills
      let skillsStr = '[]';
      if (Array.isArray(r.skills)) {
        skillsStr = JSON.stringify(r.skills);
      }

      // Format socials
      let socialsStr: string | null = null;
      if (r.socials && typeof r.socials === 'object') {
        socialsStr = JSON.stringify(r.socials);
      }

      // Format status
      const statusRaw = (r.status || 'ACTIVE').toUpperCase();
      const status =
        statusRaw === 'INACTIVE' ? 'INACTIVE' : statusRaw === 'ALUMNI' ? 'ALUMNI' : 'ACTIVE';

      const photoUrl = r.image || r.photo || (existingMember ? existingMember.photo_url : null);

      if (existingMember) {
        // Update existing member safely
        membersRepository.update(existingMember.id, {
          unique_id: uniqueId,
          name: name,
          display_name: r.displayName || name,
          email: r.email || existingMember.email,
          role: r.role || existingMember.role,
          domain: domainStr || existingMember.domain,
          department: r.department || existingMember.department || 'Engineering',
          bio: r.bio || existingMember.bio,
          photo_url: photoUrl,
          social_links: socialsStr || existingMember.social_links,
          status: status,
          clearance_level: r.clearanceLevel || existingMember.clearance_level || 'LVL-03 // SPEC',
          special_word: r.specialWord || existingMember.special_word || 'VISIONARY',
          quote: r.quote || existingMember.quote,
          node_location: r.nodeLocation || existingMember.node_location || 'SOA LAB 204 // BHUBANESWAR',
          frequency: r.frequency || existingMember.frequency || '108.40 MHz',
          security_zone: r.securityZone || existingMember.security_zone || 'SEC // ALPHA',
          badge_issue: r.badgeIssue || existingMember.badge_issue || '2026.Q1',
          skills: skillsStr,
        });
        result.updated++;
      } else {
        // Create new member
        const newId = `team-${slug}`;
        membersRepository.create({
          id: newId,
          public_id: slug,
          unique_id: uniqueId,
          name: name,
          display_name: r.displayName || name,
          email: r.email || `${slug}@nexus.campus`,
          role: r.role || 'Member',
          domain: domainStr || 'Interdisciplinary Squad',
          department: r.department || 'Engineering',
          bio: r.bio || null,
          photo_url: photoUrl,
          image_position: 'center 20%',
          social_links: socialsStr,
          status: status,
          clearance_level: r.clearanceLevel || 'LVL-03 // SPEC',
          special_word: r.specialWord || 'VISIONARY',
          quote: r.quote || null,
          node_location: r.nodeLocation || 'SOA LAB 204 // BHUBANESWAR',
          frequency: r.frequency || '108.40 MHz',
          security_zone: r.securityZone || 'SEC // ALPHA',
          badge_issue: r.badgeIssue || '2026.Q1',
          skills: skillsStr,
          current_focus: null,
          fun_fact: null,
          joined_date: '2026-09-01',
        });
        result.created++;
      }
    }
  });

  return result;
}

// Direct CLI entrypoint
if (process.argv[1] && process.argv[1].includes('import-eid-members')) {
  const targetFile = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : DEFAULT_MEMBERS_JSON_PATH;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  NEXUS E-ID MEMBER SEED & SAFE IMPORT ENGINE       ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Source File: ${targetFile}`);

  try {
    const report = validateAndImportEidMembers(targetFile);

    console.log(`\nImport Summary:`);
    console.log(`- Total Records in File: ${report.totalRecords}`);
    console.log(`- Successfully Created:  ${report.created}`);
    console.log(`- Successfully Updated:  ${report.updated}`);
    console.log(`- Skipped / Unchanged:   ${report.skipped}`);
    console.log(`- Rejected / Conflicted: ${report.rejected.length}`);

    if (report.rejected.length > 0) {
      console.log('\n[!] Rejected Records Report:');
      for (const rej of report.rejected) {
        console.log(`  [Record #${rej.index}] ID: ${rej.uniqueId || 'N/A'} | Slug: ${rej.slug || 'N/A'} | Name: ${rej.name || 'N/A'}`);
        console.log(`      Reason: ${rej.reason}`);
      }
      process.exit(1);
    } else {
      console.log('\n✓ All E-ID member records validated and synchronized successfully.');
    }
  } catch (error) {
    console.error('\n✗ Import process failed:', error);
    process.exit(1);
  }
}
