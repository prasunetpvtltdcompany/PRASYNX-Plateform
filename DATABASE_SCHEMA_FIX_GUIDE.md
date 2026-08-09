# Database & Frontend Schema Alignment - Implementation Guide

**Date:** 2026-07-26  
**Purpose:** Fix the students table schema to use proper UUID foreign keys for class and section selection

---

## Overview

The database and frontend were out of sync:
- **Frontend** was using: `student_class` (text/UUID mix), `section` (text)
- **Database** expects: `class_id` (UUID FK to classes), `section_id` (UUID FK to sections)

This guide fixes both the database schema and frontend to ensure proper data integrity.

---

## Changes Made

### 1. Database Migration (New File)
**File:** `supabase/migrations/20260726_fix_students_schema.sql`

**What it does:**
- ✅ Drops legacy TEXT columns (`student_class`, `section` if they exist as TEXT)
- ✅ Ensures `class_id` (UUID FK) exists on students table
- ✅ Ensures `section_id` (UUID FK) exists on students table
- ✅ Populates missing `class_id` from `class_student_map`
- ✅ Populates missing `section_id` from sections table
- ✅ Creates default sections (A-E) for classes that have students but no sections
- ✅ Adds performance indexes
- ✅ Provides data quality report

**To run:**
```sql
-- In Supabase SQL Editor, copy and run the entire migration file:
-- supabase/migrations/20260726_fix_students_schema.sql
```

### 2. Frontend Updates
**File:** `prasynx-management-frontend/app/page.tsx`

#### StudentForm (Add Student)
**Line ~9250:**
```typescript
// BEFORE
const f = useForm({ full_name: '', roll_number: '', student_class: '', section: '', ... })
<select value={f.values.student_class} onChange={e => f.handleChange('student_class', ...)}
<select value={f.values.section} onChange={e => f.handleChange('section', ...)}

// AFTER
const f = useForm({ full_name: '', roll_number: '', class_id: '', section_id: '', ... })
<select value={f.values.class_id} onChange={e => f.handleChange('class_id', ...)}
<select value={f.values.section_id} onChange={e => f.handleChange('section_id', ...)}
```

#### EditStudentForm (Edit Student)
**Line ~7960:**
```typescript
// BEFORE
const f = useForm({
  ...
  student_class: student.student_class || '',
  section: student.section || student.section_id || '',
  ...
})

// AFTER
const f = useForm({
  ...
  class_id: student.class_id || '',
  section_id: student.section_id || '',
  ...
})
```

**Line ~8000+:**
```typescript
// BEFORE
<select value={f.values.student_class} onChange={e => f.handleChange('student_class', ...)}
<select value={f.values.section} onChange={e => f.handleChange('section', ...)}

// AFTER
<select value={f.values.class_id} onChange={e => f.handleChange('class_id', ...)}
<select value={f.values.section_id} onChange={e => f.handleChange('section_id', ...)}
```

---

## Implementation Steps

### Step 1: Run Database Migration
1. Go to your Supabase project → SQL Editor
2. Open and copy the migration file: `supabase/migrations/20260726_fix_students_schema.sql`
3. Paste into the SQL Editor and run
4. Check the NOTICE messages for data quality report
5. Verify data was populated correctly

### Step 2: Verify Database Changes
```sql
-- Check students table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Should show:
-- class_id | uuid | YES
-- section_id | uuid | YES

-- Check data population
SELECT 
  COUNT(*) total_students,
  COUNT(class_id) with_class,
  COUNT(section_id) with_section
FROM students;
```

### Step 3: Update Frontend
1. The changes to `prasynx-management-frontend/app/page.tsx` are already applied
2. Verify the file contains the updated StudentForm and EditStudentForm components
3. Rebuild/restart the frontend:
   ```bash
   cd prasynx-management-frontend
   npm run build
   npm run dev
   ```

### Step 4: Test End-to-End
1. Open management portal → Student Directory
2. Try adding a new student:
   - Select a class from the dropdown
   - Select a section
   - Submit the form
3. Try editing an existing student:
   - Verify class and section load correctly
   - Update and save
4. Check Supabase to verify `class_id` and `section_id` are properly saved

---

## Database Schema (Final State)

### students table columns
```sql
id                 UUID PRIMARY KEY
organisation_id    UUID FK → organisations(id)
user_id            UUID FK → profiles(id)
full_name          TEXT
roll_number        TEXT
class_id           UUID FK → classes(id)  ← Main class reference
section_id         UUID FK → sections(id) ← Main section reference
date_of_birth      DATE
gender             TEXT
address            TEXT
phone              TEXT
email              TEXT
parent_name        TEXT
parent_email       TEXT
parent_phone       TEXT
blood_group        TEXT
status             TEXT
created_at         TIMESTAMPTZ
```

### classes table columns
```sql
id                 UUID PRIMARY KEY
organisation_id    UUID FK → organisations(id)
name               TEXT (e.g., "Class 10", "Grade 9")
section            TEXT (legacy - being phased out)
grade_level        TEXT
capacity           INT
status             TEXT
created_at         TIMESTAMPTZ
academic_year_id   UUID FK → academic_years(id)
```

### sections table columns
```sql
id                 UUID PRIMARY KEY
organisation_id    UUID FK → organisations(id)
class_id           UUID FK → classes(id)
name               TEXT (e.g., "A", "B", "C")
capacity           INT
room_number        TEXT
created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ
```

---

## Troubleshooting

### Issue: "Column class_id not found"
**Cause:** Frontend trying to save to wrong column name  
**Fix:** Ensure frontend is using `class_id` not `student_class` or `class`  
**Check:** Look at EditStudentForm and StudentForm components

### Issue: "Column section_id not found"
**Cause:** Frontend trying to save section name instead of UUID  
**Fix:** Ensure migration was run to create sections table and populate section_id  
**Check:** Run the migration SQL and verify sections table exists

### Issue: Students showing NULL for class/section
**Cause:** Migration not run or data mapping incomplete  
**Fix:** Run the migration and check the data quality report  
**Verify:**
```sql
SELECT COUNT(*) FROM students WHERE class_id IS NULL;
SELECT COUNT(*) FROM students WHERE section_id IS NULL;
```

### Issue: Section dropdown shows no options
**Cause:** No sections created for the selected class  
**Fix:** The migration creates default sections (A-E) for all classes with students. If needed, manually create via Supabase.

---

## Data Migration Summary

The migration script does the following safe operations:

1. **Copies existing data** from legacy columns to new UUID FKs
2. **Matches class names** to class UUIDs
3. **Creates default sections** (A-E) for classes that don't have them
4. **Links students to sections** based on their enrollment
5. **Adds performance indexes** for common queries
6. **Reports data quality** before and after

**Zero data loss** - all operations are non-destructive until the final DROP.

---

## Next Steps

1. ✅ Run migration: `20260726_fix_students_schema.sql`
2. ✅ Frontend changes already applied to `page.tsx`
3. ⏭️ Test the add/edit student flow
4. ⏭️ Verify data in Supabase
5. ⏭️ Deploy to production if working as expected

---

## Related Files

- Frontend form: `prasynx-management-frontend/app/page.tsx` (StudentForm, EditStudentForm)
- Backend API: `prasynx-management-backend/src/routes/` (verify endpoints use class_id/section_id)
- Database: `supabase/migrations/20260726_fix_students_schema.sql`

---

**Questions?** Check the console logs in browser DevTools when adding/editing students to see the API requests and responses.
