# NEXUS Media & Storage Architecture Guide

This document outlines the media and file storage architecture for the NEXUS platform. It explains the storage abstraction, security verification pipeline, variant generation, public serving layer, and orphan asset lifecycle management.

---

## 1. Architectural Principles

1. **Storage Provider Neutrality**: Content tables (`projects`, `events`, `members`, `archive_items`, `resources`) never store absolute local filesystem paths. They reference either a canonical `storage_key` (e.g., `projects/2026/render_1789...png`) or the public delivery URI `/api/media/file/<storage_key>`.
2. **Provider Swappability**: Switching between local filesystem storage and cloud storage (Amazon S3, Cloudflare R2, MinIO, or Google Cloud Storage via S3 API) requires only changing environment configuration—no application code or frontend alterations.
3. **Defense in Depth**: Uploaded files undergo binary magic-bytes sniffing, category MIME enforcement, and strict executable rejection before touching persistent storage.
4. **Automated Optimization**: Image uploads are analyzed using `sharp` to extract dimensions and aspect ratios, compute SHA-256 checksums, and automatically generate WebP thumbnail variants.
5. **Zero Frontend Interference**: The public frontend continues to render assets seamlessly via deterministic URL routing with aggressive caching headers and ETag validation.

---

## 2. Storage Provider Abstraction

All file I/O operations go through the `IStorageProvider` contract:

```typescript
export interface IStorageProvider {
  save(key: string, data: Buffer, mimeType: string): Promise<string>;
  read(key: string): Promise<{ data: Buffer; mimeType: string; etag: string; lastModified: Date } | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string): string;
}
```

### Implementations:
- **`LocalStorageProvider`** (`server/storage/localStorageProvider.ts`):
  - Stores files in `data/media/` (or `MEDIA_STORAGE_LOCAL_DIR`).
  - Guards against path traversal using strict path boundary checks (`path.resolve()`).
  - Automatically creates intermediate category and year subdirectories.
  - Generates MD5/SHA-256-based ETags for client cache revalidation.
- **`S3StorageProvider`** (`server/storage/s3StorageProvider.ts`):
  - Implements AWS S3 / Cloudflare R2 / MinIO compatible object storage integration.
  - Automatically falls back to local storage if credentials or SDK are not configured.

---

## 3. Upload & Security Validation Pipeline

Each upload is processed by `server/utils/mimeSniffer.ts` and `server/services/media.service.ts`:

### 3.1. Magic Bytes Validation
Filename extensions can easily be forged (e.g., `exploit.exe` renamed to `exploit.png`). The media backend analyzes the raw binary header bytes:
- **PNG**: `89 50 4E 47 0D 0A 1A 0A`
- **JPEG**: `FF D8 FF`
- **GIF**: `47 49 46 38` (`GIF87a` / `GIF89a`)
- **WebP**: `52 49 46 46` ... `57 45 42 50` (`RIFF....WEBP`)
- **PDF**: `25 50 44 46` (`%PDF`)
- **ZIP**: `50 4B 03 04` (`PK..`)

### 3.2. Malicious Executable Rejection
Any payload containing signatures of executable code is immediately rejected with HTTP 400 `EXECUTABLE_REJECTED`:
- Windows PE / DOS: `4D 5A` (`MZ`)
- Linux ELF: `7F 45 4C 46` (`.ELF`)
- macOS Mach-O: `FE ED FA CE`, `FE ED FA CF`, `CF FA ED FE`
- Scripts & Web shells: `#!/`, `<?php`, `<%`

### 3.3. Category Restrictions & File Size Limits
File types and maximum sizes are strictly bound to their intended category:
| Category | Permitted MIME Types | Max Size | Primary Use Case |
|---|---|---|---|
| `projects` | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` | 10 MB | Project covers, diagrams, schematics |
| `events` | `image/jpeg`, `image/png`, `image/webp` | 10 MB | Event banners, gallery photography |
| `members` | `image/jpeg`, `image/png`, `image/webp` | 10 MB | Member headshots & avatars |
| `archive` | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` | 10 MB | Historical documents, certificates |
| `resources` | `application/pdf`, `application/zip`, `image/jpeg`, `image/png` | 25 MB | Whitepapers, firmware, manuals, datasets |

### 3.4. SVG Sanitization
SVG files uploaded to allowed categories are stripped of all script elements (`<script>`), inline JavaScript event handlers (`onload`, `onerror`, `onclick`), and external hyperlinks (`xlink:href` / `href="javascript:..."`). Public delivery of SVGs enforces `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'`.

---

## 4. Optimization & Variant Generation

When an image is uploaded:
1. **Metadata Extraction**: `sharp` inspects width, height, aspect ratio, and color space.
2. **Checksum**: A SHA-256 cryptographic digest is computed for deduplication and integrity auditing.
3. **Thumbnail Variant Generation**: If the image width is larger than 400px, a high-quality WebP thumbnail (`-thumb.webp`) is generated with a bounding box of 400x400px (preserving aspect ratio). The thumbnail key is recorded in `metadata.variants.thumbnail`.

---

## 5. Storage Key Generation

Storage keys are sanitized and guaranteed to be collision-free and path-traversal proof:
```
<category>/<YYYY>/<sanitized-filename>_<timestamp>_<hex8>.<ext>
```
Example:
`projects/2026/quadcopter-schematic_1789201179539_f104d172.png`

---

## 6. HTTP API Reference

### 6.1. Public Media Delivery
```http
GET /api/media/file/:key*
```
- **Response Headers**:
  - `Content-Type`: Exact MIME type detected at upload.
  - `Cache-Control`: `public, max-age=31536000, immutable` (for immutably keyed assets).
  - `ETag`: Strong ETag based on payload checksum.
  - `X-Content-Type-Options`: `nosniff`.
- **Conditional GET**: Supports `If-None-Match`. Returns `304 Not Modified` when cached.
- **Path Traversal Guard**: Rejects `%2e%2e`, `..`, and backslashes with HTTP 403 `PATH_TRAVERSAL_REJECTED`.

### 6.2. Administrative Media Operations (Requires Authentication)

#### Upload Asset
```http
POST /api/admin/media/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "circuit-design.png",
  "category": "projects",
  "content": "<base64-encoded-string>",
  "alt_text": "Circuit diagram of drone controller"
}
```
*Permissions*: `content_admin` or `super_admin`.

#### Replace Asset
```http
PUT /api/admin/media/:id/replace
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "circuit-design-v2.png",
  "content": "<base64-encoded-string>"
}
```
*Permissions*: `content_admin` or `super_admin`. Replaces binary data, updates dimensions and checksums, and purges previous storage files while preserving the Media Asset ID.

#### Delete Asset
```http
DELETE /api/admin/media/:id
Authorization: Bearer <token>
```
*Permissions*: `super_admin` only. Removes database record and deletes storage files (including thumbnail variants).

#### Orphan Detection & Purge
```http
GET /api/admin/media/orphans
Authorization: Bearer <token>
```
Returns all media assets not linked in `projects`, `events`, `members`, `archive_items`, or `resources`.

```http
POST /api/admin/media/orphans/cleanup
Authorization: Bearer <token>
```
*Permissions*: `super_admin` only. Deletes all unreferenced media assets and their underlying files.

---

## 7. Environment Variables

Configure storage in `.env` or `.env.local`:

```ini
# Storage Driver: 'local' (default) or 's3'
MEDIA_STORAGE_DRIVER=local

# Local storage path (ignored if driver=s3)
MEDIA_STORAGE_LOCAL_DIR=./data/media

# S3 / Cloudflare R2 / MinIO configuration (active when driver=s3)
MEDIA_STORAGE_S3_BUCKET=nexus-media-bucket
MEDIA_STORAGE_S3_REGION=us-east-1
MEDIA_STORAGE_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
MEDIA_STORAGE_S3_ACCESS_KEY_ID=your_access_key
MEDIA_STORAGE_S3_SECRET_ACCESS_KEY=your_secret_key
MEDIA_STORAGE_S3_FORCE_PATH_STYLE=false
```

---

## 8. Verification & Test Suite

Run the automated media test suite:
```bash
npm run test:media
```
Coverage includes:
1. Unauthenticated request protection (401).
2. Image upload with dimensions and SHA-256 metadata extraction.
3. PDF resource attachment upload.
4. Binary executable disguised as PNG rejection (400 `EXECUTABLE_REJECTED`).
5. Category MIME mismatch rejection (400 `MIME_NOT_ALLOWED`).
6. Maximum size enforcement (413 `FILE_TOO_LARGE`).
7. Public delivery with `Cache-Control: immutable`, `ETag`, and `304 Not Modified`.
8. Path traversal attempt rejection (403 `PATH_TRAVERSAL_REJECTED`).
9. In-place media replacement preserving asset ID.
10. Orphan detection and role-gated cleanup (403 for `content_admin`, 200 for `super_admin`).
11. Hard deletion of database records and storage files.
