import http from 'http';
import { createApp } from '../app.ts';
import { seedDatabase } from '../db/seed.ts';
import { getDatabase } from '../db/connection.ts';
import { submissionsRepository } from '../db/repositories/submissions.repository.ts';

interface ApiResponse<T> {
  data: T;
  meta: any;
  error: { code: string; message: string; details?: any } | null;
}

async function runApiTestSuite() {
  console.log('===================================================');
  console.log('  NEXUS PUBLIC READ APIs TEST SUITE                ');
  console.log('===================================================');

  // 1. Ensure DB is seeded
  const db = getDatabase();
  seedDatabase(db);

  // 2. Start test server on ephemeral port
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, failureDetails?: any) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`, failureDetails || '');
    }
  }

  async function get<T>(path: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const res = await fetch(`${baseUrl}${path}`);
    const body = (await res.json()) as ApiResponse<T>;
    return { status: res.status, body };
  }

  async function post<T>(path: string, payload: any): Promise<{ status: number; body: ApiResponse<T> }> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as ApiResponse<T>;
    return { status: res.status, body };
  }

  console.log('\n--- Test Group 1: Success Cases ---');
  {
    // Health
    const resHealth = await get('/api/health');
    assert(resHealth.status === 200 && resHealth.body.data !== null, 'GET /api/health responds with status 200');

    // Projects list
    const resProjects = await get<any[]>('/api/projects');
    assert(
      resProjects.status === 200 &&
        Array.isArray(resProjects.body.data) &&
        resProjects.body.data.length > 0 &&
        resProjects.body.error === null,
      'GET /api/projects returns array of projects with error: null'
    );

    // Verify Project schema serialization
    const firstProject = resProjects.body.data[0];
    assert(
      Array.isArray(firstProject.technologies) &&
        typeof firstProject.featured === 'boolean' &&
        Array.isArray(firstProject.members),
      'Project record correctly parses technologies array, boolean featured flag, and members array'
    );

    // Featured projects
    const resFeatured = await get<any[]>('/api/projects/featured');
    assert(
      resFeatured.status === 200 && Array.isArray(resFeatured.body.data) && resFeatured.body.data.length > 0,
      'GET /api/projects/featured returns featured projects'
    );

    // Project by slug
    const resProjSlug = await get<any>(`/api/projects/${firstProject.slug}`);
    assert(
      resProjSlug.status === 200 && resProjSlug.body.data.id === firstProject.id,
      `GET /api/projects/:slug retrieves project by slug (${firstProject.slug})`
    );

    // Project members nested
    const resProjMembers = await get<any[]>(`/api/projects/${firstProject.slug}/members`);
    assert(
      resProjMembers.status === 200 && Array.isArray(resProjMembers.body.data),
      'GET /api/projects/:slug/members returns members list'
    );

    // Events list
    const resEvents = await get<any[]>('/api/events');
    assert(
      resEvents.status === 200 && Array.isArray(resEvents.body.data) && resEvents.body.data.length > 0,
      'GET /api/events returns events array'
    );

    // Upcoming events
    const resUpcoming = await get<any[]>('/api/events/upcoming');
    assert(
      resUpcoming.status === 200 && Array.isArray(resUpcoming.body.data),
      'GET /api/events/upcoming returns upcoming events'
    );

    // Past events
    const resPast = await get<any[]>('/api/events/past');
    assert(
      resPast.status === 200 && Array.isArray(resPast.body.data),
      'GET /api/events/past returns past events'
    );

    // Members list
    const resMembers = await get<any[]>('/api/members');
    assert(
      resMembers.status === 200 && Array.isArray(resMembers.body.data) && resMembers.body.data.length > 0,
      'GET /api/members returns active members'
    );

    // Member by public id
    const sampleMember = resMembers.body.data[0];
    const resMemberDetail = await get<any>(`/api/members/${sampleMember.publicId}`);
    assert(
      resMemberDetail.status === 200 && resMemberDetail.body.data.id === sampleMember.id,
      `GET /api/members/:publicId retrieves member (${sampleMember.publicId})`
    );

    // Announcements list
    const resAnnouncements = await get<any[]>('/api/announcements');
    assert(
      resAnnouncements.status === 200 && Array.isArray(resAnnouncements.body.data),
      'GET /api/announcements returns published bulletins'
    );

    // Archive list
    const resArchive = await get<any[]>('/api/archive');
    assert(
      resArchive.status === 200 && Array.isArray(resArchive.body.data) && resArchive.body.data.length > 0,
      'GET /api/archive returns archive chronicle items'
    );

    // Resources list
    const resResources = await get<any[]>('/api/resources');
    assert(
      resResources.status === 200 && Array.isArray(resResources.body.data) && resResources.body.data.length > 0,
      'GET /api/resources returns resources list'
    );

    // Site Config
    const resConfig = await get<any>('/api/site-config');
    assert(
      resConfig.status === 200 && typeof resConfig.body.data === 'object' && resConfig.body.data.site_name,
      'GET /api/site-config returns site configuration'
    );
  }

  console.log('\n--- Test Group 2: Not Found (404) Cases ---');
  {
    // Project not found
    const resNoProject = await get('/api/projects/unknown-non-existent-project-xyz');
    assert(
      resNoProject.status === 404 &&
        resNoProject.body.data === null &&
        resNoProject.body.error?.code === 'PROJECT_NOT_FOUND',
      'GET /api/projects/:slug returns 404 with PROJECT_NOT_FOUND for invalid slug'
    );

    // Event not found
    const resNoEvent = await get('/api/events/non-existent-event-xyz');
    assert(
      resNoEvent.status === 404 &&
        resNoEvent.body.data === null &&
        resNoEvent.body.error?.code === 'EVENT_NOT_FOUND',
      'GET /api/events/:slug returns 404 with EVENT_NOT_FOUND'
    );

    // Member not found
    const resNoMember = await get('/api/members/non-existent-member-xyz');
    assert(
      resNoMember.status === 404 &&
        resNoMember.body.data === null &&
        resNoMember.body.error?.code === 'MEMBER_NOT_FOUND',
      'GET /api/members/:id returns 404 with MEMBER_NOT_FOUND'
    );

    // Announcement not found
    const resNoAnn = await get('/api/announcements/non-existent-ann-xyz');
    assert(
      resNoAnn.status === 404 &&
        resNoAnn.body.data === null &&
        resNoAnn.body.error?.code === 'ANNOUNCEMENT_NOT_FOUND',
      'GET /api/announcements/:id returns 404 with ANNOUNCEMENT_NOT_FOUND'
    );

    // Archive item not found
    const resNoArchive = await get('/api/archive/non-existent-arch-xyz');
    assert(
      resNoArchive.status === 404 &&
        resNoArchive.body.data === null &&
        resNoArchive.body.error?.code === 'ARCHIVE_ITEM_NOT_FOUND',
      'GET /api/archive/:id returns 404 with ARCHIVE_ITEM_NOT_FOUND'
    );

    // Resource not found
    const resNoResource = await get('/api/resources/non-existent-res-xyz');
    assert(
      resNoResource.status === 404 &&
        resNoResource.body.data === null &&
        resNoResource.body.error?.code === 'RESOURCE_NOT_FOUND',
      'GET /api/resources/:id returns 404 with RESOURCE_NOT_FOUND'
    );

    // Unknown route
    const resUnknown = await get('/api/completely-unknown-route');
    assert(
      resUnknown.status === 404 && resUnknown.body.error?.code === 'NOT_FOUND',
      'Unknown route returns 404 with NOT_FOUND'
    );
  }

  console.log('\n--- Test Group 3: Input Validation Cases ---');
  {
    // Missing full name
    const resInvalidName = await post('/api/submissions', { email: 'test@example.com' });
    assert(
      resInvalidName.status === 400 &&
        resInvalidName.body.data === null &&
        resInvalidName.body.error?.code === 'INVALID_NAME',
      'POST /api/submissions returns 400 INVALID_NAME when fullName is missing'
    );

    // Invalid email format
    const resInvalidEmail = await post('/api/submissions', { fullName: 'Jane Doe', email: 'notanemail' });
    assert(
      resInvalidEmail.status === 400 &&
        resInvalidEmail.body.data === null &&
        resInvalidEmail.body.error?.code === 'INVALID_EMAIL',
      'POST /api/submissions returns 400 INVALID_EMAIL when email lacks @'
    );

    // Valid submission
    const resValid = await post<any>('/api/submissions', {
      fullName: 'Integration Test User',
      email: 'integration@nexus.edu',
      intent: 'COLLABORATE WITH US',
      message: 'Automated test message',
    });
    assert(
      resValid.status === 201 &&
        resValid.body.data?.name === 'Integration Test User' &&
        resValid.body.error === null,
      'POST /api/submissions returns 201 Created with valid payload'
    );

    // Clean up created submission
    if (resValid.body.data?.id) {
      submissionsRepository.deleteById(resValid.body.data.id);
    }
  }

  console.log('\n--- Test Group 4: Empty Results Cases ---');
  {
    // Search with non-matching query
    const resEmptyProjects = await get<any[]>('/api/projects?q=NonExistentQueryZzz123');
    assert(
      resEmptyProjects.status === 200 &&
        Array.isArray(resEmptyProjects.body.data) &&
        resEmptyProjects.body.data.length === 0 &&
        resEmptyProjects.body.meta?.totalItems === 0,
      'GET /api/projects with non-matching search returns HTTP 200, empty array, and totalItems: 0'
    );

    // Member with non-matching domain
    const resEmptyMembers = await get<any[]>('/api/members?domain=NonExistentDomainXYZ');
    assert(
      resEmptyMembers.status === 200 &&
        Array.isArray(resEmptyMembers.body.data) &&
        resEmptyMembers.body.data.length === 0 &&
        resEmptyMembers.body.meta?.totalItems === 0,
      'GET /api/members with non-matching domain returns HTTP 200 and empty array'
    );
  }

  console.log('\n--- Test Group 5: Pagination & Deterministic Sorting ---');
  {
    // Page 1 with limit 2
    const resPage1 = await get<any[]>('/api/projects?page=1&limit=2');
    assert(
      resPage1.status === 200 &&
        resPage1.body.data.length === 2 &&
        resPage1.body.meta?.page === 1 &&
        resPage1.body.meta?.limit === 2 &&
        resPage1.body.meta?.hasNextPage === true &&
        resPage1.body.meta?.hasPrevPage === false,
      'GET /api/projects?page=1&limit=2 correctly paginates and sets meta flags'
    );

    // Page 2 with limit 2
    const resPage2 = await get<any[]>('/api/projects?page=2&limit=2');
    assert(
      resPage2.status === 200 &&
        resPage2.body.data.length === 2 &&
        resPage2.body.meta?.page === 2 &&
        resPage2.body.meta?.hasPrevPage === true,
      'GET /api/projects?page=2&limit=2 returns page 2 with hasPrevPage: true'
    );

    // Determinism: page 1 items must differ from page 2 items
    const page1Ids = resPage1.body.data.map((p) => p.id);
    const page2Ids = resPage2.body.data.map((p) => p.id);
    const overlap = page1Ids.some((id) => page2Ids.includes(id));
    assert(!overlap, 'Paging is strictly deterministic with zero duplicate items across pages');
  }

  console.log('\n--- Test Group 6: Unauthorized & Private Field Leakage Protection ---');
  {
    const resMembers = await get<any[]>('/api/members');
    const firstMember = resMembers.body.data[0];

    const forbiddenFields = ['password', 'passwordHash', 'secret', 'token', 'adminHash', 'sessionKey'];
    let leakedField: string | null = null;
    for (const f of forbiddenFields) {
      if (f in firstMember) {
        leakedField = f;
        break;
      }
    }
    assert(
      leakedField === null,
      'Public member objects contain zero private credentials or security fields'
    );

    // Check announcements: draft announcements must never be returned in public list
    const resAnnouncements = await get<any[]>('/api/announcements');
    const hasNonPublished = resAnnouncements.body.data.some((a) => a.publish_status && a.publish_status !== 'published');
    assert(
      !hasNonPublished,
      'Public announcements endpoint only returns published announcements'
    );
  }

  server.close();
  console.log('\n===================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('===================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runApiTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
