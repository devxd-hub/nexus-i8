import http from 'http';
import { createApp } from '../app.ts';
import { seedDatabase } from '../db/seed.ts';
import { getDatabase } from '../db/connection.ts';
import { storageProvider } from '../storage/index.ts';
import { mediaAssetsRepository } from '../db/repositories/mediaAssets.repository.ts';

interface ApiResponse<T> {
  data: T;
  meta: any;
  error: { code: string; message: string; details?: any } | null;
}

// Minimal valid PNG 1x1 base64 buffer
const VALID_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Minimal valid JPEG buffer (FF D8 FF E0 00 10 4A 46 49 46 ...)
const VALID_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

// Executable payload pretending to be an image (MZ header)
const FAKE_IMAGE_EXE_BASE64 = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00This is an executable').toString('base64');

// Valid PDF base64
const VALID_PDF_BASE64 = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF').toString('base64');

async function runMediaTestSuite() {
  console.log('===================================================');
  console.log('  NEXUS MEDIA & STORAGE BACKEND TEST SUITE         ');
  console.log('===================================================');

  // 1. Ensure DB is seeded
  const db = getDatabase();
  seedDatabase(db);

  // 2. Start test server
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

  async function get<T>(path: string, token?: string, customHeaders?: Record<string, string>): Promise<{ status: number; headers: Headers; body?: ApiResponse<T>; rawBuffer?: Buffer }> {
    const headers: Record<string, string> = { ...customHeaders };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, { headers });
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = (await res.json()) as ApiResponse<T>;
      return { status: res.status, headers: res.headers, body };
    } else {
      const arrayBuf = await res.arrayBuffer();
      return { status: res.status, headers: res.headers, rawBuffer: Buffer.from(arrayBuf) };
    }
  }

  async function post<T>(path: string, payload: any, token?: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as ApiResponse<T>;
    return { status: res.status, body };
  }

  async function put<T>(path: string, payload: any, token?: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as ApiResponse<T>;
    return { status: res.status, body };
  }

  async function del<T>(path: string, token?: string): Promise<{ status: number; body: ApiResponse<T> }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });
    const body = (await res.json()) as ApiResponse<T>;
    return { status: res.status, body };
  }

  // Obtain super admin & content admin tokens
  const superLogin = await post<any>('/api/admin/auth/login', {
    email: 'admin@nexus.campus',
    password: 'NexusAdmin!2026',
  });
  const superAdminToken = superLogin.body.data.token;

  const editorLogin = await post<any>('/api/admin/auth/login', {
    email: 'editor@nexus.campus',
    password: 'NexusEditor!2026',
  });
  const contentAdminToken = editorLogin.body.data.token;

  console.log('\n--- Test Group 1: Unauthorized Access Guard ---');
  {
    const res = await post('/api/admin/media/upload', {
      filename: 'test.png',
      content: VALID_1X1_PNG_BASE64,
    });
    assert(
      res.status === 401 && res.body.error?.code === 'UNAUTHENTICATED',
      'POST /api/admin/media/upload rejects unauthenticated requests with 401'
    );
  }

  console.log('\n--- Test Group 2: Valid Upload & Metadata Extraction ---');
  let uploadedPngId = '';
  let uploadedPngStorageKey = '';
  {
    const uploadRes = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'circuit-diagram.png',
        category: 'projects',
        content: VALID_1X1_PNG_BASE64,
      },
      contentAdminToken
    );

    assert(uploadRes.status === 201, 'POST /api/admin/media/upload returns status 201 Created');
    assert(uploadRes.body.data.mime_type === 'image/png', 'MIME type correctly identified as image/png');
    assert(uploadRes.body.data.parsedMetadata.width === 1 && uploadRes.body.data.parsedMetadata.height === 1, 'Image width & height extracted (1x1)');
    assert(uploadRes.body.data.parsedMetadata.checksum.length === 64, 'SHA-256 checksum computed');
    assert(uploadRes.body.data.url.startsWith('/api/media/file/'), 'Generated public URL path');

    uploadedPngId = uploadRes.body.data.id;
    uploadedPngStorageKey = uploadRes.body.data.storage_key;

    // Verify storage file exists on disk
    const fileExists = await storageProvider.exists(uploadedPngStorageKey);
    assert(fileExists === true, 'Underlying file exists in storage provider');
  }

  console.log('\n--- Test Group 3: Resource PDF Upload ---');
  let uploadedPdfId = '';
  {
    const pdfRes = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'firmware-guide.pdf',
        category: 'resources',
        content: VALID_PDF_BASE64,
      },
      contentAdminToken
    );

    assert(pdfRes.status === 201, 'PDF upload to resources returns 201 Created');
    assert(pdfRes.body.data.mime_type === 'application/pdf', 'Correct application/pdf MIME detection');
    uploadedPdfId = pdfRes.body.data.id;
  }

  console.log('\n--- Test Group 4: MIME Spoofing & Malicious Executable Rejection ---');
  {
    // Uploading executable binary renamed as photo.png
    const spoofRes = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'innocent-photo.png',
        category: 'projects',
        content: FAKE_IMAGE_EXE_BASE64,
      },
      contentAdminToken
    );

    assert(
      spoofRes.status === 400 && spoofRes.body.error?.code === 'EXECUTABLE_REJECTED',
      'Disguised PE/EXE with .png extension is rejected with EXECUTABLE_REJECTED'
    );

    // Disallowed MIME for category (uploading PDF to member photos category)
    const mimeMismatchRes = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'member-doc.pdf',
        category: 'members', // members only allows jpeg/png/webp
        content: VALID_PDF_BASE64,
      },
      contentAdminToken
    );

    assert(
      mimeMismatchRes.status === 400 && mimeMismatchRes.body.error?.code === 'MIME_NOT_ALLOWED',
      'MIME type not permitted for specific category is rejected with MIME_NOT_ALLOWED'
    );
  }

  console.log('\n--- Test Group 5: Oversize File Rejection ---');
  {
    // Generate payload larger than 10MB
    const oversizeBuffer = Buffer.alloc(11 * 1024 * 1024);
    // Write valid PNG header so it fails on size, not magic bytes
    Buffer.from('89504e470d0a1a0a', 'hex').copy(oversizeBuffer);
    const oversizeBase64 = oversizeBuffer.toString('base64');

    const sizeRes = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'huge-render.png',
        category: 'projects',
        content: oversizeBase64,
      },
      contentAdminToken
    );

    assert(
      sizeRes.status === 413 && sizeRes.body.error?.code === 'FILE_TOO_LARGE',
      'Uploads exceeding category limit are rejected with 413 FILE_TOO_LARGE'
    );
  }

  console.log('\n--- Test Group 6: Public Retrieval, Security Headers & ETag 304 ---');
  {
    // Fetch file publicly
    const fetchRes = await get<any>(`/api/media/file/${uploadedPngStorageKey}`);
    assert(fetchRes.status === 200, 'GET /api/media/file/:key serves file with status 200');
    assert(fetchRes.headers.get('content-type') === 'image/png', 'Content-Type header matches image/png');
    assert(fetchRes.headers.get('cache-control')?.includes('immutable'), 'Cache-Control header contains immutable');

    const etag = fetchRes.headers.get('etag');
    assert(etag !== null && etag.length > 0, 'ETag header is present');

    // Test If-None-Match conditional request
    if (etag) {
      const cachedRes = await get<any>(`/api/media/file/${uploadedPngStorageKey}`, undefined, {
        'If-None-Match': etag,
      });
      assert(cachedRes.status === 304, 'Request with matching If-None-Match returns 304 Not Modified');
    }

    // Path traversal attempt in retrieval URL
    const traversalRes = await get<any>('/api/media/file/%2e%2e%2f%2e%2e%2fpackage.json');
    assert(
      traversalRes.status === 403 && traversalRes.body?.error?.code === 'PATH_TRAVERSAL_REJECTED',
      'Path traversal attempt in storage key returns 403 PATH_TRAVERSAL_REJECTED'
    );
  }

  console.log('\n--- Test Group 7: File Replacement ---');
  {
    const replaceRes = await put<any>(
      `/api/admin/media/${uploadedPngId}/replace`,
      {
        filename: 'circuit-diagram-updated.jpg',
        content: VALID_JPEG_BASE64,
      },
      contentAdminToken
    );

    assert(replaceRes.status === 200, 'PUT /api/admin/media/:id/replace succeeds with 200 OK');
    assert(replaceRes.body.data.mime_type === 'image/jpeg', 'Replaced media updated MIME to image/jpeg');
    assert(replaceRes.body.data.id === uploadedPngId, 'Media asset ID preserved across replacement');
  }

  console.log('\n--- Test Group 8: Orphan Detection & Cleanup ---');
  {
    // The uploaded PDF is not attached to any project/event/member/resource
    const orphanListRes = await get<any>('/api/admin/media/orphans', superAdminToken);
    assert(orphanListRes.status === 200, 'GET /api/admin/media/orphans returns 200');
    const hasOrphan = orphanListRes.body.data.some((o: any) => o.id === uploadedPdfId);
    assert(hasOrphan === true, 'Unreferenced uploaded PDF is correctly identified as an orphan');

    // Content admin cannot trigger cleanup (super_admin only)
    const editorCleanRes = await post<any>('/api/admin/media/orphans/cleanup', {}, contentAdminToken);
    assert(
      editorCleanRes.status === 403 && editorCleanRes.body.error?.code === 'INSUFFICIENT_PERMISSIONS',
      'Content admin cannot purge orphans (403 Forbidden)'
    );

    // Super admin cleans up orphans
    const superCleanRes = await post<any>('/api/admin/media/orphans/cleanup', {}, superAdminToken);
    assert(superCleanRes.status === 200, 'Super admin purges orphans with status 200');
    assert(superCleanRes.body.data.purgedCount >= 1, 'At least 1 orphaned asset was purged');
  }

  console.log('\n--- Test Group 9: Media Deletion ---');
  {
    // Upload a dedicated item for deletion testing
    const uploadForDel = await post<any>(
      '/api/admin/media/upload',
      {
        filename: 'delete-target.png',
        category: 'projects',
        content: VALID_1X1_PNG_BASE64,
      },
      contentAdminToken
    );
    const deleteTargetId = uploadForDel.body.data.id;
    const deleteTargetKey = uploadForDel.body.data.storage_key;

    // Content admin cannot delete media
    const editorDelRes = await del(`/api/admin/media/${deleteTargetId}`, contentAdminToken);
    assert(
      editorDelRes.status === 403 && editorDelRes.body.error?.code === 'INSUFFICIENT_PERMISSIONS',
      'Content admin cannot delete media (403 Forbidden)'
    );

    // Super admin deletes media
    const superDelRes = await del<any>(`/api/admin/media/${deleteTargetId}`, superAdminToken);
    assert(superDelRes.status === 200 && superDelRes.body.data.deleted === true, 'Super admin deletes media successfully');

    // Verify file is gone from storage
    const exists = await storageProvider.exists(deleteTargetKey);
    assert(exists === false, 'Media file was removed from storage provider');
  }

  console.log('\n===================================================');
  console.log(`  MEDIA TEST RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('===================================================');

  server.close();
  if (passed !== total) {
    process.exit(1);
  }
}

runMediaTestSuite().catch((err) => {
  console.error('Media test suite runner failed:', err);
  process.exit(1);
});
