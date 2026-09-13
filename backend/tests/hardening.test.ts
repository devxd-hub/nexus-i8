import { createApp } from '../app.ts';
import { runTransaction, getDatabase } from '../db/connection.ts';
import { authRateLimiter } from '../middleware/rateLimiter.ts';
import type { Server } from 'node:http';

interface ApiResponse<T = any> {
  data: T | null;
  meta: any;
  error: { code: string; message: string; errorId?: string; details?: any } | null;
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

async function runHardeningTestSuite() {
  console.log('===================================================');
  console.log('  NEXUS PRODUCTION HARDENING & SECURITY SUITE      ');
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

  console.log('\n--- Test Group 1: Production Security Headers ---');
  {
    const res = await fetch(`${baseUrl}/api/health`);
    assert(res.status === 200, 'GET /api/health responds with status 200');

    assert(
      res.headers.get('x-content-type-options') === 'nosniff',
      'Header X-Content-Type-Options is set to nosniff'
    );
    assert(
      res.headers.get('x-frame-options') === 'SAMEORIGIN',
      'Header X-Frame-Options is set to SAMEORIGIN'
    );
    assert(
      res.headers.get('x-xss-protection') === '0',
      'Header X-XSS-Protection is set to 0'
    );
    assert(
      res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin',
      'Header Referrer-Policy is strict-origin-when-cross-origin'
    );
    assert(
      res.headers.get('cross-origin-opener-policy') === 'same-origin',
      'Header Cross-Origin-Opener-Policy is same-origin'
    );
    assert(
      res.headers.get('permissions-policy') !== null,
      'Permissions-Policy header is configured'
    );
  }

  console.log('\n--- Test Group 2: Request ID Tracing & Propagation ---');
  {
    // Auto-generated Request ID
    const resAuto = await fetch(`${baseUrl}/api/health`);
    const autoReqId = resAuto.headers.get('x-request-id');
    assert(
      typeof autoReqId === 'string' && autoReqId.startsWith('req_'),
      'Auto-generates unique X-Request-Id header'
    );

    // Client propagated Request ID
    const customReqId = 'test-trace-id-12345';
    const resEcho = await fetch(`${baseUrl}/api/health`, {
      headers: { 'X-Request-Id': customReqId },
    });
    assert(
      resEcho.headers.get('x-request-id') === customReqId,
      'Preserves and echoes client-provided X-Request-Id'
    );
  }

  console.log('\n--- Test Group 3: CORS Origin Filtering & Preflight ---');
  {
    // Preflight OPTIONS request
    const optionsRes = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
      },
    });
    assert(optionsRes.status === 204, 'OPTIONS preflight responds with 204 No Content');
    assert(
      optionsRes.headers.get('access-control-max-age') === '86400',
      'OPTIONS preflight sets Access-Control-Max-Age: 86400'
    );

    // Request from localhost (allowed development origin)
    const devOriginRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    assert(
      devOriginRes.headers.get('access-control-allow-origin') === 'http://localhost:3000',
      'Sets Access-Control-Allow-Origin for valid origin'
    );
    assert(
      devOriginRes.headers.get('vary')?.includes('Origin'),
      'Vary: Origin header is present'
    );
  }

  console.log('\n--- Test Group 4: Safe Error Handling & Incident Tracking ---');
  {
    // Request an endpoint that does not exist
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-probe`);
    const notFoundBody = (await notFoundRes.json()) as ApiResponse;
    assert(notFoundRes.status === 404, '404 status returned for undefined route');
    assert(notFoundBody.error?.code === 'NOT_FOUND', 'Safe NOT_FOUND error code returned');
    assert((notFoundBody as any).stack === undefined, 'Zero stack trace exposed in response body');
  }

  console.log('\n--- Test Group 5: Deep Production Health Probe ---');
  {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthBody = (await healthRes.json()) as any;

    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthBody.status === 'healthy', 'Application status is healthy');
    assert(healthBody.checks.database === 'connected', 'Database connectivity verified (SELECT 1)');
    assert(healthBody.checks.storage === 'operational', 'Storage provider verified');
    assert(typeof healthBody.metrics.heapUsedMb === 'number', 'Memory metrics (heapUsedMb) reported');
    assert(typeof healthBody.uptime === 'number', 'Uptime reported');
    assert(healthBody.dbPath === undefined, 'Database internal filesystem path is NOT exposed');
  }

  console.log('\n--- Test Group 6: Database Transaction Rollback Integrity ---');
  {
    const db = getDatabase();

    // Verify initial count of test table or run transaction rollback test
    let transactionRolledBack = false;
    try {
      runTransaction((syncDb) => {
        syncDb.exec("INSERT INTO site_settings (key, value, updated_at) VALUES ('__tx_test__', '1', '2026-01-01');");
        // Simulate intentional error to trigger rollback
        throw new Error('Simulated transaction error');
      });
    } catch {
      transactionRolledBack = true;
    }

    assert(transactionRolledBack === true, 'runTransaction caught simulated failure');

    // Verify record was rolled back and does not exist in DB
    const checkRow = db.prepare("SELECT * FROM site_settings WHERE key = '__tx_test__';").get();
    assert(checkRow === undefined, 'Database changes were rolled back completely with zero state pollution');
  }

  console.log('\n--- Test Group 7: Authentication Rate Limiting ---');
  {
    (authRateLimiter as any).reset();

    // Fire 20 requests (limit = 20)
    for (let i = 1; i <= 20; i++) {
      await fetch(`${baseUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'probe@nexus.campus', password: 'BadPassword' }),
      });
    }

    // 21st request triggers 429 TOO_MANY_REQUESTS
    const limitedRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'probe@nexus.campus', password: 'BadPassword' }),
    });

    assert(
      limitedRes.status === 429,
      '21st rapid authentication attempt triggers HTTP 429 TOO_MANY_REQUESTS'
    );
    assert(
      limitedRes.headers.get('x-ratelimit-limit') === '20',
      'X-RateLimit-Limit header is set to 20'
    );

    (authRateLimiter as any).reset();
  }

  console.log('\n===================================================');
  console.log(`  HARDENING TEST RESULTS: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('===================================================');

  server.close();
  if (passed !== total) {
    process.exit(1);
  }
}

runHardeningTestSuite().catch((err) => {
  console.error('Hardening test suite failed:', err);
  process.exit(1);
});
