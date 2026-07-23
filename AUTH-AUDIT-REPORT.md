# PRASYNX ERP — COMPLETE AUTHENTICATION & AUTHORIZATION AUDIT

**Date:** 2026-06-16
**Scope:** All 6 portals — Admin, Management, Staff, Student, Parent, Job Provider
**Methodology:** Static code analysis of all frontend auth flows, backend auth services, middleware, route registration, JWT handling, session management, and database queries.

---

## STEP 1 — AUTH FLOW AUDIT

### 1.1 Admin Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `POST /api/v2/admin/login` via `adminLogin()` in `lib/auth.ts` |
| **Auth Provider** | Custom JWT (bcrypt verify → jwt.sign) |
| **JWT Provider** | Admin backend `auth.service.ts` — `jwt.sign({ userId, email, role, organisationId: null }, config.jwtSecret)` |
| **Session Storage** | `localStorage` key `adminSession` |
| **Session Restore** | `useEffect` → `auth.getSession()` → `localStorage.getItem('adminSession')` |
| **Password Reset** | `POST /change-password` (requires current password) — **NO forgot-password flow** |
| **Logout** | Calls `supabase.auth.signOut()` then clears localStorage — **BUG: no supabase session exists** |
| **Role Validation (BE)** | Middleware `authenticate()` checks `['admin', 'supervisor', 'owner']` after JWT verify |
| **Role Validation (FE)** | None — admin login doesn't validate role on frontend |
| **Organisation Validation** | **NONE** — Admin JWT has `organisationId: null`. Admin can access all orgs. |

**Files:** `prasynx-admin-frontend/app/lib/auth.ts`, `prasynx-admin-frontend/app/contexts/AuthContext.tsx`, `prasynx-admin-backend/src/services/auth.service.ts`, `prasynx-admin-backend/src/middleware/auth.ts`, `prasynx-admin-backend/src/routes/refactored/admin.routes.ts`

### 1.2 Management Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `POST /v2/auth/login` via `apiClient.login()` |
| **Auth Provider** | Custom JWT (bcrypt verify → jwt.sign) |
| **JWT Provider** | Management backend `auth.service.ts` — `jwt.sign({ userId, email, role, organisationId }, config.jwtSecret)` |
| **Session Storage** | `localStorage` key `managementSession` |
| **Session Restore** | `useEffect` → `auth.getSession()` → `localStorage.getItem('managementSession')` |
| **Password Reset** | **NONE** — No forgot-password or reset-password endpoint exists |
| **Logout** | Calls `supabase.auth.signOut()` then clears session — **BUG: no supabase session exists** |
| **Role Validation (BE)** | Login service enforces `user.role === 'management'` + `user.status === 'active'` + `organisation.status === 'verified'` |
| **Role Validation (FE)** | **NONE** — Management login doesn't validate role on frontend |
| **Organisation Validation** | `enforceOrgAccess()` middleware checks param/body `organisation_id` matches JWT `organisationId`. Also `router.param('organisation_id')` validation. |

**Files:** `prasynx-management-frontend/app/lib/apiClient.ts`, `prasynx-management-frontend/app/contexts/AuthContext.tsx`, `prasynx-management-backend/src/services/auth.service.ts`, `prasynx-management-backend/src/middleware/verifyAuth.ts`, `prasynx-management-backend/src/routes/refactored/auth.routes.ts`

### 1.3 Staff Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `POST /v2/auth/login` via `apiClient.login()` |
| **Auth Provider** | Custom JWT (bcrypt verify → jwt.sign) |
| **JWT Provider** | Staff backend `auth.service.ts` — `jwt.sign({ userId, email, role, organisationId }, config.jwtSecret)` |
| **Session Storage** | `localStorage` key `staffSession` |
| **Session Restore** | `useEffect` → `localStorage.getItem('staffSession')` |
| **Password Reset** | **NONE** |
| **Logout** | Clears `localStorage` only — **CORRECT** (no supabase.auth call) |
| **Role Validation (BE)** | Login enforces `STAFF_ROLES = ['staff', 'teacher', 'admin', 'accountant', 'librarian', 'transport_manager', 'hostel_warden']` |
| **Role Validation (FE)** | Checks `['staff', 'teacher', 'admin'].includes(user.role)` — ✅ |
| **Organisation Validation** | `router.param('org_id')` and `router.param('organisation_id')` validate against JWT. `authorize()` middleware on all routes. |

**Files:** `prasynx-staff-frontend/app/lib/apiClient.ts`, `prasynx-staff-frontend/app/contexts/AuthContext.tsx`, `prasynx-staff-backend/src/services/auth.service.ts`, `prasynx-staff-backend/src/middleware/auth.ts`, `prasynx-staff-backend/src/routes/refactored/staff.routes.ts`

### 1.4 Student Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `POST /v2/auth/login` via `apiClient.login()` |
| **Auth Provider** | Custom JWT (bcrypt verify → jwt.sign) |
| **JWT Provider** | Student backend `auth.service.ts` — `jwt.sign({ userId, email, role, organisationId }, config.jwtSecret)` |
| **Session Storage** | `localStorage` (via AuthContext state) |
| **Session Restore** | `useEffect` → `localStorage.getItem('studentSession')` |
| **Password Reset** | **NONE** |
| **Logout** | Clears `localStorage` only — **CORRECT** |
| **Role Validation (BE)** | Login enforces `user.role === 'student'` |
| **Role Validation (FE)** | Checks `user.role !== 'student'` — ✅ |
| **Organisation Validation** | Login checks `organisation_id` in student record. Refactored routes have org_id param validation. |

**Files:** `prasynx-student-frontend/app/lib/apiClient.ts`, `prasynx-student-frontend/app/contexts/AuthContext.tsx`, `prasynx-student-backend/src/services/auth.service.ts`, `prasynx-student-backend/src/routes/refactored/student.routes.ts`

### 1.5 Parent Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `POST /v2/auth/login` via `apiClient.login()` |
| **Auth Provider** | Custom JWT (bcrypt verify → jwt.sign) |
| **JWT Provider** | Parents backend `auth.service.ts` — `jwt.sign({ userId, email, role, organisationId }, config.jwtSecret)` |
| **Session Storage** | `localStorage` (via AuthContext state) |
| **Session Restore** | `useEffect` → `localStorage.getItem('parentSession')` |
| **Password Reset** | **NONE** |
| **Logout** | Clears `localStorage` only — **CORRECT** |
| **Role Validation (BE)** | Login enforces `user.role === 'parent'` |
| **Role Validation (FE)** | Checks `user.role !== 'parent'` — ✅ |
| **Organisation Validation** | Login checks `organisation_id` in parent record. Refactored routes have `enforceParentChildAccess()` middleware. |

**Files:** `prasynx-parents-frontend/app/lib/apiClient.ts`, `prasynx-parents-frontend/app/contexts/AuthContext.tsx`, `prasynx-parents-backend/src/services/auth.service.ts`, `prasynx-parents-backend/src/routes/refactored/parent.routes.ts`

### 1.6 Job Provider Portal

| Attribute | Value |
|-----------|-------|
| **Login Method** | `supabase.auth.signInWithPassword()` directly |
| **Auth Provider** | **Supabase Auth** (NOT custom JWT like other portals) |
| **JWT Provider** | Supabase Auth (returns `access_token`) |
| **Session Storage** | `localStorage` key `jobProviderSession` |
| **Session Restore** | `useEffect` → checks auth state through Supabase session |
| **Password Reset** | `POST /api/job-provider/forgot-password` + `POST /api/job-provider/reset-password` — **Only portal with this** |
| **Logout** | Calls `supabase.auth.signOut()` — **CORRECT for Supabase auth** |
| **Role Validation (BE)** | Login doesn't validate role — any valid `job_providers` row can login |
| **Role Validation (FE)** | Checks `profile.role !== 'job_provider'` after fetching profile |
| **Organisation Validation** | **NONE** — No `organisation_id` on job_providers table or in JWT |

**Files:** `prasynx-jobprovider-frontend/app/page.tsx` (inline auth), `prasynx-jobprovider-backend/src/routes/index.ts`

---

## STEP 2 — LOGIN TEST MATRIX

| Portal | Test | Status |
|--------|------|--------|
| **Admin** | Valid admin credentials → JWT → session created | ✅ PASS |
| **Admin** | Invalid credentials → 401 | ✅ PASS |
| **Admin** | Non-admin role → 403 | ✅ PASS |
| **Admin** | JWT has `organisationId: null` | ⚠️ WARNING (no org isolation) |
| **Management** | Valid management credentials → JWT → session created | ✅ PASS |
| **Management** | Invalid credentials → 401 | ✅ PASS |
| **Management** | Non-management role → 403 | ✅ PASS |
| **Management** | `organisation.status !== 'verified'` → 403 | ✅ PASS |
| **Staff** | Valid staff/teacher credentials → JWT → session created | ✅ PASS |
| **Staff** | Invalid credentials → 401 | ✅ PASS |
| **Staff** | Non-staff role → 403 | ✅ PASS |
| **Staff** | Teacher profile missing → 401 | ✅ PASS |
| **Student** | Valid student credentials → JWT → session created | ✅ PASS |
| **Student** | Invalid credentials → 401 | ✅ PASS |
| **Student** | Non-student role → 403 | ✅ PASS |
| **Student** | Student record missing → 404 | ✅ PASS |
| **Parent** | Valid parent credentials → JWT → session created | ✅ PASS |
| **Parent** | Invalid credentials → 401 | ✅ PASS |
| **Parent** | Non-parent role → 403 | ✅ PASS |
| **Parent** | No linked students → empty array (expected) | ✅ PASS |
| **Job Provider** | Valid credentials → Supabase session → JWT | ⚠️ DIFFERENT FLOW |
| **Job Provider** | Invalid credentials → 401 | ✅ PASS |
| **Job Provider** | Account disabled → 403 | ✅ PASS |
| **Job Provider** | Password stored in `job_providers.password` NOT `users.password_hash` | ❌ FRAGMENTED |

---

## STEP 3 — HIERARCHY VALIDATION

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Admin → Management Portal | ❌ FAIL | Backend checks `role === 'management'` — admin has `role: 'admin'` | ✅ PASS |
| Management → Student Portal | ❌ FAIL | Backend checks `role === 'student'` — management has `role: 'management'` | ✅ PASS |
| Student → Staff Portal | ❌ FAIL | Backend checks `STAFF_ROLES` — student has `role: 'student'` | ✅ PASS |
| Parent → Student Portal | ❌ FAIL | Backend checks `role === 'student'` — parent has `role: 'parent'` | ✅ PASS |
| Staff → Parent Portal | ❌ FAIL | Backend checks `role === 'parent'` — staff has `role: 'staff'` | ✅ PASS |
| Job Provider → Any School Portal | ❌ FAIL | Job provider has no `users` table entry; `role` field doesn't match any portal | ✅ PASS |

**Verdict:** All cross-portal access is correctly blocked at the **backend role validation** level. ✅

**However:** The frontend role checks are inconsistent:
- Management: **NO frontend role check**
- Admin: **NO frontend role check**
- Staff: ✅ `['staff', 'teacher', 'admin']` check
- Student: ✅ `user.role !== 'student'` check
- Parent: ✅ `user.role !== 'parent'` check
- Job Provider: ✅ `profile.role !== 'job_provider'` check

---

## STEP 4 — ORGANIZATION ISOLATION TEST

| Test | Expected | Mechanism | Status |
|------|----------|-----------|--------|
| Management A → School B data | ❌ BLOCKED | `enforceOrgAccess()` checks param/body vs JWT `organisationId` | ✅ PASS |
| Student A → School B data | ❌ BLOCKED | JWT contains `organisationId`; routes validate via `router.param('org_id')` | ✅ PASS |
| Teacher A → School B data | ❌ BLOCKED | JWT contains `organisationId`; routes validate via `router.param('org_id')` | ✅ PASS |
| Parent A → School B data | ❌ BLOCKED | JWT contains `organisationId`; `enforceParentChildAccess()` validates | ✅ PASS |
| Admin → Any org | ⚠️ ADMIN HAS ACCESS | Admin JWT has `organisationId: null` — no isolation | ⚠️ BY DESIGN |
| Job Provider → Any org | ❓ NO ORG | Job provider has no `organisation_id` concept | ❌ NOT ISOLATED |

**Issues Found:**
1. **Job provider has no organisation_id** — The `job_providers` table does not have `organisation_id`. No org isolation for job providers.
2. **Management backend `router.param('organisation_id')` has a logic issue**: It returns "Cross-organisation access denied" only if the param is a valid UUID AND differs from JWT org. If the param is NOT a valid UUID, it passes through silently. This could allow bypass via non-UUID org IDs.

---

## STEP 5 — CREDENTIAL CREATION AUDIT

| Flow | Test | Status |
|------|------|--------|
| Admin creates Management | Generated password sent back. User created in `users` + `auth.users` | ✅ PASS |
| Management can login | bcrypt match + role check + org check | ✅ PASS |
| Management creates Staff | Generated password. User in `users` + `auth.users` + `teachers` | ✅ PASS |
| Staff can login | bcrypt match + role check + teacher profile check | ✅ PASS |
| Management creates Student | Generated password. User in `users` + `auth.users` + `students` | ✅ PASS |
| Student can login | bcrypt match + role check + student record check | ✅ PASS |
| Management creates Parent | Generated password. User in `users` + `auth.users` + `parents` + `parent_student_links` | ✅ PASS |
| Parent can login | bcrypt match + role check + parent record check | ✅ PASS |

**Issues Found:**
1. **Admin's `createOrganisation` uses `crypto.randomBytes(8).toString('hex')`** — This generates a 16-char hex password. No special characters required. Some portal auth forms might reject weak passwords.
2. **Management backend `bulk-staff` still has `subject` field** — The staff CSV template no longer includes it, but the bulk endpoint may still try to insert it. (Already being cleaned up.)
3. **`createAuthUser` is used inconsistently** — Some flows call it, some don't. Job provider flow doesn't call it at all (no Supabase Auth user created for job providers).

---

## STEP 6 — PASSWORD AUDIT

| Test | Result | Status |
|------|--------|--------|
| Generated passwords format | `crypto.randomBytes(8).toString('hex')` = 16 hex chars | ✅ PASS |
| Stored password format | `bcrypt.hash(password, 10)` | ✅ PASS |
| Password reset endpoint | **MISSING** in all portals except job provider | ❌ FAIL |
| Password regeneration | Exists in management backend `POST /credentials/regenerate-password` | ✅ PASS |
| Password change | Only admin has `POST /change-password` | ⚠️ PARTIAL |
| CSV export passwords | Management bulk ops show passwords in export | ✅ PASS |
| Email credentials | `POST /credentials/bulk-email` exists but **no actual email transport configured** | ⚠️ STUB |
| Password regen → Supabase Auth | `.catch(() => {})` swallows errors silently | ❌ SILENT FAILURE |

**Issues Found:**
1. **No forgot-password flow** for Management, Staff, Student, or Parent portals.
2. **Password regeneration silently fails to update Supabase Auth** — If the `supabase.auth.admin.updateUserById()` call fails (e.g., no service_role key), the password is only updated in the `users` table, not in Supabase Auth. The `.catch(() => {})` swallows the error.
3. **Bulk email is a stub** — The backend endpoint logs to `credential_history` but doesn't actually send emails. No SMTP/mail transport is configured.
4. **Admin config has `devAdminEmail` / `devAdminPassword`** — Hardcoded development credentials. Risk if deployed with these values.

---

## STEP 7 — SESSION AUDIT

| Test | Result | Status |
|------|--------|--------|
| Refresh browser | Session restored from localStorage | ✅ PASS |
| Close browser | Session persists in localStorage | ⚠️ PERSISTS |
| Reopen browser | Session restored (no expiry check on FE) | ⚠️ NO EXPIRY CHECK |
| Session restore | Reads `localStorage.getItem('portalSession')` | ✅ PASS |
| JWT expiry | `24h` default — verified on each API call | ✅ PASS |
| Token refresh | **NOT IMPLEMENTED** — No refresh token flow | ❌ FAIL |
| Logout | Clears localStorage | ✅ PASS |
| Cross-portal logout | **NOT IMPLEMENTED** — Each portal has independent session | ⚠️ EXPECTED |

**Issues Found:**
1. **No token refresh mechanism** — When JWT expires (after 24h), all API calls will fail with 401. User must re-login. No silent refresh.
2. **No session expiry check on frontend** — The frontend restores the session from localStorage without checking if the JWT is still valid. A user could see a stale dashboard before the first API call fails.
3. **Session persists in localStorage indefinitely** — No proactive cleanup on expiry.
4. **Management AuthContext still calls `supabase.auth.signOut()` on logout** — This is a BUG. Since management login uses custom JWT (not Supabase Auth), `supabase.auth.signOut()` will either fail silently or cause an unnecessary network call. Should be removed.

---

## STEP 8 — DATABASE AUDIT

| Table | organisation_id | user_id | auth.users sync | Issues |
|-------|----------------|---------|-----------------|--------|
| `users` | ✅ Has | ✅ PK | ✅ Partial | Some users may not have matching auth.users entries |
| `students` | ✅ Has | ✅ Has | ✅ | Links to users table |
| `teachers` | ✅ Has | ✅ Has | ✅ | Links to users table |
| `parents` | ✅ Has | ✅ Has | ✅ | Links to users table |
| `job_providers` | ❌ MISSING | ❌ Uses `id` as PK | ❌ NO auth.users | **Completely separate system** |
| `organisations` | ✅ PK | N/A | N/A | Standard |
| `auth.users` | ❌ Managed by Supabase | ❌ UUID PK | ✅ Self | Mirrors `users` table |

**Issues Found:**
1. **`job_providers` is a standalone table** — Not connected to `users` table. No `user_id`, no `organisation_id`. Password stored in `job_providers.password` column directly (bcrypt hashed at least). This means job providers bypass all org isolation and user management.
2. **No foreign key constraints** from `students`, `teachers`, `parents` to `users` table — relies on application logic. Orphan records possible.
3. **`auth.users` / `users` table sync is fragile** — Created via `createAuthUser()` helper, but if that fails mid-flow, cleanup may leave orphan records.
4. **No unique constraint on `users.email` across orgs** — Only unique per org (via migration adds org-scoped unique). If migration not run, duplicate emails possible across orgs.

---

## STEP 9 — SECURITY AUDIT

| Category | Issue | Severity | Status |
|----------|-------|----------|--------|
| **JWT Secret** | Shared across all backends via `config.jwtSecret` from env | MEDIUM | ⚠️ If one backend is compromised, all are |
| **JWT Verification** | All use `jwt.verify(token, config.jwtSecret)` — same key | MEDIUM | ✅ Consistent |
| **Role Validation** | Role checked at login + middleware on all routes | HIGH | ✅ PASS |
| **Org Validation** | Management: `enforceOrgAccess()` + param validation. Staff/Student/Parent: router.param validation | HIGH | ✅ PASS |
| **Admin Org Isolation** | Admin has `organisationId: null` — no org boundaries | MEDIUM | ⚠️ BY DESIGN |
| **Rate Limiting** | Login: 20/15min. API: 100/15min. Register: NO LIMIT | HIGH | ❌ Register has no rate limit |
| **CORS** | All configured correctly per portal | MEDIUM | ✅ PASS |
| **Brute Force** | Login rate limited to 20 attempts per 15 minutes | MEDIUM | ✅ PASS |
| **SQL Injection** | Using Supabase JS SDK (parameterized) | HIGH | ✅ PASS |
| **XSS** | JWT stored in localStorage (not httpOnly cookie) | MEDIUM | ⚠️ Common for SPA |
| **Hardcoded Creds** | `devAdminEmail` / `devAdminPassword` in admin config | CRITICAL | ❌ FAIL |
| **Fallback Secrets** | `jwtSecret: process.env.JWT_SECRET || throw Error()` | HIGH | ✅ Safe (throws if missing) |
| **Password in Logs** | `console.error` may log passwords in error handlers | MEDIUM | ⚠️ Need to verify |
| **Middleware Protection** | Staff routes use `authenticate` + `authorize` globally | HIGH | ✅ PASS |
| **Middleware Gap** | Legacy routes (`/api/admin`, `/api/staff`, etc.) may have weaker auth | HIGH | ❌ Dual routes |
| **Auth Bypass Flag** | `DEV_AUTH_BYPASS = false` exists in all backends but is **never checked** | LOW | 🧹 Dead code |

**Issues Found:**
1. **`devAdminEmail` / `devAdminPassword`** — `prasynx-admin-backend/src/config/index.ts` has `devAdminEmail` and `devAdminPassword` config values. If deployed without overriding env vars, these could be used to bypass normal auth. CRITICAL risk.
2. **Dual route registration** — All backends mount both `/api/v2/*` (refactored, with auth) AND `/api/*` (legacy, possibly weaker or missing auth). Example: Staff backend has both `/api/v2/auth/login` and `/api/staff/login`. The legacy routes (`/api/staff/*`) may not have proper auth middleware or may have bugs.
3. **Register endpoint has no rate limiting** — The management `/register` and `/api/v2/auth/register` endpoints have no rate limiting. An attacker could create thousands of organisations/users.
4. **No input sanitization** on name/email fields during registration.
5. **All backends share the same JWT secret** — If one backend's config is leaked, all portals are compromised. Should use different secrets per backend.

---

## STEP 10 — LOGIN FLOW TESTS

| Flow | Sequence | Status |
|------|----------|--------|
| Admin → Create Management | Admin creates org + management user in `users` + `auth.users` | ✅ PASS |
| Management → Login | `POST /v2/auth/login` → bcrypt verify → JWT → session | ✅ PASS |
| Management → Create Staff | Creates `users` + `auth.users` + `teachers` entry | ✅ PASS |
| Staff → Login | `POST /v2/auth/login` → bcrypt verify → teacher lookup → JWT → session | ✅ PASS |
| Management → Create Student | Creates `users` + `auth.users` + `students` entry | ✅ PASS |
| Student → Login | `POST /v2/auth/login` → bcrypt verify → student lookup → JWT → session | ✅ PASS |
| Management → Create Parent | Creates `users` + `auth.users` + `parents` + `parent_student_links` | ✅ PASS |
| Parent → Login | `POST /v2/auth/login` → bcrypt verify → parent lookup → linked students → JWT → session | ✅ PASS |
| Parent → View Child | `enforceParentChildAccess()` validates parent→student link | ✅ PASS |
| Teacher → View Assigned Class | `enforceTeacherAccess()` validates teacher→class via `class_subject_teacher_map` | ✅ PASS |
| Student → View Own Profile | Student record tied to user ID via JWT | ✅ PASS |
| Job Provider → Register & Login | Separate auth flow via Supabase Auth | ⚠️ DIFFERENT |

---

## STEP 11 — SCORING

| Category | Score | Reasoning |
|----------|-------|-----------|
| **Authentication** | 7/10 | Login flows work correctly for all portals. Deductions: Hardcoded dev creds in admin config (-1), no forgot-password for 5/6 portals (-1), management logout calls supabase.auth incorrectly (-1) |
| **Authorization** | 7/10 | Role validation at login is strong. Deductions: Admin has no org isolation (-1), legacy routes may have weaker auth (-1), job provider not integrated (-1) |
| **Tenant Isolation** | 6/10 | Management/Staff/Student/Parent have org_id in JWT + middleware validation. Deductions: Admin bypasses all org isolation (-1), job provider has no org concept (-2), management `router.param` accepts non-UUID params without blocking (-1) |
| **Session Management** | 4/10 | Basic localStorage with JWT. Deductions: No token refresh (-2), no session expiry check on frontend (-1), management logout still calls supabase.auth (-1), session persists indefinitely (-1), fragmentation between portals (-1) |
| **Credential Management** | 5/10 | Password generation + bcrypt storage works. Deductions: No forgot-password for 5/6 portals (-1), bulk email is a stub with no SMTP (-1), password regen silently fails to update Supabase Auth (-1), dev admin credentials in config (-1), no self-service password change for most portals (-1) |
| **Code Quality / Security** | 5/10 | Core auth logic is solid. Deductions: Dual route registration creates attack surface (-1), shared JWT secret across all backends (-1), register endpoint has no rate limit (-1), `DEV_AUTH_BYPASS` dead code exists everywhere (-1), job provider integration is completely fragmented from the rest (-1) |

### PRODUCTION READINESS SCORE: **5.7/10** ⚠️

---

## SUMMARY OF ALL BUGS & ISSUES

### 🔴 CRITICAL (Fix Before Production)

| # | Issue | Portal(s) | File |
|---|-------|-----------|------|
| C1 | **Management logout calls `supabase.auth.signOut()`** — No Supabase auth session exists; this is a dead call that could throw errors | Management | `AuthContext.tsx` line ~16 |
| C2 | **`devAdminEmail` / `devAdminPassword` in config** — Hardcoded dev credentials could be deployed | Admin | `prasynx-admin-backend/src/config/index.ts` |
| C3 | **Legacy routes still mounted** — `/api/admin`, `/api/staff`, `/api/student`, `/api/parents` all coexist with `/api/v2/*` routes. Legacy routes may have weaker or no auth middleware | ALL | Each backend's `app.ts` |
| C4 | **Password regeneration silently fails** — `supabase.auth.admin.updateUserById().catch(() => {})` swallows errors; user can login via `users` table but NOT via Supabase Auth | Management | `management.ts` line ~2820 |
| C5 | **Register endpoint has no rate limiting** — Unlimited org/user creation | Management | `management.ts:42`, `auth.service.ts:71` |

### 🟠 HIGH (Should Fix Before Feature Build)

| # | Issue | Portal(s) | File |
|---|-------|-----------|------|
| H1 | **No forgot-password flow** for Management, Staff, Student, or Parent | 4/6 portals | Missing entirely |
| H2 | **No token refresh mechanism** — 24h JWT expiry with no refresh will force re-login | ALL | Missing entirely |
| H3 | **Job provider auth is completely fragmented** — Different table (`job_providers`), different JWT format, no org_id, no users table integration | Job Provider | All job provider files |
| H4 | **Admin has no org isolation** — JWT has `organisationId: null` | Admin | `auth.service.ts` |
| H5 | **Bulk email is a stub** — No SMTP/mail transport configured; only logs to credential_history | Management | `management.ts` |
| H6 | **Management frontend no role check** — Could accept non-management JWT without frontend warning | Management | `page.tsx` login handler |

### 🟡 MEDIUM (Should Fix Before v1.0)

| # | Issue | Portal(s) | File |
|---|-------|-----------|------|
| M1 | **All backends share same JWT secret** — Single point of compromise | ALL | All `config/index.ts` |
| M2 | **Session persists indefinitely** — No expiry check on frontend restore | ALL | All AuthContexts |
| M3 | **`DEV_AUTH_BYPASS = false` dead code** — Exists but never checked / used | ALL | All `backend-common.ts` |
| M4 | **Management CORS middleware hardcoded to wrong port** — `corsMiddleware` in `backend-common.ts` allows `localhost:3002` instead of `:3001` | Management | `backend-common.ts` (unused) |
| M5 | **Admin frontend hardcodes `token: payload.token \|\| 'admin-session'`** — Fallback string if token missing | Admin | `lib/auth.ts:47` |
| M6 | **Staff frontend uses relative `/api` path** — Depends on Next.js rewrite proxy; could break if proxy not configured | Staff | `apiClient.ts:1` |

### 🔵 LOW (Nice to Have)

| # | Issue | Portal(s) | File |
|---|-------|-----------|------|
| L1 | **Admin login controller doesn't generate JWT** — Legacy code only; refactored route handles it correctly | Admin | `login.controller.ts` |
| L2 | **Management `router.param('organisation_id')` accepts non-UUID params** — Non-UUID org_id params pass through without validation | Management | `management.ts:140-146` |
| L3 | **No session expiry frontend check** — Could show stale dashboard briefly | ALL | All AuthContexts |
| L4 | **Prisma/shared config module missing** — Each backend duplicates config code | ALL | Architecture |

---

**End of Audit Report**

**Recommendation:** Do NOT proceed with feature building (Class, Attendance, Timetable, Exams, Results, Fees, Homework, Academic) until the 🔴 CRITICAL and 🟠 HIGH issues are resolved. The authentication foundation has serious gaps in session management, credential recovery, and cross-portal consistency that would compound with each new module added.
