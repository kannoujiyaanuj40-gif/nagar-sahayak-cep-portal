# Nagar Sahayak — Complaint Registration Management Portal

A BSc IT **Community Engagement Project (CEP)** built under **NEP 2020**.

> ⚠️ **Academic prototype.** This is not an official Municipal Corporation system.
> It is not affiliated with, endorsed by, or connected to MyBMC, TMC, NMMC, PMC
> or any government body. No real complaints are routed anywhere.

---

## 1. What this project is

A citizen-friendly web portal for registering, tracking and resolving municipal
civic complaints (garbage, potholes, water supply, drainage, street lights,
etc.), built after a **comparative usability study of four existing
municipal/government complaint portals** (MyBMC, TMC, NMMC, PMC). Their
branding, visual design and source code were **not** copied — only publicly
observable features were used as reference to identify improvement
opportunities. The full comparative study is documented in the app itself
under **Research & Improvements** (`/#/research`), and summarised in
[`docs/research-and-improvements.md`](#7-research--improvements-summary) below.

Key improvements implemented over the studied portals:
- A guided **5-step complaint registration wizard** (Category → Location → Description → Photo → Submit)
- **Visual, icon-based categories** so citizens never have to guess a classification
- **Automatic department suggestion** — the citizen never needs to know which municipal department handles their issue
- A **visual status timeline** instead of plain status text
- A visible **expected resolution date** with SLA-approaching / SLA-exceeded indicators
- **Automatic 3-level escalation** when a deadline is missed, visible to the citizen
- A **feedback → reopen** loop so a wrongly-closed complaint doesn't just disappear
- A single **citizen dashboard** instead of scattered service channels
- An **admin panel** with search/filter, department & user management, and analytics

---

## 2. Technology stack — and an important note on why

**Required by the assignment:** React (optional) / HTML-CSS-JS frontend, Node.js
+ Express backend, MySQL database.

**What's actually implemented, and why:**

| Layer | Required | What's built | Why |
|---|---|---|---|
| Frontend | HTML/CSS/JS | Vanilla HTML/CSS/JS, hash-routed SPA | Same requirement, no substitution needed |
| Backend | Node.js + Express | **Node.js only (`http` built-in module), no Express** | This build environment has no access to the npm package registry (`npm install express` returns a `403 Forbidden` here — verified). So the server is written using only Node's built-in modules, with the exact same route → controller → model layering Express would use. |
| Database | MySQL | **JSON-file data store** (`backend/data/db.json`), with a full **`database/schema.sql`** provided | For the same reason — the `mysql2` driver can't be installed here, and there's no MySQL server running in this sandbox. The JSON store's shape is a 1:1 mirror of `schema.sql`, so every table, column and relationship in the report is real and matches what actually runs. |

**On your own machine, with internet access, you can run the "real" stack
in about 10 minutes** — see [§6 Upgrading to Express + MySQL](#6-optional-upgrading-to-express--mysql).
Everything in this prototype was designed so that upgrade is a mechanical
swap (same routes, same controllers, same data shapes), not a redesign.

**As delivered, the project runs with zero installation** — just Node.js.
This also means anyone examining/grading the project can run it instantly
without setting up a database server.

---

## 3. Project structure

```
cep-portal/
├── backend/
│   ├── server.js              # HTTP server, routing, static file serving
│   ├── config/config.js       # Ports, paths, SLA/escalation constants
│   ├── routes/routes.js       # Central route table (method + path → controller)
│   ├── controllers/           # authController, complaintController,
│   │                          #   notificationController, referenceController, adminController
│   ├── models/                # db.js (data store), auth.js, complaints.js, misc.js
│   ├── middleware/auth.js     # Bearer-token auth guard (citizen / admin)
│   ├── utils/fileStore.js     # Base64 photo upload → saved file
│   └── data/
│       ├── db.json            # Auto-created on first run (seed data)
│       └── uploads/           # Uploaded complaint/resolution photos
├── frontend/
│   ├── index.html             # Single-page shell (header, nav, footer, script tags)
│   └── assets/
│       ├── css/style.css      # Full design system, mobile-first
│       └── js/
│           ├── api.js         # fetch() wrapper
│           ├── state.js       # Auth/session helpers (localStorage token)
│           ├── ui.js          # Toasts, formatting, badges, modals
│           ├── app.js         # Hash router
│           └── pages/         # One file per page (25 pages total)
├── database/
│   ├── schema.sql             # Full MySQL DDL — the "real" schema
│   └── seed.sql               # Demo data for the MySQL version
└── README.md
```

---

## 4. How to run (as delivered — zero installation)

**Requirement:** Node.js 18+ (v22 was used to build this).

```bash
cd cep-portal
node backend/server.js
```

You should see:

```
  Complaint Registration Management Portal
  Server running at: http://localhost:4000
  API base:          http://localhost:4000/api
  Demo citizen login: 9876543210 / Demo@1234
  Demo admin login:   9999999999 / Admin@1234
```

Open **http://localhost:4000** in a browser. That's it — no `npm install`,
no database setup. The backend serves both the API (under `/api/...`) and
the frontend static files from the same server and port.

To change the port: `PORT=5000 node backend/server.js`.

Data persists in `backend/data/db.json` between restarts. To reset to the
original seed data, stop the server and delete that file — it's
regenerated automatically on the next start.

### Demo login credentials

| Role | Mobile | Password |
|---|---|---|
| Citizen (Rahul Sharma) | `9876543210` | `Demo@1234` |
| Citizen (Priya Deshmukh) | `9876500000` | `Demo@1234` |
| Admin | `9999999999` | `Admin@1234` |

You can also register a new citizen account from `#/register`.

---

## 5. Testing the major workflows

1. **Register a complaint (citizen):** Log in as the demo citizen → *Register
   Complaint* → walk through all 5 steps → note the generated Complaint ID
   (e.g. `CMP-000101`).
2. **Track it publicly:** Go to *Track Complaint* (no login needed) and enter
   the ID — see the visual status timeline and expected resolution date.
3. **Manage it as admin:** Log out, log in as admin (`#/admin-login`) → *All
   Complaints* → open the complaint → assign a team, change status to
   *In Progress*, then *Resolved* with resolution remarks/photo.
4. **Give feedback (citizen):** Log back in as the citizen → open the
   complaint from *My Complaints* → answer "Was your problem resolved?" and
   rate it. Choosing **No** automatically **reopens and escalates** the
   complaint instead of closing it — try this to see the reopen flow.
5. **SLA & escalation:** Any complaint whose expected resolution date has
   passed is automatically flagged "🔴 SLA exceeded" and escalated one level,
   the next time it's read from the server (dashboard load, track lookup, or
   admin list) — no manual trigger needed. You can also manually escalate
   from the admin complaint page.
6. **Admin analytics:** *Admin → Reports & Analytics* shows category-wise,
   status-wise, area-wise and department-wise breakdowns plus average
   resolution time and citizen rating.

---

## 6. (Optional) Upgrading to Express + MySQL

If you have internet access and want to run the "textbook" stack for your
submission or viva:

1. **Database:** Install MySQL, then run:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
2. **Backend:** `npm install express mysql2 bcryptjs jsonwebtoken multer` in
   `backend/`, then reimplement `backend/models/db.js` to run parameterised
   queries against MySQL instead of reading/writing `db.json` — every other
   file (`controllers/`, `routes/`, `middleware/`) can stay as-is, since they
   only ever call the functions exported by `models/`, never touch storage
   directly.
3. **Environment variables** you'd need at that point:
   ```
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=complaint_portal
   JWT_SECRET=some_long_random_string
   SMS_API_KEY=          # optional — see backend/config/config.js
   EMAIL_API_KEY=        # optional
   MAPS_API_KEY=         # optional — for a real map picker instead of the
                          # browser Geolocation "Use current location" button
   ```
4. **Frontend:** No changes needed — it only talks to `/api/...`, so it works
   against either backend unmodified.

---

## 7. Research & Improvements summary

The in-app page at `#/research` documents, for each of the four studied
portals: the features studied, the improvement opportunity identified through
comparative usability analysis, what was learned, and what was implemented
in this prototype. All wording follows academically safe phrasing
("the study identified an opportunity to...", "our proposed portal
improves...") rather than claiming any studied portal lacks a feature —
only publicly observable characteristics were used, and none of their
design, branding or code was copied.

| Gap identified | Solution implemented |
|---|---|
| Complex complaint registration | 5-step guided wizard |
| Category confusion | Visual icon-based categories with descriptions |
| Citizen doesn't know the department | Automatic department suggestion from category |
| Thin location detail | Area + address + landmark + pincode + optional GPS |
| Unclear status tracking | Visual step-by-step timeline |
| No centralized history | "My Complaints" dashboard with filters |
| Deadlines not prominent | Expected resolution date + SLA badges |
| Escalation opaque to citizens | 3-level escalation shown on every complaint |
| No structured feedback | Resolved → Feedback → auto-reopen-if-"No" |
| No resolution proof | Admin-uploaded remarks + photo before feedback |
| Scattered channels | One portal: Register / Track / My Complaints / Notifications / Feedback / Help |
| Poor mobile usability | Mobile-first responsive design throughout |

---

## 8. Notes on simulated integrations

This is a prototype, so a few real-world integrations are simulated rather
than wired to paid third-party services:

- **SMS / Email notifications** → simulated as in-app notifications
  (`backend/models/complaints.js`, the `notify()` function). The hook to plug
  in a real provider (e.g. Twilio, MSG91, SendGrid) is commented at that
  exact location.
- **Maps / GPS** → the "Use current location" button on the complaint form
  uses the browser's built-in Geolocation API (works today, no key needed).
  A full map picker would need a Maps JavaScript API key — see
  `backend/config/config.js` for where `MAPS_API_KEY` would be read.

---

## 9. Security & validation implemented

- Server-side validation on all forms (required fields, mobile number format,
  email format, password length, description minimum length)
- Photo upload type allow-list (JPG/PNG/WEBP/GIF) and 5MB size cap, enforced
  server-side regardless of what the browser sends
- Token-based authentication (Bearer tokens, 12-hour expiry); admin-only
  routes reject non-admin tokens with `403`
- Passwords are hashed before storage (never stored or returned in plain text)
- Citizens can only submit feedback on their own complaints
- No sensitive user data (password hashes) is ever sent to the frontend

---

*This README, the codebase, and the accompanying report are submitted as
part of a BSc IT Community Engagement Project under NEP 2020. The project
is an academic exercise and makes no claim of official status.*
#   n a g a r - s a h a y a k - c o m p l a i n t  
 