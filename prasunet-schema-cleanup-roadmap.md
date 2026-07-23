# Schema Cleanup Roadmap

> **DO NOT EXECUTE** - This is a planning document only.

## Issue 1: Duplicate `organisations` / `organizations` Tables

**Problem:** Two spelling variants exist:
- `organisations` (UK, used by main schema + all enhanced modules)
- `organizations` (US, used by `supabase-migration-multitenant.sql`)

**Resolution:** Migrate all `organizations` (US) references to `organisations` (UK).
- Rename `public.organizations` → `public.organisations` (if both exist, merge data)
- Update all FK references in `supabase-migration-multitenant.sql`
- Update the `handle_new_user()` trigger function

---

## Issue 2: Three `audit_logs` Tables

**Problem:** Three definitions with different columns:
1. `prasunet-schema.sql` (line 561): `organisation_id, user_id, action, entity_type, entity_id, details, ip_address, severity`
2. `supabase-migration-multitenant.sql` (line 131): `user_id, organization_id, action, resource, resource_id, details, ip_address`
3. `prasunet-fixes-migration.sql` (line 99): `organisation_id, user_id, action, resource, method, ip, user_agent, status_code`

**Resolution:** 
- Keep the third definition (most complete with method, user_agent, status_code)
- Drop the other two tables or migrate data into the canonical version
- Add indexes on `(organisation_id, created_at)` and `(user_id, action)`

---

## Issue 3: No `parents` Table in Main Schema

**Problem:** `prasunet-schema.sql` has no `CREATE TABLE parents`.
The `parents` table only exists via `supabase-migration-multitenant.sql`.
The main schema uses `parent_student_links.parent_id` → `users.id` directly (no separate parents table).

**Resolution:**
- Add `CREATE TABLE IF NOT EXISTS parents (...)` to the canonical schema
- Include: `id, user_id, organisation_id, full_name, email, phone, student_id, status, created_at, updated_at`
- Backfill `parent_student_links.parents_id` FK (already started in fixes migration)
- Update credential creation to always write `parents.user_id` (already done)

---

## Issue 4: `staff` vs `teachers` Overlap

**Problem:**
- `teachers` table: main schema, has `teacher_code, subject, assigned_class`
- `staff` table: multitenant schema, has `employee_id, department, designation`
- `payroll_records.staff_id` references `teachers(id)` - naming inconsistency
- `users` with `role='staff'` and `role='teacher'` are separate concepts

**Resolution:**
- Consolidate into a single `staff` table that includes teacher-specific fields
- Migration path: ALTER TABLE teachers ADD COLUMN employee_id, department, designation
- Update `payroll_records.staff_id` reference to use the consolidated table
- Remove the redundant `staff` table from multitenant schema

---

## Issue 5: `attendance` vs `attendance_records`

**Problem:**
- All operational routes read/write `attendance` table
- Only analytics routes use `attendance_records`
- `prasunet-schema-fix.sql` alters `attendance` (adds org_id) but no CREATE TABLE exists
- RLS is only on `attendance_records`, not `attendance`

**Resolution:**
- Add `CREATE TABLE IF NOT EXISTS attendance (...)` to canonical schema
- Define same columns as `attendance_records` plus any extra fields
- Add RLS policies to `attendance` (see RLS migration)
- Consider consolidating into a single table after data migration

---

## Issue 6: Two `profiles` Definitions

**Problem:**
- `supabase-schema.sql` (line 14): role CHECK = `('student','parent','teacher','institution','recruiter','organization','admin')`, no `organization_id`
- `supabase-migration-multitenant.sql` (line 29): role CHECK = `('admin','management','student','staff','parent','job_provider')`, has `organization_id`

**Resolution:**
- Update the canonical schema to include `organisation_id` column
- Update role CHECK to include all roles: `('admin','management','student','staff','teacher','parent','job_provider')`
- Drop the old constraint and add the new one

---

## Issue 7: `parent_student_links` Missing `organisation_id`

**Problem:** The table lacks an `organisation_id` column, making tenant-level filtering by org_id impossible for parent-child relationships.

**Resolution:**
```sql
ALTER TABLE parent_student_links ADD COLUMN organisation_id UUID REFERENCES organisations(id);
UPDATE parent_student_links psl SET organisation_id = s.organisation_id 
  FROM students s WHERE s.id = psl.student_id;
ALTER TABLE parent_student_links ALTER COLUMN organisation_id SET NOT NULL;
```

---

## Issue 8: Tables Missing `organisation_id`

Tables that need the column added:
- `direct_messages`
- `assignment_submissions` (may already have it from enhanced module)
- `fee_items`
- `canteen_balances`
- `canteen_orders`
- `class_subject_teacher_map`
- `part_time_job_applications`

---

## Migration Order

1. Add missing `organisation_id` columns (Issue 8)
2. Consolidate `attendance`/`attendance_records` (Issue 5)
3. Add canonical `parents` table DDL (Issue 3)
4. Add `organisation_id` to `parent_student_links` (Issue 7)
5. Standardize role CHECK on `profiles` (Issue 6)
6. Consolidate `staff`/`teachers` (Issue 4)
7. Merge `audit_logs` tables (Issue 2)
8. Merge `organisations`/`organizations` (Issue 1)
