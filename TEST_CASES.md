# PRS — Test Cases (Phase 1)

Run with API up: `npm run dev:api` then `npm test`.

Legend: **A** = automated · **M** = manual (browser / MailDev)

---

## 1. Health & infrastructure

| ID | Case | Type | Expected |
|----|------|------|----------|
| H1 | API `/health` | A | `{ ok: true }` |
| H2 | Web loads `/` | M | Landing renders PRS brand |
| H3 | MailDev UI `:1080` | M | Inbox opens when `npm run dev:mail` |
| H4 | Postgres `:5433` | M | `docker compose ps` healthy |

---

## 2. Registration (all roles)

| ID | Case | Type | Expected |
|----|------|------|----------|
| R1 | Insurance valid payload | A | 201, `PENDING`, `emailVerified=false` |
| R2 | Dealer valid (phone optional) | A | 201 |
| R3 | Private seller valid | A | 201 |
| R4 | Empty insurance form fields | A+FE | Per-field errors (name, email, password, phone, NTN, location, policy) |
| R5 | Policy not accepted | A+FE | `policyAccepted` error |
| R6 | Short password | A+FE | Password ≥ 8 chars |
| R7 | Invalid email | A+FE | Valid email message |
| R8 | Duplicate email | A | 409, email field error |
| R9 | Role switcher UI | FE | Labels change Insurance / Dealer / Private |

---

## 3. Login / logout / session

| ID | Case | Type | Expected |
|----|------|------|----------|
| L1 | Empty login | A+FE | Email + password required |
| L2 | Bad password | A | 401 |
| L3 | Admin login | A | Cookie set, role ADMIN |
| L4 | Logout clears cookie | A | `/api/me` → 401 |
| L5 | Logout button UI | FE | Calls API, shows Login link |
| L6 | Suspended login blocked | A | 403 |
| L7 | Suspended live session revoked | A | `/api/me` → 403 after suspend |

---

## 4. Email verification

| ID | Case | Type | Expected |
|----|------|------|----------|
| E1 | Register issues token + mail | A | `devVerificationUrl` or MailDev message |
| E2 | Verify valid token | A | `emailVerified=true` |
| E3 | Token reuse rejected | A | 400 |
| E4 | Invalid token | A | 400 |
| E5 | Resend without JSON body | A | 200 (no Fastify empty-body error) |
| E6 | Resend when already verified | A | `alreadyVerified: true` |
| E7 | Confirm page → success page | FE | `/verify-email/success` |
| E8 | Missing token on confirm | FE | Error + request new link |
| E9 | MailDev click opens new tab | M | Frontend opens; inbox not blanked |
| E10 | Success → pending CTA | FE | “Continue to approval status” |

---

## 5. Admin

| ID | Case | Type | Expected |
|----|------|------|----------|
| AD1 | Non-admin forbidden | A | 403 on `/api/admin/users` |
| AD2 | List pending/approved/suspended | A | Counts + filtered rows |
| AD3 | Pagination pageSize=5 | A | ≤5 users, meta correct |
| AD4 | Page 2 differs from page 1 | A | Different first id when hasNext |
| AD5 | Approve user | A | Status APPROVED |
| AD6 | Suspend user | A | Status SUSPENDED |
| AD7 | Cannot suspend self | A | 400 |
| AD8 | Admin UI filter pills | M | Pending/Approved/Suspended/All |
| AD9 | Admin pager Previous/Next | FE+M | Page changes, range text |
| AD10 | Email verified badge on row | M | Verified / not verified text |

---

## 6. Routing gates

| ID | Case | Type | Expected |
|----|------|------|----------|
| G1 | Unverified → `/verify-email` | A (unit) | `homePathFor` |
| G2 | Verified pending → `/pending` | A | `homePathFor` |
| G3 | Approved verified → `/dashboard` | A | `homePathFor` |
| G4 | Admin → `/admin` | A | `homePathFor` |
| G5 | Dashboard blocked if unverified | M | Redirect to verify |
| G6 | Dashboard blocked if pending | M | Redirect to pending |

---

## 7. Pagination component

| ID | Case | Type | Expected |
|----|------|------|----------|
| P1 | Summary “Showing X–Y of Z” | FE | Correct math |
| P2 | Previous/Next callbacks | FE | page±1 |
| P3 | First page disables Previous | FE | disabled |
| P4 | total=0 renders null | FE | empty |
| P5 | Per-page select | FE | 10/20/50 |

---

## Phase 2+ (not automated yet)

| Area | Cases to add later |
|------|-------------------|
| Vehicles | CRUD, draft vs publish, required photos |
| Folders | Dealer sees only live vehicles per company |
| Bids | Asymmetric visibility, race/highest win |
| Block/fine | Per-company block, admin confirm fine |
| Fees | Ledger both sides, mark paid |

---

## Commands

```bash
npm run dev:api    # required for integration tests
npm run dev:mail   # for E9 manual
npm test
```
