# PRS — Salvage Vehicle Auction Platform  
## 4-Phase Delivery Plan & Payment Schedule

**Project:** PRS — Salvage Vehicle Auction Platform  
**Client budget (agreed):** ₨150,000 PKR (fixed)  
**Delivery model:** 4 phases · client review & approval after each phase · payment before next phase starts  
**Total timeline:** ~25 working calendar days (subject to timely approvals)  
**Build type:** Lean web MVP (responsive), solo delivery  

---

## 1. How this works

1. Developer completes the phase deliverables.  
2. Client receives a **demo / staging link** (or screenshots + walkthrough for Phase 1 if preferred).  
3. Client reviews against the **Approval Checklist** for that phase (max **3 business days**).  
4. Client sends written approval (email / WhatsApp is enough).  
5. Client pays the **phase invoice**.  
6. Next phase starts **only after** payment clears.

**Rule:** Unapproved or unpaid phases pause the timeline. Days waiting on client review or payment do not count against the delivery calendar.

---

## 2. Payment summary (₨150,000)

| Phase | Name | Payment (PKR) | % | Approx. days |
|-------|------|---------------|---|--------------|
| 1 | Foundation & Access | 40,000 | 27% | Days 1–6 |
| 2 | Listings & Folders | 40,000 | 27% | Days 7–13 |
| 3 | Auctions, Bids & Controls | 40,000 | 27% | Days 14–20 |
| 4 | Notifications, Polish & Go-Live | 30,000 | 20% | Days 21–25 |
| **Total** | | **150,000** | **100%** | **~25 days** |

**Payment method:** Bank transfer (details on invoice).  
**Invoice timing:** Issued when phase is ready for review; due on approval (or within 2 business days of approval).

---

## 3. Locked before Phase 1 starts (client must confirm)

These are required for a correct build. Defaults apply if client does not reply within 3 days of kickoff.

| Item | Default if not confirmed |
|------|--------------------------|
| Auction length | Seller sets **end date/time** when publishing |
| Platform fee % (seller) | **2%** of final sale (configurable later by admin) |
| Platform fee % (buyer) | **2%** of final sale (configurable later by admin) |
| Non-payment fine (to unblock) | **₨5,000** flat (admin-confirmed payment) |
| Payment window after win | **7 days** (seller can extend) |
| Brand name / logo / contact | Text “PRS” + green/white theme until assets provided |

**Out of this ₨150k scope (not included):** JazzCash/card gateways, native mobile apps, AI valuation, blockchain, multi-country localization, advanced analytics, live WebSocket bidding, company “follow” alerts. Can be quoted as Phase 5+ later.

---

## 4. Phase details

---

### Phase 1 — Foundation & Access  
**Payment on approval: ₨40,000**  
**Duration: ~6 days**

#### Goal
Public face of PRS + secure signup/login for all roles + admin can approve users.

#### Deliverables
- Landing page (green & white theme): what PRS is, Sign Up / Login CTAs, role selection  
- Registration for:
  - Insurance Company (company name, phone, email, NTN/tax, location, password + policy accept)
  - Salvage Dealer (name/company, tax/ID, phone optional, email, password + policy accept)
  - Private Seller (personal details, contact, email, password + policy accept)
- Login / logout / password-protected sessions  
- User status: **Pending → Approved / Suspended**  
- **Admin panel (basic):** list users, approve, suspend  
- Responsive layout shell (works on phone + desktop)  
- Staging URL for client review  

#### Demo / walkthrough
1. Open landing → Sign up as each of the 3 roles  
2. Admin logs in → approves each user  
3. Approved users can log in; pending users cannot use the app  

#### Approval checklist (client)
- [ ] Landing looks professional and on-brand enough to proceed  
- [ ] All three registration forms work  
- [ ] Policy acceptance is required  
- [ ] Admin can approve / suspend users  
- [ ] Site usable on mobile browser  

#### What is NOT in Phase 1
Vehicle upload, folders, bidding, notifications, fees, blocking.

---

### Phase 2 — Listings & Company Folders  
**Payment on approval: ₨40,000**  
**Duration: ~7 days**  
**Starts after:** Phase 1 approved + ₨40,000 paid

#### Goal
Insurance companies and private sellers can manage vehicles; dealers can browse by company folder.

#### Deliverables
- **Insurance dashboard**
  - Company folder (their listings)
  - Add / edit vehicle: photos (multiple), make, model, variant (optional), registration no., company value (optional), comments  
  - **Draft** vs **Publish** (or save draft for later batch auction)  
- **Private seller dashboard**
  - List own vehicle with same core fields  
  - Manage own listings  
- **Dealer dashboard**
  - Side menu of **insurance company folders**  
  - Open a folder → see that company’s **live** vehicles  
  - Vehicle detail page (photos + details) — **view only** in this phase  
- Image upload to cloud/storage  
- Admin: view / moderate listings (hide or flag if needed — basic)  

#### Demo / walkthrough
1. Insurance user uploads 2–3 vehicles (draft + publish)  
2. Dealer opens that company’s folder and sees published vehicles  
3. Private seller lists one vehicle  
4. Mobile: browse folder + open a vehicle  

#### Approval checklist (client)
- [ ] Photos and required fields work  
- [ ] Draft does not appear to dealers; Publish does  
- [ ] Folders show the correct company’s vehicles  
- [ ] Private seller can list a vehicle  
- [ ] Layout still clean on mobile  

#### What is NOT in Phase 2
Placing bids, auction end, winner logic, blocking, fees, email alerts.

---

### Phase 3 — Auctions, Bids & Business Controls  
**Payment on approval: ₨40,000**  
**Duration: ~7 days**  
**Starts after:** Phase 2 approved + ₨40,000 paid

#### Goal
Full marketplace loop: bid → win → offline payment tracking → block/fine → platform fee ledger.

#### Deliverables
- **Bidding (dealers)**
  - Place bid on live insurance auctions  
  - Dealer sees **current highest bid amount only** (not other bidders’ names)  
  - Insurance seller sees **full bid list** (name/company + amounts)  
- **Auction close**
  - Seller sets end date/time on publish (or edit while live, if agreed)  
  - Highest bid wins when auction ends  
  - Winner + seller get status update in-app  
- **Private seller close**
  - Dealers submit offers  
  - Seller **Accept** or **Reject** (not automatic highest-wins)  
- **Payment window**
  - Default **7 days** after win  
  - Seller can **extend** deadline  
  - Status: awaiting payment / paid / overdue (vehicle money stays **offline** between parties)  
- **Blocking**
  - Insurance can block a dealer who won but did not pay  
  - Blocked dealer cannot bid on that company’s vehicles  
  - Unblock after **fine paid** — admin confirms fine received (bank transfer; no online gateway in this budget)  
- **Platform fee ledger**
  - Fee rows for seller + winning buyer on successful sale  
  - Admin (or parties) mark fee as paid (manual)  
- Admin: monitor bids, blocks, fee statuses, disputes (basic actions)  

#### Demo / walkthrough
1. Dealer bids; second dealer outbids; insurance sees both names  
2. Auction ends → highest bidder wins  
3. Mark payment overdue → insurance blocks dealer → dealer cannot bid there  
4. Admin confirms fine → dealer unblocked  
5. Private seller accepts one offer  
6. Fee ledger shows both-side fees  

#### Approval checklist (client)
- [ ] Asymmetric bid visibility works as described  
- [ ] Highest bid wins on insurance auctions  
- [ ] Private accept/reject works  
- [ ] Block / unblock with admin-confirmed fine works  
- [ ] 7-day window + extend works  
- [ ] Fee ledger is understandable for admin  

#### What is NOT in Phase 3
Polished emails, public go-live on final domain, final design polish, training docs.

---

### Phase 4 — Notifications, Polish & Go-Live  
**Payment on approval: ₨30,000**  
**Duration: ~5 days**  
**Starts after:** Phase 3 approved + ₨40,000 paid

#### Goal
Production-ready release: emails, polish, deploy on live domain, client UAT sign-off.

#### Deliverables
- **Email notifications (core events)**
  - Dealer: outbid, win (with seller contact basics)  
  - Insurance / private seller: new bid / new offer, auction ended  
  - Optional: simple platform announcement capability for admin  
- UI polish pass (green/white consistency, back navigation, mobile fixes)  
- Bug fixes from Phase 1–3 feedback (within agreed scope; see §5)  
- Production deploy (client domain if provided, or agreed host)  
- Basic admin/ops handoff notes (how to approve users, confirm fees/fines)  
- Final UAT session with client  

#### Demo / walkthrough
1. Full flow on **production** URL: register → approve → list → bid → win  
2. Show sample notification emails  
3. Admin walkthrough of day-to-day tasks  

#### Approval checklist (client)
- [ ] Production site reachable on agreed URL  
- [ ] Core emails received in testing  
- [ ] No blocking bugs on main journeys  
- [ ] Client accepts MVP as complete for ₨150,000 scope  

#### After Phase 4 payment
Project MVP is **closed**. Further features = new quote (Phase 5+).

---

## 5. Change requests & revisions

| Type | Policy |
|------|--------|
| Bugs (feature doesn’t work as in this plan) | Fixed free during the active phase and in Phase 4 polish |
| Small text/logo/color tweaks | Included if requested during the same phase review |
| New features not listed above | Separate quote / add to a paid Phase 5 |
| Scope change mid-phase | Timeline pauses; written change order + fee if effort grows |

**Revision rounds:** Up to **2** review rounds per phase during the 3-day approval window. Extra redesign rounds may shift days or require a small add-on fee (agreed in writing).

---

## 6. Client responsibilities

- Provide logo, brand colors (if different from green/white), contact info, fee %, fine amount  
- Approve / pay each phase on time  
- Nominate **one** decision-maker for approvals  
- UAT on Phase 4 with real sample data if possible  
- Arrange domain DNS if using client’s domain  

---

## 7. Developer responsibilities

- Deliver each phase as listed  
- Keep staging available for review  
- Protect bid privacy in the API (dealers never see other bidders)  
- Hand over production access and short ops notes at Phase 4  
- Keep total fixed at **₨150,000** for the scope in this document  

---

## 8. Sign-off

By signing (or confirming on WhatsApp/email with this document attached), both parties agree to the phase scope, timeline rules, and payment schedule.

| | Client | Developer |
|--|--------|-----------|
| Name | | |
| Signature / confirmation | | |
| Date | | |

---

## 9. Quick reference — approval & pay cycle

```
Phase N work complete
        ↓
Client reviews (≤ 3 business days) + checklist
        ↓
Written APPROVAL
        ↓
Pay phase amount
        ↓
Phase N+1 starts
```

| After approving… | Pay | Then starts… |
|------------------|-----|--------------|
| Phase 1 | ₨40,000 | Phase 2 |
| Phase 2 | ₨40,000 | Phase 3 |
| Phase 3 | ₨40,000 | Phase 4 |
| Phase 4 | ₨30,000 | Project closed (MVP) |

**Grand total: ₨150,000 PKR**

---

*Document prepared for client review · PRS MVP · 4-phase gated delivery*  
*Aligned to System Concept Document (July 2026) — Year-1 Pakistan MVP only*
