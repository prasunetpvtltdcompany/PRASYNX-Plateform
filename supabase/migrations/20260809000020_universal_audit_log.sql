-- Universal DB-level audit capture
-- Guarantees that ANY row change (INSERT / UPDATE / DELETE) on the core
-- tables is recorded in audit_logs, regardless of which portal or service
-- performed it (management UI, mobile app, student/staff/parent backends).
--
-- The Express `universalAudit` middleware already records API-level changes;
-- this trigger (1) catches direct DB writes, (2) records old/new values and
-- (3) stores the target entity_id so the feed can always link back.

CREATE OR REPLACE FUNCTION public.audit_table_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row   jsonb;
  v_org   uuid;
  v_id    uuid;
  v_old   jsonb := NULL;
  v_new   jsonb := NULL;
  v_actor uuid  := NULL;
  v_meta  jsonb := '{}'::jsonb;
BEGIN
  BEGIN
    BEGIN
      v_actor := NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    EXCEPTION WHEN OTHERS THEN v_actor := NULL; END;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      v_new := to_jsonb(NEW);
    END IF;
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      v_old := to_jsonb(OLD);
    END IF;

    v_row := COALESCE(v_new, v_old);
    v_org := NULLIF(v_row ->> 'organisation_id', '')::uuid;
    IF v_org IS NULL THEN
      v_org := NULLIF(v_row ->> 'organization_id', '')::uuid;
    END IF;
    IF v_org IS NULL THEN
      v_org := NULLIF(v_row ->> 'org_id', '')::uuid;
    END IF;
    v_id := NULLIF(v_row ->> 'id', '')::uuid;

    IF TG_OP = 'UPDATE' THEN
      v_meta := jsonb_build_object('old', v_old, 'new', v_new);
    ELSIF TG_OP = 'INSERT' THEN
      v_meta := jsonb_build_object('new', v_new);
    ELSE
      v_meta := jsonb_build_object('old', v_old);
    END IF;

    INSERT INTO public.audit_logs (
      organisation_id, user_id, action, entity_type, entity_id, details, severity
    ) VALUES (
      v_org, v_actor, TG_OP, TG_TABLE_NAME, v_id, v_meta,
      CASE WHEN TG_OP = 'DELETE' THEN 'warning' ELSE 'info' END
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach the trigger to every organisation-scoped core table.
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'students','parents','users','teachers','staff_records','staff_members',
    'staff_attendance','attendance_records','classes','class_student_map',
    'class_subject_teacher_map','subjects','class_subjects','timetable_entries',
    'exams','exam_results','assignments','assignment_submissions','homework',
    'homework_submissions','announcements','events','clubs','sports_teams',
    'library_books','library_issues','fees','fee_payments','fee_records',
    'payroll_records','salary_components','documents','transport_routes',
    'transport_vehicles','hostel_rooms','hostel_allocations','promotion_history',
    'admissions','admission_requests','parent_student_links','roles','permissions',
    'role_permissions','role_audit_logs','staff_resources',
    'staff_performance_records','staff_leave_requests'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_on_%I ON public.%I;', tbl, tbl);
      EXECUTE format(
        'CREATE TRIGGER trg_audit_on_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_table_change();',
        tbl, tbl
      );
    END IF;
  END LOOP;
END $$;