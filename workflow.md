# Staff Whereabouts — Project Workflow

## What Was Built

A Next.js + Supabase web app for **Cortex Robotics** to track staff offsite activities. Staff log in via a 6-digit PIN and can view and manage their own whereabouts. Admins have a fuller view with management controls.

---

## Phase 1 — Foundation

- Scaffolded Next.js project with Tailwind, Supabase JS client, and a custom CSS token system (light/dark mode)
- Supabase schema: `staff` table and `whereabouts` table with activity type, dates, times, location, purpose, notes
- Shared UI components: `ActivityBadge`, `StatusPill`, `ConfirmDialog`, `Toast`, `BottomNav`
- Auth via localStorage PIN session (`getSession` / `setSession`)

---

## Phase 2 — Core Features

| Feature | Detail |
|---|---|
| **Home dashboard** (`/`) | "Out Today" summary, upcoming entries, auto-refreshes every 60 seconds |
| **Activity log** (`/log`) | All-staff table with search, activity type filter, status filter |
| **Detail page** (`/log/[id]`) | Full entry view with Edit and Delete |
| **Add activity** (`/log/new`) | 3-step wizard: Staff → Activity Type → Details |
| **Staff directory** (`/staff`) | Lists all staff with links to individual profiles |

---

## Phase 3 — Staff Self-Service Portal (`/my`)

- `/my` — personal activity log filtered to the logged-in staff member
- `/my/new` — streamlined 2-step Add form (skips staff selection since session knows who they are)
- `/my/[id]` — personal detail page with Edit (no Delete)
- Separate 2-item bottom nav (Log + Add) on all `/my/*` routes

---

## Phase 4 — Role-Based Access

| Control | Admin | Staff |
|---|---|---|
| Delete entry | ✓ (any entry, any status) | ✗ |
| Edit entry | ✓ (any status) | ✓ Upcoming + Ongoing only |
| View all staff entries | ✓ `/log` | ✗ |
| View own entries | ✓ | ✓ `/my` |
| Bulk delete | ✓ checkbox + action bar | ✗ |

---

## Phase 5 — Data & UX Improvements

| Change | Detail |
|---|---|
| **New activity types** | Customer Support + Other (with colours, Supabase constraint updated — migration 004) |
| **Purpose field** | Renamed from Description, made mandatory |
| **Timeframe column** | Table shows actual time range (e.g. "9:00am – 5:30pm") instead of day count |
| **Hour duration** | Detail pages show "3.5 hours" when start/end times are set |
| **Status fix** | `computeStatus` uses actual end time — entries flip to Completed as soon as end time passes, not end of day |
| **Dark mode** | Secondary/tertiary text brightened for readability |
| **Toast notifications** | "Activity updated successfully" and "Activity deleted" after actions |
| **CORTEX ROBOTICS** | Branding footer on login screen |

---

## Phase 6 — Company Car

- `using_company_car` boolean field added to the form (Step 3 toggle alongside All-day)
- Company Car column in the activity table (teal "Yes" pill / muted dash)
- Migration 005 added the column to Supabase

---

## Phase 7 — Staff Import

- `scripts/import-staff.mjs` — one-off Node.js script to bulk-load staff from `CRCI.csv` into the Supabase `staff` table
- Skips duplicates by `staff_id`, zero-pads `access_id` to preserve leading zeros
- Run with: `node --env-file=.env.local scripts/import-staff.mjs`

---

## Repo & Deployment

- **GitHub:** `kumar-rpg/whereabouts` — all changes committed and pushed to `main`
- **Deployed:** Vercel (auto-deploys on push to `main`)

## Migrations Applied

| Migration | Description |
|---|---|
| 001 | Initial schema — `staff` and `whereabouts` tables |
| 002 | Seed data |
| 003 | `role` column on `staff` table |
| 004 | Added `customer_support` and `other` to `valid_activity_type` CHECK constraint |
| 005 | Added `using_company_car` boolean column to `whereabouts` |
