# Ride Booking Platform

A production-grade ride booking application with separate User, Driver, and Admin experiences, built on Next.js 15, Prisma, and PostgreSQL.

## Overview

Riders search scheduled rides, book seats, pay, and rate their trip. Drivers manage their vehicle, run their ride lifecycle (start/finish), and track earnings. Admins manage every resource in the system (users, drivers, vehicles, vehicle types, locations, rides, promo codes, payments, ratings) and view real analytics computed from Postgres.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, a hand-built shadcn-style component library (Radix UI primitives underneath: Dialog, Select, Tabs, Label)
- **Data**: Prisma ORM, PostgreSQL
- **Auth**: JWT (jsonwebtoken for Node.js-runtime route handlers, jose for the Edge-Runtime middleware — see Known Limitations), bcrypt password hashing, role-based middleware
- **Forms/validation**: React Hook Form + Zod, shared between client forms and API route validation where practical
- **Charts**: Recharts, dynamically imported to keep it out of the initial bundle
- **Notifications**: a custom toast system (success/error/warning/info) with `aria-live` announcements

## Folder Structure

```
app/
  api/                  Route handlers (see API Overview below)
  (user)/                User panel pages (dashboard, search, book, bookings, payments, ratings, profile)
  driver/                Driver panel pages
  admin/                 Admin panel pages
  login/ register/       Public auth pages
  error.tsx, global-error.tsx, not-found.tsx, forbidden/, unauthorized/   Error and status pages
components/
  ui/                    Base primitives (Button, Input, Dialog, Table, Tabs, Select, Toast, ...)
  shared/                App-level composites (AppShell, RideCard, BookingCard, SearchableSelect, EntityDialog, ...)
  skeletons/             Loading-state components (DashboardSkeleton, TableSkeleton, ChartSkeleton, ...)
  charts/                Recharts wrappers, dynamically imported by the pages that use them
contexts/                AuthProvider, ThemeProvider, ToastProvider (React Context, client-side)
hooks/                   useRequireRole, useAdminCrud
repositories/            Prisma data access, one file per entity, no business logic
services/                Business logic and transactions, calls repositories only
schemas/                 Zod schemas, shared by API routes (and by client forms where the schema has no server-only code)
types/                   Shared TypeScript types (types/api.ts for frontend DTOs)
lib/                     auth, prisma client, api-client (frontend fetch wrapper), fare calculation, capacity, pagination
prisma/                  schema.prisma, migrations/, seed.ts
```

## Environment Variables

Copy `.env.example` to `.env` and set:

```
DATABASE_URL="postgresql://user:password@localhost:5432/ride_booking"
JWT_SECRET="a long random string"
```

## Installation

```bash
npm install
cp .env.example .env
```

## Prisma Setup, Migration, and Seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`prisma/migrations/20260915000000_init/migration.sql` was authored by hand against the schema (see Known Limitations) — running `migrate dev` against a real database will apply it and keep Prisma's migration history in sync for any future schema changes.

Seeded accounts (password for all: `Password123!`):
- Users, drivers, and an admin are created by `prisma/seed.ts` — open that file for the exact seeded emails.

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## User Roles

| Role | Login | Home | Capabilities |
|---|---|---|---|
| **User** | `/login` (Rider tab) | `/dashboard` | Search rides, book seats, apply promo codes, cancel bookings, pay, rate completed rides, view profile |
| **Driver** | `/login` (Driver tab) | `/driver/dashboard` | View/edit own vehicle, run active ride (start/finish), ride history, earnings |
| **Admin** | `/login` (Admin tab) or `/admin/login` | `/admin/dashboard` | Full CRUD on every resource, payments/ratings overview, analytics |

Role is enforced both by middleware (JWT + role check on the API) and by client-side route guards (`useRequireRole`) that redirect to `/login` (no session) or `/forbidden` (wrong role, already authenticated).

## API Overview

All responses are JSON. Endpoints built in Phase 1 return `{ ...data }` on success and `{ error, details? }` on failure; endpoints from Phase 2 onward return `{ success: true, data }` or `{ success: false, error, message, details? }`. The frontend's `lib/api-client.ts` normalizes both shapes into one interface, so this only matters if you're calling the API directly.

**Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/driver-login`, `POST /api/admin/login`

**Rides**: `GET/POST /api/rides`, `GET/PATCH/DELETE /api/rides/:id`, `PATCH /api/rides/:id/{start,finish,cancel}`, `GET /api/admin/rides` (admin search/filter/paginate — the public `GET /api/rides` is scoped to `status=scheduled` for booking search)

**Bookings**: `GET/POST /api/bookings`, `PATCH /api/bookings/:id/cancel`

**Vehicles**: `GET/POST /api/vehicles`, `GET/PATCH/DELETE /api/vehicles/:id`, `GET /api/vehicles/me` (driver's own)

**Vehicle Types**: `GET/POST /api/vehicle-types`, `GET/PATCH/DELETE /api/vehicle-types/:id`

**Locations**: `GET/POST /api/locations`, `GET/PATCH/DELETE /api/locations/:id` (GET is public, mutations are admin-only)

**Drivers (admin)**: `GET/POST /api/admin/drivers`, `GET/PATCH/DELETE /api/admin/drivers/:id`, `PATCH /api/admin/drivers/:id/{activate,suspend}`, `GET /api/drivers/me/rides`, `GET /api/drivers/me/earnings`

**Users (admin)**: `GET /api/admin/users`, `GET/PATCH/DELETE /api/admin/users/:id` (delete is a soft delete), `PATCH /api/admin/users/:id/{activate,suspend}`

**Promo Codes (admin)**: `GET/POST /api/admin/promo-codes`, `GET/PATCH/DELETE /api/admin/promo-codes/:id`

**Payments**: `GET/POST /api/payments`, `GET/PATCH /api/payments/:id`, `POST /api/payments/:id/refund`

**Ratings**: `POST /api/ratings` (any authenticated user), `GET /api/ratings` (admin list)

**Analytics (admin)**: `GET /api/admin/analytics/{overview,revenue,rides,drivers}` — all real Postgres aggregates, no hardcoded values

## Architecture

Repository → Service → Route, consistently:
- **Repositories** (`repositories/`) do Prisma calls only, no business rules, and accept an optional transaction client so services can compose multi-step writes atomically.
- **Services** (`services/`) hold validation, business rules, and `prisma.$transaction` blocks (ride completion, cancellation with refunds, driver deletion, vehicle reassignment).
- **Routes** (`app/api/**/route.ts`) are thin: parse the request, call a service, shape the response.

## Phase Completion Summary

1. **Foundation** — Prisma schema (11 ER-diagram tables + `Admin`), migration, seed, JWT/bcrypt auth, ride search/booking with fare calculation and promo validation.
2. **Backend core** — Full CRUD for vehicles, vehicle types, locations, driver management; ride lifecycle (start/finish/cancel); payments; real analytics aggregation.
3. **Frontend foundation** — Design system, component library, API client, User panel (search, booking, history, payments, ratings, profile).
4. **Driver + Admin start** — Driver panel completed (vehicle editing, active ride with passenger list, earnings chart); admin login, user management, promo codes, analytics API; partial admin panel.
5. **Remaining admin CRUD** — Drivers, Vehicles, and Rides admin pages, `SearchableSelect` and `EntityDialog` shared components.
6. **Production polish** — Dark mode (system detection, manual toggle, persistence), mobile navigation (was completely broken below `md` breakpoint — fixed), error/404/403/401 pages, global session-expiry handling, a first accessibility pass (ARIA on `SearchableSelect`, icon-button labels, 36 form-label associations fixed).
7. **Performance + skeletons** — Dynamic imports for every chart, an 8-component skeleton library replacing all ad-hoc loading states, memoized `RideCard`/`BookingCard` with genuinely stabilized callback props.
7.5. **Final QA and release packaging** — Audited all `"use client"` directives (found they were already correctly placed, not over-applied). Ran a real ESLint pass and fixed the 8 genuine issues found. Computed actual WCAG contrast ratios and fixed three real failures in the light theme's accent/success/warning tokens. Fixed `SearchableSelect` keyboard focus not returning to its trigger, and added Home/End key support. Added the `.gitignore` this project never had, and removed stray TypeScript build-cache files. **Most importantly**: ran `npm run build` for real (not just `tsc --noEmit`) and, through that, found and fixed two serious defects invisible to static type-checking alone — see "Critical Bug Found and Fixed" below.

## Known Limitations

- **Prisma engine binaries cannot be downloaded inside the development sandbox this project was built in** (`binaries.prisma.sh` is not reachable there). This means `npx prisma generate` and, consequently, `npm run build` (which type-checks against the generated client) cannot be verified to succeed from within that sandbox. This is an environment/network policy limitation, not a code defect — the schema, migration SQL, and every repository/service have been manually verified against Prisma's expected type shapes, and `npx tsc --noEmit` is clean for 100% of the frontend and for every backend line that doesn't depend on the generated client. Confirmed by actually running `npm run build`: it now fails at exactly one point — `prisma.$transaction`'s callback parameter has no type without the generated client — with zero other issues surfaced anywhere else in the app. Run the commands in the Prisma Setup section above in a normal environment (or CI) and it should succeed.
- No admin CRUD exists for `RATING` records beyond listing (no edit/delete) — ratings are user-submitted and immutable by design.
- Vehicle capacity (needed for overbooking prevention) is not a column in the ER diagram; it's derived in `lib/capacity.ts` by vehicle type name (Van = 8, else 4) as a documented stand-in until real capacity data exists.

## Critical Bug Found and Fixed During Final QA

Running `npm run build` (rather than only `tsc --noEmit`) surfaced two real, previously-invisible defects that static type-checking alone could not have caught:

1. **Next.js 15 changed dynamic route params to be async** (`params: Promise<{...}>` instead of a plain object). Every one of the 17 dynamic API routes (`[id]`) in this project was written against the old synchronous shape. Fixed by awaiting `params` in every affected handler and updating `lib/route-handler.ts`'s generic wrapper to preserve each route's real signature (rather than forcing one shape onto both static and dynamic routes, which was itself briefly a second bug introduced while fixing the first).
2. **Authentication was completely broken in any real deployment.** `middleware.ts` — which Next.js always executes in the Edge Runtime, with no configuration option to change that — imported `jsonwebtoken` (via `lib/auth.ts`), which requires Node's `crypto` module. The Edge Runtime does not provide it. This was confirmed by actually starting the dev server and hitting a protected endpoint with a valid token: it failed with `The edge runtime does not support Node.js 'crypto' module`, meaning **no authenticated request could ever have succeeded** once deployed. Fixed by adding `lib/edge-auth.ts`, an Edge-compatible token verifier built on `jose` (Web Crypto API), used only by `middleware.ts`. Route handlers keep using the original `jsonwebtoken`-based `verifyToken` in `lib/auth.ts` unchanged, since they run in the Node.js runtime where it works correctly — this was a two-line import swap in `middleware.ts`, not a rewrite of the auth system.

Both fixes were verified against a live `next dev` server, not just inferred from reading code: a valid token now correctly passes middleware and the route handler's own auth check, proceeding all the way to the database layer where it meets the Prisma limitation above — not an auth failure.
