# NEXUS Secure Admin Backend API Reference

Comprehensive specification and guide for the administrative backend APIs powering NEXUS content management, user administration, and system configuration.

All administrative routes are prefixed with `/api/admin`.

---

## 1. Authentication & Security Architecture

### Authentication Mechanism
- **Password Storage**: Passwords are encrypted using Node 22 native `scrypt` (`crypto.scrypt`) with an individual, cryptographically secure 16-byte random salt per user. Timing-safe comparison (`crypto.timingSafeEqual`) is enforced during verification to prevent side-channel timing attacks.
- **Session Tokens**: 32-byte cryptographically random hex tokens (`crypto.randomBytes(32)`). The raw token is delivered to the client; the SHA-256 hash (`token_hash`) is indexed and stored in SQLite `admin_sessions`.
- **Transmission**:
  - **Header**: `Authorization: Bearer <session_token>`
  - **Cookie**: Secure `HttpOnly` cookie named `nexus_admin_session` (`SameSite=Strict`, `Path=/api`).
- **Session Expiry**: Sessions are valid for 24 hours. Expired sessions are rejected automatically.

### Brute-Force & Lockout Protection
- Tracks consecutive failed attempts on `admin_users.failed_attempts`.
- After **5 consecutive failed attempts**, the account is locked for **15 minutes** (`locked_until`).
- Additional IP-level sliding window rate limiter protects `/api/admin/auth/login` (max 15 attempts per 15 minutes per IP).

### Roles & Permission Matrix

| Operation | `super_admin` | `content_admin` |
| :--- | :---: | :---: |
| **Manage Admins** (Create, Read, Update, Delete) | ✅ | ❌ (403 Forbidden) |
| **Modify Site Settings** | ✅ | ❌ (403 Forbidden) |
| **View Audit Logs** | ✅ | ❌ (403 Forbidden) |
| **Create & Edit Projects** | ✅ | ✅ |
| **Create & Edit Events** | ✅ | ✅ |
| **Create & Edit Announcements** | ✅ | ✅ |
| **Create & Edit Archive Chronicles** | ✅ | ✅ |
| **Create & Edit Resources** | ✅ | ✅ |
| **Manage Media Metadata** | ✅ | ✅ |
| **Transition Content to Archived** | ✅ | ❌ (403 Forbidden) |
| **Delete Any Content / Member** | ✅ | ❌ (403 Forbidden) |

---

## 2. Standard Response Format

### Success Envelope (`200 OK` / `201 Created`)
```json
{
  "data": { ... } | [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "error": null
}
```

### Error Envelope (`400`, `401`, `403`, `404`, `409`, `423`)
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Forbidden: This action requires super_admin permissions"
  }
}
```

---

## 3. Authentication Endpoints

### `POST /api/admin/auth/login`
Authenticates administrative credentials and generates a session.

- **Access**: Public (Protected by IP rate limiting and account lockout)
- **Request Body**:
  ```json
  {
    "email": "admin@nexus.campus",
    "password": "NexusAdmin!2026"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "data": {
      "user": {
        "id": "admin-001",
        "email": "admin@nexus.campus",
        "name": "NEXUS Super Administrator",
        "role": "super_admin",
        "status": "active",
        "failed_attempts": 0,
        "locked_until": null,
        "last_login_at": "2026-09-12T07:30:00.000Z",
        "created_at": "2026-09-01T00:00:00.000Z",
        "updated_at": "2026-09-12T07:30:00.000Z"
      },
      "token": "d8a7...64-char-hex...",
      "expiresAt": "2026-09-13T07:30:00.000Z"
    },
    "meta": { "message": "Administrative authentication successful" },
    "error": null
  }
  ```
- **Error Codes**:
  - `400 INVALID_EMAIL` / `400 INVALID_PASSWORD`
  - `401 INVALID_CREDENTIALS`
  - `403 ACCOUNT_INACTIVE`
  - `423 ACCOUNT_LOCKED` (Temporarily locked due to 5 failed attempts)
  - `429 RATE_LIMITED`

### `POST /api/admin/auth/logout`
Invalidates the current session and clears the session cookie.

- **Access**: Requires Authentication (`requireAuth`)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "data": { "loggedOut": true },
    "meta": { "message": "Administrative session terminated successfully" },
    "error": null
  }
  ```

### `GET /api/admin/auth/me`
Retrieves identity, assigned role, and permissions for the authenticated session.

- **Access**: Requires Authentication (`requireAuth`)
- **Response `200 OK`**:
  ```json
  {
    "data": {
      "user": { "id": "admin-001", "email": "admin@nexus.campus", "name": "...", "role": "super_admin" },
      "role": "super_admin",
      "permissions": ["manage_admins", "manage_all_content", "publish_unpublish", "delete_archive_content", "modify_site_settings", "view_audit_logs"],
      "session": { "sessionId": "sess-...", "expiresAt": "..." }
    },
    "meta": null,
    "error": null
  }
  ```

---

## 4. Admin Users Management (`super_admin` only)

### `GET /api/admin/users`
Lists all administrative users with sanitized fields (password hashes and salts are strictly excluded).

### `POST /api/admin/users`
Creates a new administrative account.
- **Request Body**:
  ```json
  {
    "name": "Alex Taylor",
    "email": "alex@nexus.campus",
    "password": "SecurePassword123!",
    "role": "content_admin"
  }
  ```
- **Status Codes**: `201 Created`, `400 WEAK_PASSWORD`, `409 EMAIL_EXISTS`.

### `PATCH /api/admin/users/:id`
Updates administrative details, role, status (`active`, `inactive`, `suspended`), or password. Deactivating an account immediately revokes all active sessions.

### `DELETE /api/admin/users/:id`
Permanently removes an administrator. Self-deletion is rejected with `400 CANNOT_DELETE_SELF`.

---

## 5. Content Lifecycle & Workflow (`DRAFT` → `PUBLISHED` → `ARCHIVED`)

All content models adhere to the lifecycle states:
1. **`Draft`**: Stored in the database and visible via `/api/admin/*` endpoints. Strictly filtered out and hidden from public read APIs (`/api/projects`, `/api/events`, etc.).
2. **`Published`**: Active and publicly showcased on the NEXUS website.
3. **`Archived`**: Preserved in administrative history; removed from public active showcases where applicable. Only `super_admin` can archive or delete content.

### Status Transition Endpoint Pattern
`PATCH /api/admin/:domain/:id/status`
```json
{
  "status": "Published"
}
```

---

## 6. Domain Management Endpoints

### 🚀 Projects (`/api/admin/projects`)
- `GET /api/admin/projects`: List projects across all statuses. Supports `page`, `limit`, `status`, `category`, `search`.
- `POST /api/admin/projects`: Create project in `Draft` or `Published`.
- `GET /api/admin/projects/:id`: Full project record with linked squad members and related events.
- `PUT /api/admin/projects/:id`: Update project details. Supports optimistic concurrency protection (`expected_updated_at` or `If-Match`).
- `PATCH /api/admin/projects/:id/status`: Transition between `Draft`, `Published`, and `Archived`.
- `POST /api/admin/projects/:id/members`: Assign team member with squad role.
- `DELETE /api/admin/projects/:id/members/:memberId`: Unlink team member from project.
- `DELETE /api/admin/projects/:id`: (`super_admin` only) Permanently delete project and cascade junction table records.

### 📅 Events (`/api/admin/events`)
- `GET /api/admin/events`: List events across all statuses (`Draft`, `Upcoming`, `Completed`, `Cancelled`, `Archived`).
- `POST /api/admin/events`: Create event.
- `GET /api/admin/events/:id`: Event details.
- `PUT /api/admin/events/:id`: Update event with concurrency check.
- `PATCH /api/admin/events/:id/status`: Update status.
- `DELETE /api/admin/events/:id`: (`super_admin` only) Delete event.

### 👥 Members (`/api/admin/members`)
- `GET /api/admin/members`: List members with internal administrative fields (private emails, joined dates, timestamps, status).
- `POST /api/admin/members`: Create member profile.
- `GET /api/admin/members/:id`: Full member record.
- `PUT /api/admin/members/:id`: Update member details with concurrency check.
- `DELETE /api/admin/members/:id`: (`super_admin` only) Remove member.

### 📢 Announcements (`/api/admin/announcements`)
- `GET /api/admin/announcements`: List announcements (`draft`, `published`, `archived`).
- `POST /api/admin/announcements`: Create announcement.
- `GET /api/admin/announcements/:id`: Announcement details.
- `PUT /api/admin/announcements/:id`: Update announcement.
- `PATCH /api/admin/announcements/:id/status`: Publish or archive bulletin.
- `DELETE /api/admin/announcements/:id`: (`super_admin` only) Delete announcement.

### 🏛️ Archive (`/api/admin/archive`)
- `GET /api/admin/archive`: List archive chronicle items.
- `POST /api/admin/archive`: Create archive item.
- `GET /api/admin/archive/:id`: Archive item details.
- `PUT /api/admin/archive/:id`: Update archive item.
- `PATCH /api/admin/archive/:id/status`: Update status.
- `DELETE /api/admin/archive/:id`: (`super_admin` only) Delete archive item.

### 📚 Resources (`/api/admin/resources`)
- `GET /api/admin/resources`: List resources.
- `POST /api/admin/resources`: Create resource.
- `GET /api/admin/resources/:id`: Resource details.
- `PUT /api/admin/resources/:id`: Update resource.
- `PATCH /api/admin/resources/:id/status`: Publish or archive resource.
- `DELETE /api/admin/resources/:id`: (`super_admin` only) Delete resource.

### 🖼️ Media Metadata (`/api/admin/media`)
- `GET /api/admin/media`: List media assets with search and pagination.
- `POST /api/admin/media`: Register uploaded asset metadata (`storageKey`, `filename`, `mimeType`, `fileSize`, `metadata`).
- `GET /api/admin/media/:id`: Asset metadata.
- `PUT /api/admin/media/:id`: Update asset metadata.
- `DELETE /api/admin/media/:id`: (`super_admin` only) Delete media record.

### ⚙️ Site Settings (`/api/admin/site-settings`, `super_admin` only)
- `GET /api/admin/site-settings`: Returns all global key-value configuration pairs.
- `PUT /api/admin/site-settings`: Batch update site settings:
  ```json
  {
    "settings": {
      "site_name": "NEXUS Lab",
      "current_term": "Spring 2027"
    }
  }
  ```

---

## 7. Audit Logging (`/api/admin/audit-logs`, `super_admin` only)

Every state-altering administrative operation is automatically recorded in `audit_logs`:
- Actions: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `CREATE`, `UPDATE`, `STATUS_CHANGE`, `PUBLISH`, `ARCHIVE`, `DELETE`, `ADD_MEMBER`, `REMOVE_MEMBER`.
- Entities: `PROJECT`, `EVENT`, `MEMBER`, `ANNOUNCEMENT`, `ARCHIVE`, `RESOURCE`, `MEDIA`, `SITE_SETTINGS`, `ADMIN_USER`.

### `GET /api/admin/audit-logs`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20, max: 100)
  - `action`: Filter by action (e.g. `LOGIN_SUCCESS`, `CREATE`, `DELETE`)
  - `entityType`: Filter by entity (e.g. `PROJECT`, `ADMIN_USER`)
  - `adminId`: Filter by administrator ID
- **Example Entry**:
  ```json
  {
    "id": "aud-1789198608800-4b8c9d",
    "admin_id": "admin-001",
    "admin_name": "NEXUS Super Administrator",
    "admin_role": "super_admin",
    "action": "PUBLISH",
    "entity_type": "PROJECT",
    "entity_id": "nxs-001",
    "details": { "previousStatus": "Draft", "newStatus": "Published" },
    "ip_address": "127.0.0.1",
    "created_at": "2026-09-12T07:35:00.000Z"
  }
  ```
