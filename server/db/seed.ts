import { getDatabase } from './connection.ts';
import { runMigrations } from './migrate.ts';
import { membersRepository } from './repositories/members.repository.ts';
import { projectsRepository } from './repositories/projects.repository.ts';
import { eventsRepository } from './repositories/events.repository.ts';
import { announcementsRepository } from './repositories/announcements.repository.ts';
import { archiveRepository } from './repositories/archive.repository.ts';
import { resourcesRepository } from './repositories/resources.repository.ts';
import { siteSettingsRepository } from './repositories/siteSettings.repository.ts';
import {
  SEED_MEMBERS,
  SEED_PROJECTS,
  SEED_EVENTS,
  SEED_ANNOUNCEMENTS,
  SEED_ARCHIVE,
  SEED_RESOURCES,
  SEED_SITE_CONFIG,
} from './seedData.ts';

export function seedDatabase(customDb?: ReturnType<typeof getDatabase>): {
  members: number;
  projects: number;
  events: number;
  announcements: number;
  archive: number;
  resources: number;
  settings: number;
} {
  const db = customDb || getDatabase();

  // 1. Ensure migrations are run first
  runMigrations(db);

  console.log('[Seed] Seeding development & demo records into SQLite database...');

  // 2. Seed Members
  let memberCount = 0;
  for (const m of SEED_MEMBERS) {
    const existing = membersRepository.findById(m.id);
    const publicId = m.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const memberData = {
      id: m.id,
      public_id: publicId,
      name: m.name,
      email: m.email || `${publicId}@nexus.campus`,
      role: m.role,
      domain: m.discipline || 'Engineering & Design',
      bio: m.bio || null,
      photo_url: m.imageUrl || null,
      image_position: m.imagePosition || null,
      social_links: m.socials ? JSON.stringify(m.socials) : null,
      status: 'active' as const,
      joined_date: '2026-09-01',
    };

    if (!existing) {
      membersRepository.create(memberData);
      memberCount++;
    } else {
      membersRepository.update(m.id, memberData);
    }
  }

  // 3. Seed Projects
  let projectCount = 0;
  for (const p of SEED_PROJECTS) {
    const existing = projectsRepository.findById(p.id);
    const projectData = {
      id: p.id,
      slug: p.id,
      project_number: p.projectNumber,
      title: p.title,
      category: p.category,
      year: p.year,
      short_description: p.summary,
      full_description: p.description,
      disciplines: p.disciplines,
      status: p.status,
      featured: 1,
      technologies: JSON.stringify(p.tags),
      deliverables: p.deliverables ? JSON.stringify(p.deliverables) : null,
      cover_image: `/images/nexus/archive/drafting-${p.id}.svg`,
      demo_url: p.demoUrl || null,
      repository_url: p.githubUrl || null,
    };

    if (!existing) {
      projectsRepository.create(projectData);
      projectCount++;
    } else {
      projectsRepository.update(p.id, projectData);
    }

    // Connect project lead members
    if (p.leadStudents && p.leadStudents.length > 0) {
      // Find matching member or link first member
      for (const lead of p.leadStudents) {
        const leadName = lead.split('(')[0].trim().toLowerCase();
        const matched = membersRepository.findAll().find((m) => m.name.toLowerCase().includes(leadName));
        if (matched) {
          projectsRepository.addMember(p.id, matched.id, 'Project Lead');
        }
      }
    }
  }

  // 4. Seed Events
  let eventCount = 0;
  for (const e of SEED_EVENTS) {
    const existing = eventsRepository.findById(e.id);
    const eventData = {
      id: e.id,
      slug: e.id,
      title: e.title,
      description: e.description,
      event_type: e.type,
      event_date: e.date,
      event_time: e.time,
      venue: e.location,
      registration_url: e.rsvpUrl || null,
      cover_image: null,
      featured: 1,
      status: e.status,
    };

    if (!existing) {
      eventsRepository.create(eventData);
      eventCount++;
    } else {
      eventsRepository.update(e.id, eventData);
    }
  }

  // 5. Seed Announcements
  let announcementCount = 0;
  for (const a of SEED_ANNOUNCEMENTS) {
    const existing = announcementsRepository.findById(a.id);
    const annData = {
      id: a.id,
      title: a.title,
      summary: a.content.substring(0, 100),
      body: a.content,
      priority: a.priority,
      publish_status: a.active ? ('published' as const) : ('draft' as const),
      published_at: a.publishedAt,
      expires_at: a.expiresAt || null,
    };

    if (!existing) {
      announcementsRepository.create(annData);
      announcementCount++;
    } else {
      announcementsRepository.update(a.id, annData);
    }
  }

  // 6. Seed Archive Items
  let archiveCount = 0;
  for (const item of SEED_ARCHIVE) {
    const existing = archiveRepository.findById(item.id);
    const archiveData = {
      id: item.id,
      title: item.title,
      year: '2026',
      category: item.category,
      description: item.description,
      caption: item.caption,
      media_reference: item.imageUrl || '/gallery-img/gallery-01.webp',
      aspect_ratio: item.aspectRatio || '1/1',
      author: item.author || 'NEXUS Studio Crew',
      location: item.location || 'Central Lab',
      related_project_id: null,
      related_event_id: null,
    };

    if (!existing) {
      archiveRepository.create(archiveData);
      archiveCount++;
    } else {
      archiveRepository.update(item.id, archiveData);
    }
  }

  // 7. Seed Resources
  let resourceCount = 0;
  for (const r of SEED_RESOURCES) {
    const existing = resourcesRepository.findById(r.id);
    const resourceData = {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      url: r.url,
      tags: JSON.stringify(r.tags),
      published_status: 'published' as const,
    };

    if (!existing) {
      resourcesRepository.create(resourceData);
      resourceCount++;
    } else {
      resourcesRepository.update(r.id, resourceData);
    }
  }

  // 8. Seed Site Settings
  siteSettingsRepository.set('site_name', SEED_SITE_CONFIG.name, 'Club Community Name');
  siteSettingsRepository.set('tagline', SEED_SITE_CONFIG.tagline, 'Hero Tagline');
  siteSettingsRepository.set('description', SEED_SITE_CONFIG.description, 'Studio Description');
  siteSettingsRepository.set('current_term', SEED_SITE_CONFIG.currentTerm, 'Active Academic Term');
  siteSettingsRepository.set('cohort_year', SEED_SITE_CONFIG.cohortYear, 'Active Cohort Year');
  siteSettingsRepository.set('contact_email', SEED_SITE_CONFIG.contactEmail, 'General Contact Email');
  siteSettingsRepository.set('socials', JSON.stringify(SEED_SITE_CONFIG.socials), 'Official Social Media Handles');
  siteSettingsRepository.set('open_sessions', JSON.stringify(SEED_SITE_CONFIG.openSessions), 'Studio Open Hours & Room');

  console.log(`[Seed] ✓ Seeding complete:`);
  console.log(`  - Members: ${membersRepository.count()}`);
  console.log(`  - Projects: ${projectsRepository.count()}`);
  console.log(`  - Events: ${eventsRepository.count()}`);
  console.log(`  - Announcements: ${announcementsRepository.count()}`);
  console.log(`  - Archive Items: ${archiveRepository.count()}`);
  console.log(`  - Resources: ${resourcesRepository.count()}`);
  console.log(`  - Site Settings: ${siteSettingsRepository.getAll().length}`);

  return {
    members: membersRepository.count(),
    projects: projectsRepository.count(),
    events: eventsRepository.count(),
    announcements: announcementsRepository.count(),
    archive: archiveRepository.count(),
    resources: resourcesRepository.count(),
    settings: siteSettingsRepository.getAll().length,
  };
}

// Allow direct execution via CLI (node / tsx)
if (process.argv[1] && process.argv[1].includes('seed')) {
  try {
    seedDatabase();
  } catch (err) {
    console.error('[Seed] Failed:', err);
    process.exit(1);
  }
}
