# NEXUS | Student Innovation & Project Building Community

A student-led college community for ideation, collaboration, technology, creative production, and project building.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm` (bundled with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Initialize Database
Run migrations and populate the initial seed dataset:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Servers
In separate terminals:
```bash
# Terminal 1: Backend API Server
npm run server:dev

# Terminal 2: Frontend Vite Server (http://localhost:3000)
npm run dev
```

---

## 📁 Repository Overview

```text
/
├── frontend/             # React 19 client application & centralized /images
│   ├── images/           # Centralized image assets (team, gallery, logos, etc.)
│   ├── public/           # Static files & dev serving junctions
│   ├── src/              # Components, contexts, data, pages, and styles
│   └── index.html        # HTML entrypoint
│
├── backend/              # Node.js Express server & SQLite database
│   ├── db/               # Database client, migrations, and seed data
│   ├── domains/          # Domain services, routes, and controllers
│   ├── middleware/       # Security headers, auth, rate limiting, validation
│   ├── services/         # Media pipeline, audit logs, event hooks
│   └── tests/            # 163 backend automated tests
│
├── documentation/        # Architecture diagrams, API references, & audit reports
├── scripts/              # Developer maintenance and build scripts
└── assets/               # Source media captures archive (high-resolution originals)
```

For the complete architectural layout and domain mapping, see [**`PROJECT_STRUCTURE.md`**](PROJECT_STRUCTURE.md).

---

## 🧪 Testing & Validation

```bash
# Typecheck (TypeScript compiler)
npm run lint

# Run Backend Test Suite (163 tests across API, Admin, Media, Submissions, Hardening)
npm run test

# Production Build
npm run build
```

---

## 📚 Technical Documentation

All detailed architectural documentation, API contracts, and audits live in [`/documentation`](documentation/):
- [`API_REFERENCE.md`](documentation/API_REFERENCE.md) — Public API contract specification
- [`ADMIN_API_REFERENCE.md`](documentation/ADMIN_API_REFERENCE.md) — Admin & management API endpoints
- [`BACKEND_ARCHITECTURE.md`](documentation/BACKEND_ARCHITECTURE.md) — Backend service & domain design
- [`IMAGE_DUPLICATION_REPORT.md`](documentation/IMAGE_DUPLICATION_REPORT.md) — Asset audit & SHA-256 deduplication register
- [`MEDIA_STORAGE.md`](documentation/MEDIA_STORAGE.md) — Pluggable storage architecture (Local / S3)
- [`CHANGELOG.md`](CHANGELOG.md) — Codebase evolution history
