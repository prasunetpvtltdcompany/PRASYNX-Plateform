# PRASYNX API v1 — Reference

Base URL: `http://localhost:4000/api/v1` (configurable via `PORT`).

All requests/responses are JSON. Errors use:

```json
{ "success": false, "error": "message", "code": "CODE", "requestId": "uuid" }
```

`400/401/403/404/409/429/500` map to `BAD_REQUEST / UNAUTHORIZED / FORBIDDEN / NOT_FOUND / CONFLICT / TOO_MANY_REQUESTS / generic`.

## Health

### `GET /api/health`
Public. Returns `200 { status: "ok", service: "prasynx-server", time }`.

## Auth (`/auth`)

Public endpoints carry login rate limiting (per-IP + per-account + account lockout).

### `POST /auth/login`
Body: `{ "email", "password", "userAgent?" }`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "opaque",
  "expiresIn": 900,
  "user": { "id", "full_name", "email", "role", "organisation_id", "status" }
}
```
Policies: wrong credentials → `401`; >5 failures → account locked → `429` (15 min).

### `POST /auth/refresh`
Body: `{ "refreshToken" }`
Rotates the token. Returned shape identical to login.

### `POST /auth/logout` (authenticated)
Body: `{ "refreshToken"? , "all"? }`. `all: "true"` revokes every session for the user; otherwise only the presenting one. → `204`.

### `POST /auth/forgot-password`
Body: `{ "email" }` → `200` (always succeeds; no account enumeration).

### `POST /auth/reset-password`
Body: `{ "token", "newPassword" }` (min 8 chars) → `200`.

### `POST /auth/change-password` (authenticated)
Body: `{ "currentPassword", "newPassword" }` → `204`. Also revokes live sessions.

## Users (`/users`)

Protected by `authenticate`; school routes also by `requireTenant`.

### `GET /users/me` (OWN_PROFILE)
`200 { "user": { ...safe DTO } }`

### `GET /users` (school management/teacher/student-managers)
Lists users in the caller's organisation.

### `POST /users` (SCHOOL_MANAGE)
Body: `{ "full_name", "email", "role" }` — role is one of `management | teacher | staff | student | accountant | librarian | transport_manager | hostel_warden`.
Creates the user (bcrypted hash in `users`) + mirrors into Supabase Auth, rolls back on failure.
```json
{ "user": { "id","full_name","email","role","status" }, "temporary_password": "..." }
```
`temporary_password` is revealed exactly once — relay it via a secure channel.

## Organisations (PRASYNX / company) (`/organisations`)

Every route requires platform-level permission (`PLATFORM_MANAGE_ORGANISATIONS`) — the *company* registers schools.

### `POST /organisations/register`
Body: `{ "name", "email", "address"?, "phone"?, "adminFullName"? }`
Creates the school tenant (`organisations`) + its initial `management` account.
```json
{
  "organisation": { "id", "name", "status": "verified", "email", ... },
  "management":   { "email", "full_name", "role": "management", "temporary_password": "..." },
  "user_id": "uuid"
}
```

### `PATCH /organisations/:id/status`
Body: `{ "status": "verified|pending|suspended|rejected" }` → `200`.

### `GET /organisations`
All schools, newest first. → `200 { "organisations": [...] }`.

## Classes (`/classes`) — tenant-scoped

### `GET /classes`
`200 { "classes": [{ ...Class, "sections": [...] }] }`

### `GET /classes/:id`
Single class with sections; `404` if not in the caller's school.

## Attendance (`/attendance`) — tenant-scoped

### `POST /attendance/mark` (SCHOOL_ATTENDANCE_MANAGE)
Body: `{ "student_id", "date": "YYYY-MM-DD", "status": "present|absent|late|excused", "notes"? }`
Upserts one student's record for the day. → `201 { "attendance": { ...DTO } }`. Triggers async parent notification.

### `POST /attendance/bulk` (SCHOOL_ATTENDANCE_MANAGE)
Body: `{ "class_id", "date", "records": [{ "student_id", "status", "notes"? }] }` (1–500)
Every student must belong to `class_id` in the caller's school; duplicates rejected; existing rows updated, new rows inserted in **one** insert. → `201 { "attendance": [DTO] }`.

### `GET /attendance?student_id=<uuid>&date_from=?&date_to=?` (SCHOOL_ATTENDANCE_VIEW)
Students see only their own, parents only their children, staff/management per permission matrix.
→ `200 { "report": { "summary": { "total","present","absent","late","excused","percentage" }, "records": [DTO] } }`

## Exams (`/exams`) — tenant-scoped

### `POST /exams` (SCHOOL_EXAMS_MANAGE)
Body: `{ "name", "exam_type": "midterm|final|quiz|unit_test|practical", "start_date"?, "end_date"?, "max_marks"=100 }`
`end_date < start_date` is rejected. → `201 { "exam": DTO }`.

### `GET /exams?status=&page=&pageSize=` (SCHOOL_EXAMS_VIEW)
→ `200 { "exams": { "data", "total", "page", "pageSize", "totalPages" } }`.

### `GET /exams/:examId` (SCHOOL_EXAMS_VIEW)
→ `200 { "exam": { ...exam, "schedules": [...], "results": [...] } }` (schedules/results carry subject & class names).

### `PATCH /exams/:examId` (SCHOOL_EXAMS_MANAGE)
Any of: `name`, `exam_type`, `start_date`, `end_date`, `max_marks`, `status: "upcoming|ongoing|completed"`.

### `POST /exams/:examId/schedule` (SCHOOL_EXAMS_MANAGE)
Body: `{ "entries": [{ "class_id", "subject_id", "date", "start_time"?, "end_time"?, "room"? }] }` (1–200)
Every class/subject must belong to the caller's school. → `201 { "schedules": [DTO] }`.

### `POST /exams/:examId/schedule/delete` (SCHOOL_EXAMS_MANAGE)
Body: `{ "schedule_ids": [...] }` → `200 { "ok": true }`.

### `POST /exams/:examId/results` (SCHOOL_EXAMS_MANAGE)
Body: `{ "results": [{ "student_id", "subject_id", "marks_obtained", "max_marks"?, "grade"?, "remarks"? }] }` (1–500)
Upserts on `(exam_id, student_id, subject_id)`; `grade` auto-computed from percentage when omitted (`A≥90, B≥75, C≥60, D≥40, F`). → `200 { "results": [DTO] }`.

### `GET /exams/results/all?exam_id=&class_id=&student_id=` (SCHOOL_EXAMS_VIEW)
`exam_id` → all results for the exam; `student_id` → a student's results (self/children scope enforced).

## Timetable (`/timetable`) — tenant-scoped

### `GET /timetable?class_id=<uuid>&day_of_week=?` (SCHOOL_TIMETABLE_VIEW)
With `class_id`: → `200 { "timetable": { "class_id", "class_name", "entries": [...] } }`.
Without: → all entries for the school.

### `POST /timetable` (SCHOOL_TIMETABLE_MANAGE)
Body: `{ "class_id", "entries": [{ "subject_id", "day_of_week": 0-6, "start_time": "HH:mm", "end_time": "HH:mm", "room"? }] }`
**Replaces** the class's full weekly grid in one transaction (delete + insert). Duplicate `day_of_week+start_time` slots and `start_time >= end_time` are rejected. → `200 { "entries": [DTO] }`.

### `DELETE /timetable` (SCHOOL_TIMETABLE_MANAGE)
Body: `{ "entry_ids": [...] }` → `200 { "ok": true }`.

## Assignments (`/assignments`) — tenant-scoped

### `POST /assignments` (SCHOOL_ASSIGNMENTS_MANAGE)
Body: `{ "title", "class_id", "due_date", "description"?, "subject_id"?, "max_score"=100, "file_url"? }`
Teachers are bound to their own `teachers` row automatically. → `201 { "assignment": DTO }`.

### `GET /assignments?class_id=&subject_id=&status=&page=&pageSize=` (SCHOOL_ASSIGNMENTS_VIEW)
Teachers only see assignments for classes they teach. → `200 { "assignments": { paginated } }`.

### `GET /assignments/student?student_id=<uuid>` (SCHOOL_ASSIGNMENTS_VIEW)
Student's assignments with their submission (self/children scope). → `200 { "assignments": [...] }`.

### `GET /assignments/:assignmentId` (SCHOOL_ASSIGNMENTS_VIEW)
→ `200 { "assignment": { ...DTO, "submissions": [...] } }`.

### `POST /assignments/:assignmentId/submit` (SCHOOL_ASSIGNMENTS_VIEW)
Body: `{ "student_id"?, "submission_text"?, "file_url"? }`
Students submit for themselves (`student_id` omitted); staff/management may pass it. Rejected when assignment is `closed`. Upserts per student. → `201 { "submission": DTO }`.

### `POST /assignments/:assignmentId/grade` (SCHOOL_ASSIGNMENTS_MANAGE)
Body: `{ "student_id", "grade", "feedback"? }` — `grade` must not exceed the assignment's `max_score`. → `200 { "ok": true }`.

## Finance (`/finance`) — tenant-scoped

### `GET /finance/structures?status=&page=&pageSize=` (SCHOOL_FINANCE_VIEW)
→ `200 { "structures": { paginated, items nested } }`.

### `POST /finance/structures` (SCHOOL_FINANCE_MANAGE)
Body: `{ "name", "class_id"?, "academic_year"?, "items": [{ "item_name", "amount" }] }` (1–100)
`total_amount` is computed server-side from items; non-positive amounts rejected. → `201 { "structure": DTO }`.

### `POST /finance/assign` (SCHOOL_FINANCE_MANAGE)
Body: `{ "fee_structure_id", "student_ids": [...], "due_date"? }` (1–500)
Charges each student the structure's total. → `201 { "assigned": n }`.

### `POST /finance/payments` (SCHOOL_FINANCE_MANAGE)
Body: `{ "student_fee_id", "amount_paid", "payment_method": "cash|card|bank_transfer|online|cheque", "transaction_id"?, "receipt_url"? }`
Overpayment rejected; fee status transitions `pending → partial → paid`. → `201 { "payment", "fee", "status" }`.

### `GET /finance/students?student_id=<uuid>` (SCHOOL_FINANCE_VIEW)
Self/children scope enforced. → `200 { "statement": { "fees", "totalCharged", "totalPaid", "outstanding" } }`.

### `GET /finance/fee/:studentFeeId` (SCHOOL_FINANCE_VIEW)
→ `200 { "fee": DTO, "payments": [DTO] }`.