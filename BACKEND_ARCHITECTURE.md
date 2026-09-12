# NEXUS Backend Architecture Specification

## 1. System Audit & Baseline Assessment

### 1.1 Current Stack Audit
| Component | Existing Technology | Status / Observations |
| :--- | :--- | :--- |
| **Runtime & Language** | Node.js (ES Modules, `"type": "module"`) + TypeScript ~5.8 | Fully supported, `tsx` and `@types/node` installed |
| **Frontend Framework** | React 19 (`^19.0.1`), Vite 6 (`^6.2.3`), Tailwind CSS v4 | SPA with client-side history routing (`AppRoute`) |
| **Existing Backend** | Express (`express: ^4.21.2`, `@types/express: ^4.17.21`) | Pre-installed dependencies in `package.json`, no server code implemented yet |
| **Database & ORM** | None installed | Initial mock data stored in static TS files (`src/data/nexusData.ts`) |
| **Authentication** | None | Public read-only client experience, client-side contact submission state |
| **Environment Config** | `dotenv` installed (`^17.2.3`), `.env.example` has `DISABLE_HMR=true` | Ready for backend environment variable configuration |
| **Storage & Assets** | Static files in `public/`, raw source media in `assets/` | Sharp installed for image processing (`^0.35.4`) |
| **Deployment** | Vercel (`vercel.json` SPA rewrite to `/index.html`) | Ready for hybrid deployment (Vite client + Express API / Serverless functions) |

### 1.2 Architectural Principles & Guardrails
1. **Zero Frontend Disruption**: Frontend files, routes, visual design, and data contracts remain strictly untouched.
2. **Framework Reuse**: Express 4 is already an approved dependency; no additional or competing backend frameworks (Nest, Fastify, Koa) will be introduced.
3. **No Fabricated Production Data**: Seed and initial domain models mirror the authentic NEXUS data defined in `src/data/nexusData.ts`.
4. **Clean Separation of Concerns**: Strict boundary between API routes, controllers, business services, validation, data models, and storage.
5. **Progressive Database Decoupling**: Abstract repository interfaces allow immediate in-memory / JSON file persistence without requiring external database instances, while preparing drop-in database adapter migration (SQLite / PostgreSQL / Prisma).

---

## 2. Directory & Component Structure

All backend code is organized under `server/`:

```text
server/
├── config/                  # Environment variables, constants, port settings, CORS
│   └── index.ts
├── db/                      # Repository abstractions, seed providers, persistence adapters
│   ├── memoryRepository.ts  # In-memory typed repository provider with seed capabilities
│   └── seedData.ts          # Canonical seed data derived from NEXUS authentic data
├── middleware/              # Express middlewares (logging, validation, error handling, auth)
│   ├── errorHandler.ts      # Global centralized RFC 7807 problem details error handler
│   ├── requestLogger.ts     # HTTP request telemetry & execution timing
│   └── validate.ts          # Request schema validation middleware
├── domains/                 # Domain-driven feature modules
│   ├── members/             # Team members & leadership
│   │   ├── members.model.ts
│   │   ├── members.service.ts
│   │   ├── members.controller.ts
│   │   └── members.routes.ts
│   ├── projects/            # Engineering & creative projects
│   │   ├── projects.model.ts
│   │   ├── projects.service.ts
│   │   ├── projects.controller.ts
│   │   └── projects.routes.ts
│   ├── events/              # Workshops, showcases, open studio sessions
│   │   ├── events.model.ts
│   │   ├── events.service.ts
│   │   ├── events.controller.ts
│   │   └── events.routes.ts
│   ├── announcements/       # Bulletins & community updates
│   │   ├── announcements.model.ts
│   │   ├── announcements.service.ts
│   │   ├── announcements.controller.ts
│   │   └── announcements.routes.ts
│   ├── archive/             # Chronicle gallery items, media metadata
│   │   ├── archive.model.ts
│   │   ├── archive.service.ts
│   │   ├── archive.controller.ts
│   │   └── archive.routes.ts
│   ├── resources/           # Learning modules, templates, CAD & code repos
│   │   ├── resources.model.ts
│   │   ├── resources.service.ts
│   │   ├── resources.controller.ts
│   │   └── resources.routes.ts
│   ├── submissions/         # Contact inquiries & recruitment applications
│   │   ├── submissions.model.ts
│   │   ├── submissions.service.ts
│   │   ├── submissions.controller.ts
│   │   └── submissions.routes.ts
│   ├── site-config/         # Site metadata, announcements ticker, feature flags
│   │   ├── siteConfig.model.ts
│   │   ├── siteConfig.service.ts
│   │   ├── siteConfig.controller.ts
│   │   └── siteConfig.routes.ts
│   └── auth/                # Admin users, credentials, authorization
│       ├── auth.model.ts
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       └── auth.routes.ts
├── storage/                 # Storage engine abstraction (local public assets, future S3/GCS)
│   └── index.ts
├── routes.ts                # Master API router aggregating domain subrouters
├── app.ts                   # Express application assembly
└── index.ts                 # Server entry point, port binding, graceful shutdown
```

---

## 3. Domain Specifications

### 3.1 Members Domain (`/api/members`)
- **Entity**: `TeamMember`
- **Fields**: `id`, `name`, `role`, `group`, `discipline`, `yearOfStudy`, `bio`, `imageUrl`, `imagePosition`, `socials`, `createdAt`, `updatedAt`
- **Operations**: `GET /api/members` (filterable by group, query), `GET /api/members/:id`, `POST /api/members` (admin), `PUT /api/members/:id` (admin), `DELETE /api/members/:id` (admin).

### 3.2 Projects Domain (`/api/projects`)
- **Entity**: `Project`
- **Fields**: `id`, `projectNumber`, `title`, `category`, `year`, `summary`, `description`, `disciplines`, `status`, `leadStudents`, `tags`, `deliverables`, `githubUrl`, `demoUrl`, `createdAt`, `updatedAt`
- **Operations**: `GET /api/projects` (filterable by category, status, year), `GET /api/projects/:id`, `POST /api/projects` (admin), `PUT /api/projects/:id` (admin), `DELETE /api/projects/:id` (admin).

### 3.3 Events Domain (`/api/events`)
- **Entity**: `Event`
- **Fields**: `id`, `title`, `type` (`Workshop`, `Showcase`, `OpenStudio`, `Meeting`), `date`, `time`, `location`, `description`, `rsvpUrl`, `status` (`Upcoming`, `Completed`), `createdAt`
- **Operations**: `GET /api/events`, `GET /api/events/:id`, `POST /api/events` (admin), `PUT /api/events/:id` (admin), `DELETE /api/events/:id` (admin).

### 3.4 Announcements Domain (`/api/announcements`)
- **Entity**: `Announcement`
- **Fields**: `id`, `title`, `content`, `priority` (`Normal`, `Urgent`), `active`, `publishedAt`, `expiresAt`
- **Operations**: `GET /api/announcements` (active announcements), `POST /api/announcements` (admin), `PUT /api/announcements/:id` (admin).

### 3.5 Archive / Media Domain (`/api/archive`)
- **Entity**: `GalleryItem` / `ArchiveItem`
- **Fields**: `id`, `title`, `category`, `eventDate`, `location`, `author`, `imageUrl`, `caption`, `description`, `aspectRatio`, `createdAt`
- **Operations**: `GET /api/archive`, `GET /api/archive/:id`, `POST /api/archive` (admin), `DELETE /api/archive/:id` (admin).

### 3.6 Resources Domain (`/api/resources`)
- **Entity**: `Resource`
- **Fields**: `id`, `title`, `category` (`Guide`, `Schematic`, `DesignSystem`, `StarterKit`), `description`, `url`, `tags`, `createdAt`
- **Operations**: `GET /api/resources`, `POST /api/resources` (admin).

### 3.7 Recruitment / Contact Submissions Domain (`/api/submissions`)
- **Entity**: `ContactSubmission`
- **Fields**: `id`, `intent` (`COLLABORATE WITH US`, `ASK A QUESTION`), `fullName`, `email`, `majorOrAffiliation`, `message`, `status` (`Unread`, `Reviewed`, `Archived`), `createdAt`
- **Operations**: `POST /api/submissions` (public with validation), `GET /api/submissions` (admin), `PATCH /api/submissions/:id/status` (admin).

### 3.8 Site Configuration Domain (`/api/site-config`)
- **Entity**: `SiteConfig`
- **Fields**: `name`, `description`, `semester`, `currentCohort`, `meetingSchedule`, `socialLinks`, `featureFlags`
- **Operations**: `GET /api/site-config` (public), `PUT /api/site-config` (admin).

### 3.9 Auth & Admin Domain (`/api/auth`)
- **Entity**: `AdminUser`
- **Fields**: `id`, `email`, `role` (`SuperAdmin`, `Editor`), `passwordHash`, `lastLogin`
- **Operations**: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

---

## 4. Layered Separation of Concerns

```text
[HTTP Request]
       │
       ▼
[Middlewares: CORS, JSON Parser, Request Logger]
       │
       ▼
[Validation Middleware: Schema & Type Guards]
       │
       ▼
[Controller: HTTP Status Codes, Response Formatting]
       │
       ▼
[Service Layer: Business Invariants, Data Rules]
       │
       ▼
[Repository Interface: IRepository<T>]
       │
       ├──► [Memory / Seed Provider] (Current Foundation)
       └──► [Database Adapter: PostgreSQL / SQLite] (Future Migration)
```

---

## 5. Storage Strategy
- Static images continue to be hosted from `public/` and served with high performance.
- Any future user-uploaded assets will go through a dedicated storage provider interface:
  ```ts
  export interface IStorageService {
    saveFile(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
  }
  ```
- Local disk adapter stores uploads in a designated upload folder (`public/uploads/`).

---

## 6. Development & Run Scripts
- `npm run dev`: Runs Vite frontend dev server (port 3000).
- `npm run server:dev`: Runs Express backend with live TypeScript reload via `tsx` (port 3001).
- `npm run build`: Builds Vite frontend bundle.
- `npm run lint`: Runs TypeScript validation across the entire workspace.
