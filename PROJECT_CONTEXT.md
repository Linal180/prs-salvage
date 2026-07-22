# PRS Platform — Project Context (Full History)

> **Living handoff file — source of truth across sessions.**  
> Read this **before** starting any work. Append to the session log when finishing.  
> Last updated: **2026-07-23** (paused after Phase 1 + git history rewrite)

**How to resume later**
1. Open folder `/home/dev/Projects/Salvage` in Cursor (not the old `Vehicle sho[` path).
2. Read this file top to bottom.
3. Optionally reopen the original chat (Agent transcript id: `2104b6fa-c82b-4b74-a461-4cd5be5e64a1`) — pin/star that chat in Cursor UI if available.
4. Continue from **Phase 2 checklist** below.

> Cursor chats cannot be pinned by the agent. Pin/star the chat yourself in the Cursor UI, and treat **this file** as the durable memory that survives new chats.

---

## 1. What this project is

**PRS — Salvage Vehicle Auction Platform**  
Online marketplace: insurance companies list salvage vehicles, dealers bid, private sellers list accident cars. Payment between buyer/seller is **offline**; platform takes a fee.

| Item | Value |
|------|--------|
| Client | Pakistani mid-level shopkeeper |
| Total budget | **PKR 150,000** |
| Delivery | **4 phases** — client approves + pays after each phase |
| Repo | `/home/dev/Projects/Salvage` |
| Code | Root (`apps/`, configs, engineering docs) |
| Client docs | `docs/` only |

Client documents:
- `docs/PRS - Salvage Vehicle Auction Platform _ System Concept Document.pdf`
- `docs/PRS-4-Phase-Plan-and-Payments.md` (+ `.docx` / `.pdf`)

---

## 2. Day-1 origin story (keep forever)

**2026-07-22 — Estimate & lean budget**

User asked to review the System Concept Document thoroughly, estimate effort/difficulty/architecture/resources/ETA, and prepare a **minimum** budget for a mid-level Pakistani shopkeeper (builder would implement everything).

Agreed outcome:
- Lean MVP architecture (not enterprise)
- Solo / small-shop delivery pace
- Locked total **PKR 150,000** across 4 paid phases
- Explicit cut list so scope does not grow

**Phase payment schedule (locked)**

| After client approves | Pay PKR |
|-----------------------|--------|
| Phase 1 — Foundation & Access | 40,000 |
| Phase 2 — Listings & Folders | 40,000 |
| Phase 3 — Auctions & Controls | 40,000 |
| Phase 4 — Notifications, Polish & Go-live | 30,000 |
| **Total** | **150,000** |

**Defaults locked with client assumptions (until client changes)**

- Auction end: seller sets `end_at` on publish (no fancy live timers required for MVP)
- Fees: **2% seller + 2% buyer** (admin-configurable later)
- Fine: **PKR 5,000** flat (admin confirms bank receipt)
- Payment window: **7 days**, extendable
- Theme: green `#1b6b3a` / white · fonts **Fraunces + Manrope**
- Vehicle payment between parties: **offline** (bank transfer / cash)

**Explicitly OUT of the 150k scope**

JazzCash / online wallet integrations, native mobile apps, AI features, blockchain, WebSockets/real-time bidding infra, follow alerts, multi-currency.

---

## 3. Stack (chosen & implemented)

| Layer | Choice |
|-------|--------|
| Web | React 19 + TypeScript + Vite + Tailwind v4 + React Router |
| API | Node + Fastify + Zod + Prisma |
| DB | PostgreSQL 16 (Docker) on host port **5433** (avoids local 5432 clash) |
| Auth | httpOnly JWT cookie `prs_token` |
| Mail (dev) | **MailDev** — SMTP `1025`, UI `http://localhost:1080` |
| Tests | Vitest (API unit + live integration; Web unit + RTL) |
| Layout | npm workspaces: `apps/api`, `apps/web` |

---

## 4. How to run (every session)

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

## 5. Phase status

| Phase | Scope | Status |
|-------|--------|--------|
| **1** Foundation & Access | Landing, 4 roles, register/login, email verify, admin approve/suspend, pagination, MailDev | **Done (MVP)** |
| **2** Listings & Folders | Vehicles, photos, draft/publish, company folders | **Next** |
| **3** Auctions & Controls | Bids, asymmetric visibility, block/fine, fee ledger | Not started |
| **4** Polish & Go-live | Production emails, deploy, UAT | Not started |

### Roles

`ADMIN` · `INSURANCE` · `DEALER` · `PRIVATE_SELLER`

### Phase 1 delivered features

- Landing page (brand-first green/white)
- Register (insurance / dealer / private seller) with policy checkbox + field validation
- Login / logout (cookie auth)
- Email verification (token hash, 24h, resend, success page)
- Pending approval gate
- Admin: paginated users, approve, suspend
- Shared pagination helpers (API + UI) for reuse in later phases
- Automated tests (~63 last known green: API 36 + Web 27)

---

## 6. Architecture notes (do not break)

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

### Logout cookie gotcha

`clearCookie` options must match `setCookie` (path/sameSite/etc.) or the browser keeps `prs_token`. Always clear local auth state and navigate to `/login`.

### Validation rule (workspace + product)

**Invalid input = reject**, do not auto-fix/reorder. Return field errors.

### Money in MVP

Vehicle payment offline. Platform fees / fines = bank slip + admin marks paid (Phase 3).

### Asymmetric bidding (design for Phase 3 now)

Dealers must not see other dealers’ identities on bids. Do not leak bidder identity in dealer-facing APIs when building listings/bids.

---

## 7. Key paths

```
apps/api/
  prisma/schema.prisma          User, EmailVerificationToken
  src/routes/auth.ts            register/login/logout/verify/resend
  src/routes/admin.ts           users list (paginated) + approve/suspend
  src/lib/mail.ts               nodemailer → MailDev/SMTP
  src/lib/email-verification.ts issue/consume tokens
  src/lib/pagination.ts         shared list paging
  .env                          DATABASE_URL, SMTP_*, JWT_SECRET  (local, not committed)

apps/web/
  src/pages/*                   Landing, Login, Register, Verify*, Pending, Dashboard, Admin
  src/lib/api.ts                fetch client + homePathFor
  src/lib/validation.ts         client Zod schemas (mirror API)
  src/components/Pagination.tsx reusable pager
  src/components/ui.tsx         Shell, Field (per-field errors), etc.

docs/                           Client concept PDF + phase/payment plan
TEST_CASES.md                   Full test matrix
.cursor/rules/prs-platform.mdc  Always-on Cursor rule → points here
```

---

## 8. Bugs fixed in Phase 1 (do not regress)

1. **Logout** — cookie clear options must match set; always clear client state; go to `/login`.
2. **Resend verification** — no empty JSON body with `Content-Type: application/json`.
3. **MailDev “email vanishes”** — verify CTA `target="_blank"`; full HTML email.
4. **Strict Mode burns token** — confirm page `useRef` guard so one-time token is not consumed twice.
5. Success page after verify so UX is clear.

---

## 9. Repo / git history notes

- Folder renamed: `Vehicle sho[` → `/home/dev/Projects/Salvage`
- Client/plan files moved into `docs/`; code stays at repo root
- Single large commit was **soft-reset** and split into meaningful commits (no “Made with Cursor” trailers)
- Branch: `master` · no remote upstream required at pause time
- Recent commit themes: scaffold → docs → Prisma/users → auth libs → auth+verify APIs → admin API → web shell → auth pages → verify/admin UI → tests → handoff docs

---

## 10. When you resume — Phase 2 checklist

1. Add Prisma models: `Vehicle`, `VehiclePhoto` (status: `DRAFT | LIVE | ENDED`)  
2. Insurance CRUD + multi-upload (Cloudinary/R2 or similar lean storage)  
3. Dealer folder browse (side nav = insurance orgs with live vehicles)  
4. Private seller list own vehicles  
5. Reuse pagination on every list endpoint  
6. Keep asymmetric bid design for Phase 3 (don’t leak bidder identity in dealer APIs)  
7. Update this file + `TEST_CASES.md` when Phase 2 landings  
8. After Phase 2 client approval → invoice **PKR 40,000**

---

## 11. Session log (append below — never delete older entries)

### 2026-07-22 — Day 1
- Reviewed System Concept Document (multiple passes)
- Produced lean architecture, effort, ETA, and PKR budget for mid-level shopkeeper
- Locked **PKR 150,000** / 4 phases with payment after each approval
- Wrote phase plan docs (`PRS-4-Phase-Plan-and-Payments.*`)
- Chose React + Node + Postgres stack; started Phase 1 build

### 2026-07-23 — Phase 1 complete + housekeeping
- Scaffolded monorepo, Phase 1 auth + admin + pagination
- Email verification + MailDev (`npm run dev:mail`)
- Fixed logout, empty JSON body on resend, MailDev link `target=_blank`, verify success page
- Added `PROJECT_CONTEXT.md`, `TEST_CASES.md`, `.cursor/rules/prs-platform.mdc`, expanded tests
- Renamed folder `Vehicle sho[` → `/home/dev/Projects/Salvage`
- Moved client/plan documents into `docs/`
- Soft-reset one fat commit; rewrote as ~11 small meaningful commits
- **Paused here** — next work is Phase 2 (listings & folders)

### Resume instruction for next agent/session
Open `/home/dev/Projects/Salvage`, read this entire file, then start Phase 2 checklist. Preserve all decisions above unless the user explicitly changes them.
