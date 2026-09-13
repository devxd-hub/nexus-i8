# NEXUS Repository File Structure & Reorganization Plan

**Status:** AUDIT COMPLETE — PLAN READY FOR REVIEW  
**Scope:** File organization and modular separation into clean `/frontend` and `/backend` application roots without modifying any application behavior or business logic.

---

## 1. Full Repository Audit & Inventory

### Root Configuration & Workspace Metadata
| File | Current Location | Classification | Proposed Action |
|---|---|---|---|
| `package.json` | `/package.json` | Root Config | Keep in Root (Unified workspace scripts for dev, build, test, lint) |
| `package-lock.json` | `/package-lock.json` | Root Config | Keep in Root |
| `tsconfig.json` | `/tsconfig.json` | Root Config | Update paths / aliases for `/frontend` and `/backend` |
| `vite.config.ts` | `/vite.config.ts` | Frontend Config | Move to `/frontend/vite.config.ts` or configure root to `frontend/` |
| `index.html` | `/index.html` | Frontend Entry | Move to `/frontend/index.html` |
| `.env.example` | `/.env.example` | Root Config | Keep in Root |
| `.gitignore` | `/.gitignore` | Root Config | Keep in Root |
| `vercel.json` | `/vercel.json` | Deployment Config | Keep in Root (update output/build directory) |

---

### Frontend Inventory (`src/` & `public/`)
| Directory / Component | Current Location | Classification | Proposed Location |
|---|---|---|---|
| **App Entry & Root** | `src/App.tsx`, `src/main.tsx`, `src/index.css` | FRONTEND | `frontend/src/` |
| **Tokens & Types** | `src/tokens.ts`, `src/types.ts`, `src/vite-env.d.ts` | FRONTEND | `frontend/src/` |
| **Pages** | `src/pages/` (6 pages: Home, About, Projects, Gallery, Team, Contact) | FRONTEND | `frontend/src/pages/` |
| **Contexts** | `src/context/` (ThemeContext, CinematicTransitionContext) | FRONTEND | `frontend/src/context/` |
| **UI Primitives** | `src/components/primitives/` (Button, Container, Divider, ProjectCard, etc.) | FRONTEND | `frontend/src/components/primitives/` |
| **Brand Components** | `src/components/brand/` (NexusLogo, MetallicPaint) | FRONTEND | `frontend/src/components/brand/` |
| **Home Components** | `src/components/home/` (Hero, AboutPreview, ProcessSection, etc.) | FRONTEND | `frontend/src/components/home/` |
| **About Components** | `src/components/about/` (AboutSection01-06, StoryScroll, AsciiGlitch) | FRONTEND | `frontend/src/components/about/` |
| **Team Components** | `src/components/team/` (LeadershipShowcase, CrewDirectory, ProfileOverlay) | FRONTEND | `frontend/src/components/team/` |
| **Linux Desktop System** | `src/components/linux/` (Desktop, Terminal, Dock, Window, FileManager) | FRONTEND | `frontend/src/components/linux/` |
| **Mascot System** | `src/components/mascot/` (NexusPenguin, InteractiveFooterPenguin, etc.) | FRONTEND | `frontend/src/components/mascot/` |
| **Motion Primitives** | `src/components/motion/` (CinematicThemeTransition, PixelBlast, FluidGlass) | FRONTEND | `frontend/src/components/motion/` |
| **Layout & Navigation** | `src/components/layout/` (Navbar, Footer, ThemeToggle) | FRONTEND | `frontend/src/components/layout/` |
| **Cursor & Preloader** | `src/components/cursor/`, `src/components/preloader/` | FRONTEND | `frontend/src/components/` |
| **Client Utilities** | `src/lib/utils.ts` | FRONTEND | `frontend/src/lib/` |
| **Static Data** | `src/data/nexusData.ts` | FRONTEND | `frontend/src/data/` |
| **Static Assets** | `public/` (images, mascot, gallery, favicon) | FRONTEND | `frontend/public/` |
| **Source Assets** | `src/assets/cn/` (Coding Ninjas logos) | FRONTEND | `frontend/src/assets/cn/` |

---

### Backend Inventory (`server/`)
| Directory / Component | Current Location | Classification | Proposed Location |
|---|---|---|---|
| **Server App & Routes** | `server/app.ts`, `server/routes.ts`, `server/index.ts` | BACKEND | `backend/` |
| **Server Configuration** | `server/config/index.ts` | BACKEND | `backend/config/` |
| **Database Engine** | `server/db/connection.ts`, `schema.ts`, `migrate.ts`, `seed.ts`, `seedData.ts` | BACKEND | `backend/db/` |
| **Repositories** | `server/db/repositories/` (12 domain repositories) | BACKEND | `backend/db/repositories/` |
| **Domain Modules** | `server/domains/` (admin, auth, members, projects, events, archive, media, etc.) | BACKEND | `backend/domains/` |
| **Server Middleware** | `server/middleware/` (auth, rateLimiter, securityHeaders, errorHandler, etc.) | BACKEND | `backend/middleware/` |
| **Cross-Cutting Services**| `server/services/` (audit.service, media.service, notificationHook.service) | BACKEND | `backend/services/` |
| **Storage Providers** | `server/storage/` (localStorageProvider, s3StorageProvider) | BACKEND | `backend/storage/` |
| **Backend Utilities** | `server/utils/` (apiResponse, crypto, mimeSniffer, cache) | BACKEND | `backend/utils/` |
| **Automated Tests** | `server/tests/` (api, admin, media, submissions, hardening) | BACKEND | `backend/tests/` |

---

### Database Storage, Scripts & Documentation
| Directory / File | Current Location | Classification | Proposed Location |
|---|---|---|---|
| **SQLite Runtime Database**| `data/nexus.db` | GENERATED / RUNTIME | `data/` (ignored in git, created on startup) |
| **Utility Scripts** | `scripts/` (measure-perf.ts, sync-team-images.ts, etc.) | SCRIPTS | `scripts/` |
| **Documentation** | `API_REFERENCE.md`, `ADMIN_API_REFERENCE.md`, `BACKEND_ARCHITECTURE.md`, `MEDIA_STORAGE.md`, `CHANGELOG.md`, `PERFORMANCE_BASELINE.md`, `PERFORMANCE_OPTIMIZATION_REPORT.md`, `CODEBASE_OPTIMIZATION_REPORT.md`, `README.md` | DOCUMENTATION | `docs/` or Root |

---

## 2. Cross-Boundary Dependency Audit

Only two cross-boundary references currently exist between backend and frontend:
1. `backend/domains/*/model.ts` references TypeScript type definitions (`Project`, `TeamMember`, `GalleryItem`).
   - *Resolution*: Move shared domain types into a clean backend-internal model file or shared type definitions in `backend/types.ts` / `frontend/src/types.ts` ensuring clean decoupling.
2. `backend/db/seedData.ts` initializes fallback seed data from `nexusData.ts`.
   - *Resolution*: Keep self-contained database seed definitions within `backend/db/seedData.ts` so backend has zero runtime coupling to frontend folder structures.

---

## 3. Proposed Final Repository Tree

```
nexus-i8/
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── gallery-img/
│   │   ├── images/
│   │   │   ├── nexus/
│   │   │   └── team/
│   │   ├── mascot/
│   │   │   └── penguin/
│   │   └── team-images/
│   ├── src/
│   │   ├── assets/
│   │   │   └── cn/
│   │   ├── components/
│   │   │   ├── about/
│   │   │   ├── brand/
│   │   │   ├── cursor/
│   │   │   ├── home/
│   │   │   │   └── process/
│   │   │   ├── layout/
│   │   │   ├── linux/
│   │   │   ├── mascot/
│   │   │   ├── motion/
│   │   │   ├── preloader/
│   │   │   ├── primitives/
│   │   │   └── team/
│   │   ├── context/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── tokens.ts
│   │   ├── types.ts
│   │   └── vite-env.d.ts
│   ├── index.html
│   └── vite.config.ts
│
├── backend/
│   ├── config/
│   │   └── index.ts
│   ├── db/
│   │   ├── repositories/
│   │   │   ├── announcements.repository.ts
│   │   │   ├── archive.repository.ts
│   │   │   ├── auditLogs.repository.ts
│   │   │   ├── authUsers.repository.ts
│   │   │   ├── base.repository.ts
│   │   │   ├── events.repository.ts
│   │   │   ├── mediaAssets.repository.ts
│   │   │   ├── members.repository.ts
│   │   │   ├── projects.repository.ts
│   │   │   ├── recruitment.repository.ts
│   │   │   ├── resources.repository.ts
│   │   │   ├── siteSettings.repository.ts
│   │   │   └── submissions.repository.ts
│   │   ├── connection.ts
│   │   ├── migrate.ts
│   │   ├── schema.ts
│   │   ├── seed.ts
│   │   └── seedData.ts
│   ├── domains/
│   │   ├── admin/
│   │   ├── announcements/
│   │   ├── archive/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── media/
│   │   ├── members/
│   │   ├── projects/
│   │   ├── recruitment/
│   │   ├── resources/
│   │   ├── site-config/
│   │   └── submissions/
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestId.ts
│   │   ├── requestLogger.ts
│   │   ├── securityHeaders.ts
│   │   ├── spamProtection.ts
│   │   └── validate.ts
│   ├── services/
│   │   ├── audit.service.ts
│   │   ├── media.service.ts
│   │   └── notificationHook.service.ts
│   ├── storage/
│   │   ├── localStorageProvider.ts
│   │   ├── s3StorageProvider.ts
│   │   ├── storageProvider.interface.ts
│   │   └── index.ts
│   ├── tests/
│   │   ├── admin.test.ts
│   │   ├── api.test.ts
│   │   ├── hardening.test.ts
│   │   ├── media.test.ts
│   │   └── submissions.test.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   ├── cache.ts
│   │   ├── crypto.ts
│   │   └── mimeSniffer.ts
│   ├── app.ts
│   ├── routes.ts
│   └── index.ts
│
├── data/
│   └── nexus.db
├── scripts/
│   ├── measure-perf.ts
│   ├── sync-team-images.ts
│   └── generate-archive-assets.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json
├── README.md
├── CHANGELOG.md
└── (Technical Documentation Markdown files)
```

---

## 4. Import & Path Migration Verification

Every internal import path has been traced:
- **Frontend Internal Paths**: All `src/components/*`, `src/pages/*`, `src/context/*`, `src/lib/*` use relative imports (e.g., `../components/...`, `./primitives/...`). When moving under `frontend/src/`, all intra-frontend relative imports remain 100% intact without breaking.
- **Backend Internal Paths**: All `server/domains/*`, `server/db/*`, `server/middleware/*`, `server/services/*`, `server/utils/*` use relative imports (e.g., `../../db/repositories/...`, `../../middleware/...`). When moving under `backend/`, all intra-backend relative imports remain 100% intact.
- **Root Scripts**: `package.json` scripts will cleanly map:
  - `"dev"`: `"vite --root frontend --port=3000 --host=0.0.0.0"` (or cd frontend)
  - `"build"`: `"vite build frontend"`
  - `"lint"`: `"tsc --noEmit"`
  - `"server:dev"`: `"tsx backend/index.ts"`
  - `"server:start"`: `"node --import=tsx backend/index.ts"`
  - `"test"`: `"tsx backend/tests/api.test.ts && tsx backend/tests/admin.test.ts ..."`

---

## 5. Execution Safeguards

1. **Behavioral Freeze Guarantee**: Reorganization will not alter any runtime code logic, component render trees, API endpoints, or database queries.
2. **Step-by-step Transition**: Move files -> update path references -> update package.json & tsconfig -> run `npm run lint` -> run `npm run test` (all 163 tests) -> run `npm run build`.
