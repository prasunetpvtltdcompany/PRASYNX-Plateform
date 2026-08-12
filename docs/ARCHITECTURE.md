# PRASYNX Platform — Architecture

The legacy repo ran **8 role-siloed Express backends** (admin/staff/student/management/parents/jobprovider/web/voiceai), each a copy-paste of the same Express + Supabase + JWT scaffold, with per-role Next.js forks and direct Supabase calls from 3 frontends.

This workspace re-centers the platform as a **modular monolith** for the school domain (job-provider was explicitly dropped).

## Layout

```
apps/web            single Next.js app (route groups per portal)
server/             the modular monolith (Express) — THIS
packages/types      @prasynx/types  — shared DTOs
packages/config     @prasynx/config — env validation + RBAC permission matrix
packages/validation @prasynx/validation — authoritative zod schemas (server + web reuse)
supabase/           schema migrations — UNCHANGED (no schema redesign)
docker/             server image + compose
.github/workflows/  CI, CD-staging, CD-production
```

## Request flow

```
Client → LB/proxy → apiLimiter (IP) → requestId → helmet → cors → body-limit
  → route middlewares:
      authenticate  (JWT verify: signature + issuer + audience + live session)
      authorize     (RBAC: role → permission set)
      validate      (zod schema)
      audit         (structured log of mutating ops, non-blocking)
  → controller   (HTTP boundary only)
  → service      (domain rules; tenants, invariants, orchestration)
  → repository   (ONLY layer allowed to import Supabase)
      requestDb() = per-request RLS client built from the user's JWT
                    (falls back to service-role for bg jobs/health)
  → error handler (codes, requestId, never leaks internals)
```

Module interactions go through **services only** (never `require` another module's repository). Example: `attendance.service` fans out parent notifications by calling `enqueue('attendance.parentNotify')`, which the `communication` module handles in the background worker — no DB writes inside the request path.

## Layer contract (per module)

```
modules/<name>/
  <name>.routes.ts      URL wiring: verbs + middleware chain
  <name>.controller.ts  parse/respond; NO Supabase, NO business logic (thin)
  <name>.service.ts     domain rules; throws AppError; NO HTTP, NO SQL
  <name>.repository.ts  ALL Supabase calls; returns typed DTOs
  __tests__/            unit tests against stub repositories
```

ESLint enforces this: `no-restricted-imports` blocks `@supabase/supabase-js` in every non-repository file under `src/modules/**`.

## Supabase boundary

- Supabase is used **only** as PostgreSQL + Storage. Nothing is called from the frontend.
- Two client kinds, chosen deliberately (`infrastructure/database/supabase.ts`):
  - `db` (service-role): platform/admin ops, credentials provisioning, background jobs.
  - `rlsClient(jwt)` / `requestDb()`: default for business flows — respects RLS and binds to the caller.
- The request token is injected via `AsyncLocalStorage` (`infrastructure/context/requestContext.ts`), so repositories resolve the right client without threading parameters.
- Tenancy is enforced **twice**: `tenantId` claims checked in services, and `.eq('organisation_id', tenant)` filters in repositories.

## Auth & RBAC

- Custom JWT + bcrypt (matches existing `users` schema, bcrypt hashes stay compatible).
- **Access token** (15m) carries `{ sub, email, role, tenantId, sessionId, iss, aud }`.
- **Opaque refresh token** (30d) — only a SHA-256 hash is stored in the cache; **rotated on every refresh**; a reused/expired token is dead.
- **Sessions are revocable**: `sessionId` is checked live per request, so `logout` (single/all) kills access tokens before expiry.
- One permission matrix lives in `packages/config/src/permissions.ts` (roles → permissions). New roles do not fork the codebase.
- Cross-secret trust from the legacy system (`MANAGEMENT_JWT_SECRET` / `STAFF_JWT_SECRET` sharing) is intentionally **not reproduced** — one issuer, one audience, one secret.

## Security

| Control | Where |
|---|---|
| Password hashing | bcrypt (cost 12) in `auth.service`; never returned by APIs |
| Rate limiting | `shared/middleware/rateLimit.ts` — IP limiter on `/api`, user limiter per sensitive route, dedicated login limiter (IP + account) |
| Brute-force | per-account failure counter + lockout in Redis (`BRUTE_FORCE` in `infrastructure/jobs/queue.ts`) |
| Headers | helmet (defaults on; CSP enabled) |
| Body limits | `express.json({ limit: '256kb' })` |
| Validation | zod at every route boundary |
| Error surface | structured errors with `requestId`, no stack/secret leakage |

## Performance

- Redis is optional in dev (in-memory fallback) and used in prod for: rate limiting, sessions/refresh tokens, brute-force counters. `REDIS_URL` enables it.
- Side effects run on an in-process queue (`infrastructure/jobs/queue.ts`) — swap for BullMQ when durable multi-instance jobs are needed.
- SQL: aggregates/pagination kept on the DB side (`.count()`, `.gte/.lte/.range`), no client-side list math on hot paths.
- Swap in a cache layer per domain (e.g. dashboard reads) behind `CacheStore` — already the abstraction in `infrastructure/cache/cache.ts`.

## Frontend (`apps/web`)

Single Next.js app (App Router, server components + a thin client layer) that
replaces the 5 role-siloed portal forks. Browser code never imports Supabase
(ESLint guard in `apps/web/eslint.config.mjs`); all data goes through the
monolith API via `next.config.ts` rewrites (`/api/v1/*` -> `API_BASE_URL`).

Folder layout (strict):

```
apps/web/
├── app/
│   ├── auth/                # login, reset-password, verify-email (public)
│   └── (portals)/           # role-gated route groups
│       ├── admin/           # PRASYNX company admin (register-school, organisations)
│       ├── management/      # school management
│       ├── staff/           # non-teaching staff AND teachers
│       ├── student/
│       ├── parent/
│       └── jobprovider/     # placeholder (future)
├── components/ui/           # shared design system (themed once)
├── lib/                     # apiClient, auth, session store, route-groups
└── proxy.ts                 # Next 16 edge "middleware": role gate
```

Public marketing site lives in a separate app: `apps/platform` (migrated from
`prasynx-web-frontend`) - run `npm run dev:platform` (port 3001); its portal
sign-in links point at `apps/web` (port 3000) via `NEXT_PUBLIC_PORTALS_URL`.


- `proxy.ts` (Next 16 renamed Middleware -> Proxy) gates portals at the edge
  using the non-secret `prasynx.session` role cookie mirrored by `lib/session.ts`.
  Unauthenticated users are sent to `/auth/login`; wrong-role users bounce to
  their portal home. This is UX gating - the monolith is the security boundary
  (JWT verify + RBAC on every `/api/v1/*` request).
- `components/role-guard.tsx` + `lib/route-groups.ts` map routes to roles using
  the same `@prasynx/config` permission matrix the server uses.
- `lib/api.ts` is the single API client (bearer header, one silent refresh on
  401, logout on refresh failure). `lib/session.ts` persists only the refresh
  token client-side.
- Shared `@prasynx/types` DTOs and `@prasynx/validation` schemas are reused for
  request/response shapes, keeping web and server drift-free.
- The legacy `prasynx-management-frontend` SPA (Supabase-coupled, ~1.3MB single
  page) is NOT ported; its management features are rebuilt cleanly on the
  monolith API.

## Tests

`vitest` in `server/`. Modules are tested against stub repositories:
- `auth.service.test.ts` — login, wrong-password opacity, lockout, refresh rotation, revocation, logout-all.
- `attendance.service.test.ts` — mark/bulk validation, tenant scoping, class ownership, parent-only access, summary math.
- `exams.service.test.ts` — create validation, grade computation, tenant-scoped scheduling, self/child result access.
- `timetable.service.test.ts` — class grid, duplicate/invalid slot rejection, tenant scoping.
- `assignments.service.test.ts` — teacher binding, closed-assignment submissions, grade bounds, class scoping.
- `finance.service.test.ts` — structure totals, overpayment rejection, paid-status transitions, guardian statements.

## CI / CD

See `.github/workflows/`:
- `ci.yml` — lint, typecheck, test, build, `npm audit`, on PR + push.
- `cd-staging.yml` — Docker build → GHCR → SSH deploy + health gate (push to `develop`).
- `cd-production.yml` — same, on version tags `v*`.

## Roadmap (next milestones)

1. ~~Exams, timetable, assignments, finance modules~~ (same 5-layer pattern) — **DONE**.
2. ~~Single Next.js `apps/web` with per-role route groups replacing the 5 portal forks~~ — **DONE**
   (fence remaining direct Supabase usage in web/jobprovider/management frontends).
3. `audit_logs` persistence aligned to the table's real columns.
4. Async engine: Redis-backed BullMQ + durable job store.
5. Decommission the 7 legacy role backends once endpoints are verified in CI contract snapshots.