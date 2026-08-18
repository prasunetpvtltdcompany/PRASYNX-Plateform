# PRASYNX Platform

Enterprise-grade modular monolith for school management (Admin/Teacher/Student/Parent portals). This workspace replaces the legacy role-siloed apps (`prasynx-admin-*`, `prasynx-staff-*`, ...) — they have been fully migrated into the monolith and removed.

## Repository layout

```
server/                  Express modular monolith (the API)
apps/web/                single Next.js frontend (per-role route groups)
apps/mobile/             Expo app (not part of the npm workspaces)
packages/
  types/       @prasynx/types        shared DTOs
  config/      @prasynx/config       env validation + RBAC matrix
  validation/  @prasynx/validation   zod schemas
docker/        server image + docker-compose
.github/workflows/  CI + CD (staging/prod)
docs/          ARCHITECTURE.md, API.md
supabase/      schema migrations
```

## Quickstart

Requirements: Node >= 22, npm.

```bash
npm install
cp server/.env.example server/.env   # fill in real Supabase keys
npm run dev                   # boots the API on :4000
npm run dev:web               # boots the single frontend on :3000 (needs the API)
```

Verify: `curl http://localhost:4000/api/health` → `{"status":"ok",...}`

### Commands (workspace-wide)

```bash
npm run lint        ESLint (incl. the Supabase-only-in-repositories guard)
npm run typecheck   tsc --noEmit for all packages
npm run test        vitest
npm run build       tsc build for the server
```

## Environment

See `server/.env.example` for the full contract (server validates it at boot and refuses
to start half-configured). Key vars:

| Var | Purpose |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` | DB + Storage only |
| `JWT_SECRET` (>= 32 chars), `JWT_ISSUER`, `JWT_AUDIENCE` | token signing/pinning |
| `REDIS_URL` | sessions, rate limiting, lockouts (in-memory fallback in dev) |
| `ALLOWED_ORIGINS` | CORS allowlist |
| `SMTP_*`, `FRONTEND_URL` | mail (JSON preview transport when unset) |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — modules, request flow, Supabase boundary, auth/RBAC, security, performance.
- [`docs/API.md`](docs/API.md) — full endpoint reference.

## Migration status

Done: auth (+ refresh rotation/revocation), users, organisations (register-school), classes, attendance, exams, timetable, assignments, finance, RBAC, rate limiting, brute-force lockout, cache abstraction, queue, CI/CD, Docker, single `apps/web` frontend with per-role route groups + edge role gate (`proxy.ts`), all portals migrated (admin, management, job provider, voiceai, parent, staff, student).

Next: DB-level `audit_logs` wiring → harden web auth (same-site cookies / CSRF) → CD for the web app.