import { createApp } from '../app.ts';
import { recruitmentRepository } from '../db/repositories/recruitment.repository.ts';
import { eventRegistrationsRepository } from '../db/repositories/eventRegistrations.repository.ts';
import { eventsRepository } from '../db/repositories/events.repository.ts';
import { submissionsRepository } from '../db/repositories/submissions.repository.ts';
import { adminUsersRepository } from '../db/repositories/adminUsers.repository.ts';
import { adminSessionsRepository } from '../db/repositories/adminSessions.repository.ts';
import { hashPasswordSync, generateSessionToken, hashToken } from '../utils/crypto.ts';
import { notificationHooks } from '../services/notificationHook.service.ts';
import { submissionRateLimiter } from '../middleware/rateLimiter.ts';
import type { Server } from 'node:http';

interface ApiResponse<T = any> {
  data: T | null;
  meta: any;
  error: { code: string; message: string; details?: any } | null;
}

let server: Server;
let baseUrl: string;
let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function post<T>(
  path: string,
  payload: any,
  token?: string
): Promise<{ status: number; headers: Headers; body: ApiResponse<T> }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as ApiResponse<T>;
  return { status: res.status, headers: res.headers, body };
}

async function get<T>(
  path: string,
  token?: string
): Promise<{ status: number; headers: Headers; body: ApiResponse<T> }> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, { headers });
  const body = (await res.json()) as ApiResponse<T>;
  return { status: res.status, headers: res.headers, body };
}

async function patch<T>(
  path: string,
  payload: any,
  token?: string
): Promise<{ status: number; headers: Headers; body: ApiResponse<T> }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as ApiResponse<T>;
  return { status: res.status, headers: res.headers, body };
}

async function runSubmissionsTestSuite() {
  console.log('===================================================');
  console.log('  NEXUS PUBLIC SUBMISSION & REGISTRATION SUITE     ');
  console.log('===================================================');

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`[Test Server] Listening on ${baseUrl}`);
      resolve();
    });
  });

  // Seed super admin user for admin tests
  const adminEmail = `admin-sub-test-${Date.now()}@nexus.campus`;
  const { hash, salt } = hashPasswordSync('AdminPass123!');
  const now = new Date().toISOString();

  const superAdmin = adminUsersRepository.create({
    id: `adm-test-${Date.now()}`,
    name: 'Submission Admin',
    email: adminEmail,
    password_hash: hash,
    salt,
    role: 'super_admin',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: now,
    updated_at: now,
  });

  const { token: sessionToken, tokenHash } = generateSessionToken();
  adminSessionsRepository.createSession(
    `sess-${Date.now()}`,
    superAdmin.id,
    tokenHash,
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    '127.0.0.1',
    'TestRunner/1.0'
  );

  // Setup test event records
  const openEvent = eventsRepository.create({
    id: `evt-open-${Date.now()}`,
    slug: `open-hackathon-${Date.now()}`,
    title: 'NEXUS Autonomous Systems Hackathon',
    description: 'Build autonomous robotics and AI agents.',
    event_type: 'Workshop',
    event_date: '2026-11-15',
    event_time: '09:00 AM',
    venue: 'NEXUS Main Robotics Lab',
    registration_url: null,
    cover_image: null,
    featured: 1,
    status: 'Upcoming',
    capacity: 2, // Set tiny capacity of 2 for capacity test
    registration_status: 'OPEN',
  });

  const closedEvent = eventsRepository.create({
    id: `evt-closed-${Date.now()}`,
    slug: `closed-symposium-${Date.now()}`,
    title: 'Closed Quantum Computing Workshop',
    description: 'Quantum hardware architectures.',
    event_type: 'Showcase',
    event_date: '2026-12-01',
    event_time: '02:00 PM',
    venue: 'Virtual Auditorium',
    registration_url: null,
    cover_image: null,
    featured: 0,
    status: 'Upcoming',
    capacity: 50,
    registration_status: 'CLOSED',
  });

  console.log('\n--- Test Group 1: Valid Submissions & Notification Hooks ---');
  let recruitmentId = '';
  const notificationState = { triggered: false };
  const recEmail = `aadyasha-${Date.now()}@nexus.edu`;

  const unhook = notificationHooks.on('recruitment.submitted', (payload) => {
    if (payload.id) notificationState.triggered = true;
  });

  {
    // 1. Valid Recruitment Application
    const recRes = await post<any>('/api/recruitment/apply', {
      name: 'Aadyasha Swain',
      email: recEmail,
      phone: '+1-555-0192',
      department: 'Robotics Engineering',
      year_of_study: 'Year 3',
      selected_domain: 'Hardware & Robotics',
      interests: ['Autonomous Flight', 'PCB Design'],
      portfolio_url: 'https://aadyasha.dev',
      github_url: 'https://github.com/aadyasha',
      message: 'Excited to contribute to quadcopter drone flight controller firmware.',
      consent: true,
    });

    assert(recRes.status === 201, 'POST /api/recruitment/apply returns 201 Created');
    assert(recRes.body.data.selected_domain === 'Hardware & Robotics', 'Selected domain correctly stored');
    assert(recRes.body.data.status === 'SUBMITTED', 'Initial status set to SUBMITTED');
    recruitmentId = recRes.body.data.id;

    // Allow setImmediate notification hook to fire
    await new Promise((r) => setTimeout(r, 50));
    assert(notificationState.triggered === true, 'Decoupled notification hook fired for recruitment.submitted');
    unhook();

    // 2. Valid Contact Inquiry
    const contactRes = await post<any>('/api/contact', {
      name: 'Dr. Sarah Connor',
      email: 's.connor@cyberdyne.org',
      category: 'collaboration',
      message: 'We would like to propose a joint research workshop on autonomous agents.',
    });

    assert(contactRes.status === 201, 'POST /api/contact returns 201 Created');
    assert(contactRes.body.data.name === 'Dr. Sarah Connor', 'Contact name correctly stored');

    // 3. Valid Event Registration
    const regRes = await post<any>(`/api/events/${openEvent.id}/register`, {
      attendee_name: 'Alex Mercer',
      attendee_email: 'alex.mercer@nexus.edu',
      organization: 'Embedded Systems Lab',
    });

    assert(regRes.status === 201, `POST /api/events/${openEvent.id}/register returns 201 Created`);
    assert(regRes.body.data.status === 'CONFIRMED', 'Event registration status set to CONFIRMED');
  }

  console.log('\n--- Test Group 2: Strong Input Validation Failures ---');
  {
    (submissionRateLimiter as any).reset();

    // Missing consent in recruitment
    const noConsentRes = await post<any>('/api/recruitment/apply', {
      name: 'No Consent Applicant',
      email: 'noconsent@nexus.edu',
      selected_domain: 'Software & Systems',
      consent: false,
    });
    assert(
      noConsentRes.status === 400 && noConsentRes.body.error?.code === 'CONSENT_REQUIRED',
      'Rejects recruitment submission without consent with 400 CONSENT_REQUIRED'
    );

    // Invalid email format
    const badEmailRes = await post<any>('/api/recruitment/apply', {
      name: 'Bad Email',
      email: 'invalid-email-string',
      selected_domain: 'Software & Systems',
      consent: true,
    });
    assert(
      badEmailRes.status === 400 && badEmailRes.body.error?.code === 'INVALID_EMAIL',
      'Rejects invalid email format with 400 INVALID_EMAIL'
    );

    // Invalid domain choice
    const badDomainRes = await post<any>('/api/recruitment/apply', {
      name: 'Bad Domain',
      email: 'baddomain@nexus.edu',
      selected_domain: 'NonExistentFantasyDomain',
      consent: true,
    });
    assert(
      badDomainRes.status === 400 && badDomainRes.body.error?.code === 'INVALID_DOMAIN',
      'Rejects invalid domain choice with 400 INVALID_DOMAIN'
    );

    // Malformed portfolio URL
    const badUrlRes = await post<any>('/api/recruitment/apply', {
      name: 'Bad URL',
      email: 'badurl@nexus.edu',
      selected_domain: 'Software & Systems',
      portfolio_url: 'javascript:alert(1)',
      consent: true,
    });
    assert(
      badUrlRes.status === 400 && badUrlRes.body.error?.code === 'INVALID_URL',
      'Rejects malformed non-HTTP URL with 400 INVALID_URL'
    );
  }

  console.log('\n--- Test Group 3: Duplicate Submission Prevention ---');
  {
    (submissionRateLimiter as any).reset();
    // Duplicate recruitment submission within 30-day active window
    const dupRecRes = await post<any>('/api/recruitment/apply', {
      name: 'Aadyasha Swain',
      email: recEmail,
      selected_domain: 'Hardware & Robotics',
      consent: true,
    });
    assert(
      dupRecRes.status === 409 && dupRecRes.body.error?.code === 'DUPLICATE_APPLICATION',
      'Rejects active recruitment application from same email within 30 days with 409 DUPLICATE_APPLICATION'
    );

    // Duplicate event registration for same attendee & event
    const dupEventRes = await post<any>(`/api/events/${openEvent.id}/register`, {
      attendee_name: 'Alex Mercer Duplicate',
      attendee_email: 'alex.mercer@nexus.edu',
    });
    assert(
      dupEventRes.status === 409 && dupEventRes.body.error?.code === 'DUPLICATE_REGISTRATION',
      'Rejects duplicate registration for same event and email with 409 DUPLICATE_REGISTRATION'
    );
  }

  console.log('\n--- Test Group 4: Closed Event & Capacity Limits ---');
  {
    (submissionRateLimiter as any).reset();
    // Registration attempt to closed event
    const closedRes = await post<any>(`/api/events/${closedEvent.id}/register`, {
      attendee_name: 'Late Attendee',
      attendee_email: 'late@nexus.edu',
    });
    assert(
      closedRes.status === 400 && closedRes.body.error?.code === 'EVENT_REGISTRATION_CLOSED',
      'Rejects registration to closed event with 400 EVENT_REGISTRATION_CLOSED'
    );

    // Fill remaining capacity slot for openEvent (capacity = 2, 1 already registered)
    const slot2Res = await post<any>(`/api/events/${openEvent.id}/register`, {
      attendee_name: 'Attendee Two',
      attendee_email: 'att2@nexus.edu',
    });
    assert(slot2Res.status === 201, '2nd attendee registers successfully to openEvent');

    // 3rd attendee tries to register when capacity = 2
    const fullRes = await post<any>(`/api/events/${openEvent.id}/register`, {
      attendee_name: 'Overflow Attendee',
      attendee_email: 'overflow@nexus.edu',
    });
    assert(
      fullRes.status === 400 && fullRes.body.error?.code === 'EVENT_CAPACITY_REACHED',
      'Rejects registration beyond event capacity with 400 EVENT_CAPACITY_REACHED'
    );
  }

  console.log('\n--- Test Group 5: Rate Limiting & Anti-Spam ---');
  {
    // Reset rate limiter for test isolation
    (submissionRateLimiter as any).reset();

    // Send 5 rapid submissions (max limit = 5)
    for (let i = 1; i <= 5; i++) {
      await post('/api/contact', {
        name: `Rate User ${i}`,
        email: `rate${i}@nexus.edu`,
        message: `Burst test message ${i}`,
      });
    }

    // 6th request should trigger 429 TOO_MANY_REQUESTS
    const burst6Res = await post<any>('/api/contact', {
      name: 'Rate User 6',
      email: 'rate6@nexus.edu',
      message: 'Burst test message 6',
    });

    assert(
      burst6Res.status === 429 && burst6Res.body.error?.code === 'TOO_MANY_REQUESTS',
      '6th submission within window triggers HTTP 429 TOO_MANY_REQUESTS'
    );
    assert(burst6Res.headers.get('x-ratelimit-limit') === '5', 'Contains X-RateLimit-Limit header');

    // Reset rate limiter again so subsequent tests run cleanly
    (submissionRateLimiter as any).reset();

    // Honeypot spam test
    const spamRes = await post<any>('/api/contact', {
      name: 'Bot Spammer',
      email: 'bot@spam.com',
      message: 'Buy cheap watches',
      _nexus_hp: 'bot_filled_value',
    });
    assert(
      spamRes.status === 400 && spamRes.body.error?.code === 'SPAM_DETECTED',
      'Honeypot filled submission rejected with 400 SPAM_DETECTED'
    );
  }

  console.log('\n--- Test Group 6: Unauthorized Retrieval Guards ---');
  {
    // Unauthenticated GET /api/submissions (Contact submissions)
    const unauthSub = await get('/api/submissions');
    assert(
      unauthSub.status === 401 && unauthSub.body.error?.code === 'UNAUTHENTICATED',
      'GET /api/submissions rejects unauthenticated requests with 401'
    );

    // Unauthenticated GET /api/admin/recruitment
    const unauthRec = await get('/api/admin/recruitment');
    assert(
      unauthRec.status === 401 && unauthRec.body.error?.code === 'UNAUTHENTICATED',
      'GET /api/admin/recruitment rejects unauthenticated requests with 401'
    );

    // Unauthenticated GET /api/admin/events/:id/registrations
    const unauthReg = await get(`/api/admin/events/${openEvent.id}/registrations`);
    assert(
      unauthReg.status === 401 && unauthReg.body.error?.code === 'UNAUTHENTICATED',
      'GET /api/admin/events/:id/registrations rejects unauthenticated requests with 401'
    );

    // Authenticated admin GET /api/admin/recruitment
    const authRec = await get<any>('/api/admin/recruitment', sessionToken);
    assert(authRec.status === 200, 'Authenticated admin can retrieve recruitment applications');
    assert(authRec.body.data.length >= 1, 'Returns list of submitted recruitment applications');
  }

  console.log('\n--- Test Group 7: Status Transition Rules (State Machine) ---');
  {
    // Valid status transition: SUBMITTED -> UNDER_REVIEW
    const step1 = await patch<any>(
      `/api/admin/recruitment/${recruitmentId}/status`,
      { status: 'UNDER_REVIEW' },
      sessionToken
    );
    assert(step1.status === 200 && step1.body.data.status === 'UNDER_REVIEW', 'Transition SUBMITTED -> UNDER_REVIEW succeeds');

    // Valid status transition: UNDER_REVIEW -> SHORTLISTED
    const step2 = await patch<any>(
      `/api/admin/recruitment/${recruitmentId}/status`,
      { status: 'SHORTLISTED' },
      sessionToken
    );
    assert(step2.status === 200 && step2.body.data.status === 'SHORTLISTED', 'Transition UNDER_REVIEW -> SHORTLISTED succeeds');

    // Invalid status transition: SHORTLISTED -> SUBMITTED (Disallowed jump backward)
    const invalidJump = await patch<any>(
      `/api/admin/recruitment/${recruitmentId}/status`,
      { status: 'SUBMITTED' },
      sessionToken
    );
    assert(
      invalidJump.status === 400 && invalidJump.body.error?.code === 'INVALID_STATUS_TRANSITION',
      'Disallowed status transition rejected with 400 INVALID_STATUS_TRANSITION'
    );

    // Valid status transition: SHORTLISTED -> ACCEPTED
    const step3 = await patch<any>(
      `/api/admin/recruitment/${recruitmentId}/status`,
      { status: 'ACCEPTED' },
      sessionToken
    );
    assert(step3.status === 200 && step3.body.data.status === 'ACCEPTED', 'Transition SHORTLISTED -> ACCEPTED succeeds');
  }

  console.log('\n===================================================');
  console.log(`  SUBMISSIONS TEST RESULTS: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('===================================================');

  // Clean up created test entities
  recruitmentRepository.deleteById(recruitmentId);
  eventsRepository.deleteById(openEvent.id);
  eventsRepository.deleteById(closedEvent.id);
  adminUsersRepository.deleteById(superAdmin.id);

  server.close();
  if (passed !== total) {
    process.exit(1);
  }
}

runSubmissionsTestSuite().catch((err) => {
  console.error('Submissions test suite failed:', err);
  process.exit(1);
});
