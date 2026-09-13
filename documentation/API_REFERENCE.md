# NEXUS Public Read API Reference

Documentation for the public read and submission APIs serving the NEXUS platform showcase website.

---

## 1. Overview & Protocol

- **Base URL**: `http://localhost:3001/api`
- **Protocol**: HTTP/1.1 or HTTP/2
- **Data Format**: JSON (`application/json`)
- **Character Encoding**: UTF-8
- **Authentication**: Public endpoints require no authentication. Private/sensitive internal fields are omitted from all public DTO payloads.

---

## 2. Standard Response Envelope

All API endpoints return a standardized three-property JSON envelope.

### 2.1 Success Response Schema
```json
{
  "data": <payload object or array>,
  "meta": <metadata object or null>,
  "error": null
}
```

#### Pagination Metadata (`meta`)
When querying paginated collections, `meta` contains:
```json
{
  "page": 1,
  "limit": 12,
  "totalItems": 24,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### 2.2 Error Response Schema
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found with slug: non-existent-slug",
    "details": null
  }
}
```

### 2.3 Common Error Codes & Statuses
| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `INVALID_NAME`, `INVALID_EMAIL`, `BAD_REQUEST` | Missing or invalid query/body parameters. |
| `404 Not Found` | `PROJECT_NOT_FOUND`, `EVENT_NOT_FOUND`, `MEMBER_NOT_FOUND`, `ANNOUNCEMENT_NOT_FOUND`, `ARCHIVE_ITEM_NOT_FOUND`, `RESOURCE_NOT_FOUND`, `NOT_FOUND` | The requested entity or route does not exist. |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | An unexpected unhandled server exception occurred. |

---

## 3. Endpoints

### 3.1 Projects API

#### `GET /api/projects`
List projects with optional filtering, search, and pagination.

- **Query Parameters**:
  - `page` *(number, default: 1)*: Page number (1-indexed).
  - `limit` *(number, default: 12, max: 100)*: Items per page.
  - `category` *(string)*: Filter by exact category (e.g., `Technology`, `Physical Computing`).
  - `status` *(string)*: Filter by project status (`Active`, `Completed`, `Incubating`).
  - `technology` *(string)*: Filter by technology tag (e.g., `TypeScript`, `Canvas API`).
  - `featured` *(boolean)*: Filter by featured flag (`true` or `false`).
  - `q` *(string)*: Full-text search across title, summary, and technologies.

- **Sample Response**:
```json
{
  "data": [
    {
      "id": "nxs-001",
      "slug": "nxs-001",
      "projectNumber": "NXS / 001",
      "title": "ALGOLAB",
      "category": "Technology",
      "year": "2026",
      "summary": "A learning environment that helps students practice algorithms through structured repetition.",
      "description": "Algolab was built by first- and second-year students...",
      "disciplines": "TECH × EDUCATION",
      "status": "Active",
      "featured": true,
      "technologies": ["TypeScript", "Canvas API", "Algorithm Visualization", "Open Source"],
      "deliverables": ["Interactive Web Sandbox", "Curated Algorithm Visualizer", "Self-paced Exercises"],
      "coverImage": "/images/nexus/archive/drafting-nxs-001.svg",
      "demoUrl": null,
      "repositoryUrl": "https://github.com/nexus-club/algolab",
      "members": [
        {
          "id": "team-01",
          "publicId": "anshuman-tiwary",
          "name": "ANSHUMAN TIWARY",
          "role": "Project Lead",
          "photoUrl": "/images/team/anshuman-tiwary-management.webp"
        }
      ],
      "createdAt": "2026-09-12T00:00:00.000Z",
      "updatedAt": "2026-09-12T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "totalItems": 6,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "error": null
}
```

#### `GET /api/projects/featured`
Returns all featured projects sorted deterministically.

#### `GET /api/projects/:slug`
Retrieve full dossier for a single project by slug or ID. Includes embedded `members` and `relatedEvents`.

#### `GET /api/projects/:slug/members`
Returns the array of members assigned to the project.

#### `GET /api/projects/:slug/events`
Returns events related to the project.

---

### 3.2 Events API

#### `GET /api/events`
List events with pagination and filtering.

- **Query Parameters**:
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10)*
  - `status` *(string)*: `Upcoming`, `Completed`, or `Cancelled`.
  - `type` *(string)*: `Workshop`, `Showcase`, `OpenStudio`, or `Meeting`.
  - `year` *(string)*: Year substring match (e.g., `2026`).
  - `featured` *(boolean)*

- **Sample Response**:
```json
{
  "data": [
    {
      "id": "evt-001",
      "slug": "evt-001",
      "title": "NEXUS Studio Open Sprint: Hardware & Interface Lab",
      "description": "Hands-on exploration of sensory computing...",
      "eventType": "OpenStudio",
      "date": "OCT 24, 2026",
      "time": "18:00 - 21:00",
      "venue": "SOA Main Lab // Room 304",
      "registrationUrl": "https://nexus.campus/events/open-studio",
      "coverImage": null,
      "featured": true,
      "status": "Upcoming",
      "createdAt": "2026-09-12T00:00:00.000Z",
      "updatedAt": "2026-09-12T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "error": null
}
```

#### `GET /api/events/upcoming`
Direct shortcut returning upcoming events sorted by date ascending.

#### `GET /api/events/past`
Direct shortcut returning completed events sorted by date descending.

#### `GET /api/events/featured`
Returns featured spotlight events.

#### `GET /api/events/:slug`
Retrieve single event by slug or ID.

---

### 3.3 Members API

#### `GET /api/members`
List active public squad members.

- **Query Parameters**:
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 24)*
  - `role` *(string)*: Filter by role substring.
  - `domain` *(string)*: Filter by domain/discipline substring.
  - `q` *(string)*: Search across member name, role, and domain.

- **Sample Response**:
```json
{
  "data": [
    {
      "id": "team-01",
      "publicId": "anshuman-tiwary",
      "name": "ANSHUMAN TIWARY",
      "role": "Management Lead",
      "domain": "Management & Strategy",
      "bio": "Directs sprint logistics and operations.",
      "photoUrl": "/images/team/anshuman-tiwary-management.webp",
      "imagePosition": "center 18%",
      "socials": {
        "github": "https://github.com",
        "linkedin": "https://linkedin.com"
      },
      "status": "active",
      "joinedDate": "2026-09-01",
      "createdAt": "2026-09-12T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 24,
    "totalItems": 24,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "error": null
}
```

#### `GET /api/members/:publicId`
Retrieve public profile for a single member by `publicId` (e.g. `anshuman-tiwary`) or ID.

---

### 3.4 Announcements API

#### `GET /api/announcements`
List active published announcements (drafts are never returned publicly).

#### `GET /api/announcements/:id`
Retrieve single published announcement. Returns 404 if not found or unpublished.

---

### 3.5 Archive API

#### `GET /api/archive`
List gallery chronicle items.

- **Query Parameters**:
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 14)*
  - `category` *(string)*: Filter by category (`Workshops`, `Projects`, `People`, `Events`, etc.).
  - `year` *(string)*: Filter by year (e.g. `2026`).
  - `q` *(string)*: Full-text search across title, caption, and description.

#### `GET /api/archive/:id`
Retrieve single chronicle item.

---

### 3.6 Resources API

#### `GET /api/resources`
List published resources, design guidelines, CAD schematics, and templates.

- **Query Parameters**:
  - `category` *(string)*: `Guide`, `Schematic`, `DesignSystem`, `StarterKit`.
  - `tag` *(string)*: Filter by tag name.
  - `q` *(string)*: Search title and description.

#### `GET /api/resources/:id`
Retrieve single published resource.

---

### 3.7 Recruitment / Contact Submissions API

#### `POST /api/submissions`
Public contact and squad collaboration submission endpoint.

- **Request Body**:
```json
{
  "fullName": "Maya Lin",
  "email": "maya@university.edu",
  "intent": "COLLABORATE WITH US",
  "majorOrAffiliation": "Media Arts",
  "message": "Interested in sensory interface prototyping."
}
```

- **Validation Rules**:
  - `fullName`: Required, non-empty string.
  - `email`: Required, valid email string containing `@`.
  - `intent`: Optional string (defaults to `COLLABORATE WITH US`).
  - `majorOrAffiliation`: Optional string.
  - `message`: Optional string.

- **Success Response (`HTTP 201 Created`)**:
```json
{
  "data": {
    "id": "sub-1773452391000-a1b2c",
    "name": "Maya Lin",
    "email": "maya@university.edu",
    "category": "COLLABORATE WITH US",
    "message": "Interested in sensory interface prototyping.",
    "status": "Unread",
    "createdAt": "2026-09-12T01:39:51.000Z"
  },
  "meta": {
    "message": "Submission successfully received. The NEXUS squad will be in touch."
  },
  "error": null
}
```

---

### 3.8 Site Configuration API

#### `GET /api/site-config`
Retrieve global public site configuration (term schedules, community links, studio hours).
