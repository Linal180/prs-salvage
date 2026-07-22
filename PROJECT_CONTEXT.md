# PRS Platform — Project Context

> **Living handoff file.** Update this when you finish a session.  
> Last updated: 2026-07-23 (renamed to Salvage; docs separated)

---

## What this project is

**PRS — Salvage Vehicle Auction Platform**  
Online marketplace: insurance companies list salvage vehicles, dealers bid, private sellers list accident cars. Payment between buyer/seller is **offline**; platform takes a fee.

**Client:** Pakistani mid-level shopkeeper · Budget **PKR 150,000** · **4 phases** with approval + payment after each phase.

**Repo root:** `/home/dev/Projects/Salvage`

| Location | Contents |
|----------|----------|
| Root (`apps/`, configs, `README.md`, `PROJECT_CONTEXT.md`, `TEST_CASES.md`) | Project code + engineering handoff |
| `docs/` | Client / plan documents only |

Client docs:
- `docs/PRS - Salvage Vehicle Auction Platform _ System Concept Document.pdf`
- `docs/PRS-4-Phase-Plan-and-Payments.md` (+ `.docx` / `.pdf`)

---

## Stack

| Layer | Choice |
|-------|--------|
| Web | React 19 + TypeScript + Vite + Tailwind v4 + React Router |
| API | Node + Fastify + Zod + Prisma |
| DB | PostgreSQL 16 (Docker) on host port **5433** |
| Auth | httpOnly JWT cookie `prs_token` |
| Mail (dev) | **MailDev** SMTP `1025` · UI `http://localhost:1080` |
| Tests | Vitest (API unit + live integration; Web unit + RTL) |

Monorepo npm workspaces: `apps/api`, `apps/web`.

---

## How to run (every session)

```bash
cd "/home/dev/Projects/Salvage"

npm run db:up          # Postgres :5433
npm run dev:mail       # MailDev :1080 / SMTP :1025
npm run dev:api        # API :4000  (loads apps/api/.env)
npm run dev:web        # Web :5173
```

Admin seed: `admin@prs.local` / `Admin@12345`

```bash
npm test               # API must be running for integration tests
```

---

## Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| **1** Foundation & Access | Landing, 4 roles, register/login, email verify, admin approve/suspend, pagination, MailDev | **Done (MVP)** |
| **2** Listings & Folders | Vehicles, photos, draft/publish, company folders | **Next** |
| **3** Auctions & Controls | Bids, asymmetric visibility, block/fine, fee ledger | Not started |
| **4** Polish & Go-live | Production emails, deploy, UAT | Not started |

### Defaults locked (until client changes)

- Auction end: seller sets `end_at` on publish  
- Fees: 2% seller + 2% buyer (admin-configurable later)  
- Fine: PKR 5,000 flat (admin confirms bank receipt)  
- Payment window: 7 days, extendable  
- Theme: green `#1b6b3a` / white · fonts Fraunces + Manrope  

### Explicitly OUT of 150k

JazzCash, native apps, AI, blockchain, WebSockets, follow alerts, multi-currency.

---

## Architecture notes (do not break)

### User gates (order matters)

1. Suspended → cannot login / session revoked  
2. Email not verified → `/verify-email`  
3. Status `PENDING` → `/pending` (admin approval)  
4. `APPROVED` + verified → `/dashboard` (or `/admin`)

`homePathFor(user)` in `apps/web/src/lib/api.ts` encodes this.

### Email verification

- Token stored as **SHA-256 hash**; raw token only in email link  
- Expires **24h**; one-time use  
- Link: `{WEB_ORIGIN}/verify-email/confirm?token=...`  
- Success page: `/verify-email/success`  
- Email HTML uses `target="_blank"` so MailDev preview does not eat the click  
- Confirm page guards React Strict Mode double-mount with a `useRef`  

### Pagination (reuse for all future lists)

- API: `parsePagination` + `resolvePagination` in `apps/api/src/lib/pagination.ts`  
- Response: `{ pagination: { page, pageSize, total, totalPages, hasNext, hasPrev } }`  
- UI: `<Pagination />` in `apps/web/src/components/Pagination.tsx`  
- Query: `?page=1&pageSize=10` (max 50)

### API client gotcha

Do **not** send `Content-Type: application/json` without a body (Fastify `FST_ERR_CTP_EMPTY_JSON_BODY`).  
`request()` only sets JSON headers when `body` is present.

### Money in MVP

Vehicle payment offline. Platform fees / fines = bank slip + admin marks paid (Phase 3).

---

## Key paths

```
apps/api/
  prisma/schema.prisma          User, EmailVerificationToken
  src/routes/auth.ts            register/login/logout/verify/resend
  src/routes/admin.ts           users list (paginated) + approve/suspend
  src/lib/mail.ts               nodemailer → MailDev/SMTP
  src/lib/email-verification.ts issue/consume tokens
  src/lib/pagination.ts         shared list paging
  .env                          DATABASE_URL, SMTP_*, JWT_SECRET

apps/web/
  src/pages/*                   Landing, Login, Register, Verify*, Pending, Dashboard, Admin
  src/lib/api.ts                fetch client + homePathFor
  src/lib/validation.ts         client Zod schemas (mirror API)
  src/components/Pagination.tsx reusable pager
  src/components/ui.tsx         Shell, Field (per-field errors), etc.
```

---

## When you resume — Phase 2 checklist

1. Add Prisma models: `Vehicle`, `VehiclePhoto` (status: `DRAFT | LIVE | ENDED`)  
2. Insurance CRUD + multi-upload (Cloudinary/R2)  
3. Dealer folder browse (side nav = insurance orgs with live vehicles)  
4. Private seller list own vehicles  
5. Reuse pagination on every list endpoint  
6. Keep asymmetric bid design for Phase 3 (don’t leak bidder identity in dealer APIs)

---

## Payments to client (reminder)

| After approving | Pay PKR |
|-----------------|--------|
| Phase 1 | 40,000 |
| Phase 2 | 40,000 |
| Phase 3 | 40,000 |
| Phase 4 | 30,000 |
| **Total** | **150,000** |

---

## Session log (append below)

### 2026-07-23
- Scaffolded monorepo, Phase 1 auth + admin + landing  
- Email verification + MailDev (`npm run dev:mail`)  
- Fixed logout, empty JSON body on resend, MailDev link `target=_blank`, verify success page  
- Added this context file + expanded tests  
- Renamed folder `Vehicle sho[` → `/home/dev/Projects/Salvage`
- Moved client/plan PDFs & phase-plan files into `docs/` (code stays at root)
