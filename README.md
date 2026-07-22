# PRS — Salvage Vehicle Auction Platform

Phase 1: **Foundation & Access**  
Stack: React + TypeScript (Vite) · Node (Fastify) · PostgreSQL (Prisma)

## Quick start

```bash
# 1) Start database (uses host port 5433 to avoid local Postgres conflicts)
npm run db:up

# 2) Install dependencies (from repo root)
npm install

# 3) Migrate + seed admin
npm run db:migrate -w @prs/api
npm run db:seed -w @prs/api

# 4) Run API + Web (two terminals)
npm run dev:api
npm run dev:web
```

- Web: http://localhost:5173  
- API: http://localhost:4000/health  

### Default admin

| Field | Value |
|-------|--------|
| Email | `admin@prs.local` |
| Password | `Admin@12345` |

Change these in `apps/api/.env` before seeding for anything beyond local demo.

## Phase 1 demo checklist

1. Open landing → Sign up as Insurance / Dealer / Private Seller (policy checkbox required).  
2. Verify email via link (in development the link is logged in the API console and shown on the verify page after **Resend**).  
3. New accounts then wait on **Awaiting approval**.  
4. Login as admin → **Approve** users.  
5. Approved + verified users reach **/dashboard**; suspended users cannot log in.

## Project layout

```
apps/api          Fastify + Prisma + Zod auth & admin APIs
apps/web          React + Tailwind UI (green/white PRS theme)
docker-compose.yml
docs/             Client & phase-plan documents (not runtime code)
PROJECT_CONTEXT.md / TEST_CASES.md / README.md
```

## Phase readiness

| Phase | Status |
|-------|--------|
| 1 Foundation & Access | In progress / this codebase |
| 2 Listings & Folders | User model ready; Vehicle tables next |
| 3 Auctions & Controls | Auth roles + status gates ready |
| 4 Notifications & Go-live | Email service to plug into later |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:up` | Start Postgres container |
| `npm run db:migrate -w @prs/api` | Apply migrations |
| `npm run db:seed -w @prs/api` | Seed admin |
| `npm run dev:api` | API on :4000 |
| `npm run dev:web` | Web on :5173 |
| `npm run dev:mail` | MailDev inbox UI on :1080 (SMTP :1025) |
| `npm test` | Run API + web test suites |

### Tests covered
- See `TEST_CASES.md` for the full matrix (automated + manual).
- Backend: validators, pagination, email tokens, live API integration (auth, verify, admin, logout).
- Frontend: forms, routing gates, pagination UI, verify-email pages, logout.

### Handoff
- **`PROJECT_CONTEXT.md`** — resume here next session (architecture, phase status, how to run).
- **`.cursor/rules/prs-platform.mdc`** — always-on AI rule for this project.