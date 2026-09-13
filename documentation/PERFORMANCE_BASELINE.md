# NEXUS Performance Baseline Report

**Date Measured:** 2026-09-13  
**Environment:** Node.js v22.22.2 (x64) | Vite 6.4.3 | Windows 11  

---

## 1. Frontend Baseline Metrics

### Production Build Bundle (Vite)
- **Primary JS Chunk (`dist/assets/index-*.js`)**: **749.64 KB** (minified) / **216.88 KB** (gzip)
- **Primary CSS Stylesheet (`dist/assets/index-*.css`)**: **99.61 KB** (minified) / **16.07 KB** (gzip)
- **HTML Shell (`dist/index.html`)**: **1.68 KB** / **0.75 KB** (gzip)
- **Static Image Assets**: ~9.94 KB (clean logos)
- **Code Splitting**: None (monolithic single bundle for all routes and vendor libraries including Three.js, shaders, and React)

---

## 2. Backend Baseline Metrics

### Startup & Memory
- **Server Startup Time**: **78.99 ms**
- **Heap Memory Used**: **16.34 MB**
- **Resident Set Size (RSS)**: **110.29 MB**

### Initial Endpoint Response Latencies (Localhost HTTP Probe)
| Endpoint | Method | Latency (ms) | Cache Strategy |
|---|---|---|---|
| `/api/health` | GET | 62.33 ms | None (live SQLite probe) |
| `/api/members` | GET | 13.69 ms | None (direct DB query) |
| `/api/projects` | GET | 8.01 ms | None (direct DB query) |
| `/api/events` | GET | 7.59 ms | None (direct DB query) |
| `/api/announcements` | GET | 6.64 ms | None (direct DB query) |
| `/api/archive` | GET | 6.66 ms | None (direct DB query) |
| `/api/resources` | GET | 6.50 ms | None (direct DB query) |
| `/api/site-config` | GET | 5.59 ms | None (direct DB query) |

---

## 3. Optimization Opportunities Identified

1. **Frontend Route Code-Splitting & Vendor Chunking**:
   - `App.tsx` eagerly imports `AboutPage`, `ProjectsPage`, `TeamPage`, `GalleryPage`, and `ContactPage`.
   - Heavy dependencies (`three`, `@paper-design/shaders-react`, `motion`) are bundled inside the monolithic initial bundle.
   - Using `React.lazy` for route chunks and `rollupOptions.output.manualChunks` will dramatically drop the initial bundle weight while preserving instant navigation and zero layout shift.
2. **Backend In-Memory Response Caching with Invalidation**:
   - Read-only endpoints (`/api/members`, `/api/projects`, `/api/events`, `/api/announcements`, `/api/archive`, `/api/resources`, `/api/site-config`) query the database on every request.
   - Introducing an in-memory TTL cache with instant cache eviction on administrative mutations will slash endpoint latencies and eliminate redundant DB read work.
3. **Repository Prepared Statement Re-use**:
   - SQLite statements can be cached on repositories rather than prepared anew on every single query execution.
4. **Passive Listeners on Canvas / Scroll**:
   - Ensure all touch, wheel, and scroll listeners specify `{ passive: true }` where default is not prevented.
