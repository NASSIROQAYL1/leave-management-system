# PLAN.md

## Repository Baseline

- Current repository state: only `App.tsx` exists at the root.
- `App.tsx` is a prompt-kit/specification viewer, not the real application.
- There is currently no `frontend/`, no `backend/`, no database scripts, no Docker setup, and no git metadata visible in this workspace root.

## Suggested Phased Implementation

### Phase 0
- Repository preparation
- Add repository guidance files
- Confirm scope and execution rules

### Phase 1
- Backend foundation
- Create Spring Boot project structure, base configuration, domain enums/entities scaffolding, security skeleton, and initial resources layout

### Phase 2
- Frontend foundation
- Create Vite React TypeScript app structure, Tailwind/shadcn setup, routing skeleton, base layouts, theme/auth stores, and shared UI scaffolding

### Phase 3
- Authentication flow
- Implement JWT auth backend endpoints and frontend login/profile session wiring

### Phase 4
- Core leave domain
- Implement leave types, leave balances, public holidays, working-days calculation, overlap checks, and seed-aligned database schema

### Phase 5
- Leave request flow
- Implement employee request creation/history/cancel flow plus manager/admin approval pipeline

### Phase 6
- Role-based dashboards and work areas
- Implement admin, manager, and employee protected areas with key dashboard widgets and primary pages

### Phase 7
- Notifications, reports, and file handling
- Implement notification APIs/UI, file upload support, and report endpoints/export scaffolding

### Phase 8
- Local run readiness
- Add Docker setup, environment defaults, sample data, and final coherence checks across backend, frontend, and database

## Working Rule

Each phase should be completed in isolation:

1. Read first
2. Plan briefly
3. List file changes
4. Implement only the requested scope
5. Verify before closing
