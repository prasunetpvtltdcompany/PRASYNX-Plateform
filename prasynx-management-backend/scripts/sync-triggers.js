const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Creating synchronization and workload triggers...');

  const query = `
    -- Function to sync insert/update from staff_records to staff_profiles
    CREATE OR REPLACE FUNCTION public.sync_teacher_to_staff_profile()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.staff_profiles (
        id, organisation_id, user_id, employee_id, full_name, department, designation, 
        employment_type, joining_date, status, qualification, salary, address
      ) VALUES (
        NEW.id,
        NEW.organisation_id,
        NEW.user_id,
        COALESCE(NEW.staff_unique_id, 'EMP-' || SUBSTRING(NEW.id::text, 1, 8)),
        NEW.full_name,
        COALESCE(NEW.department, 'Academics'),
        COALESCE(NEW.designation, 'Teacher'),
        CASE 
          WHEN NEW.employment_type = 'full_time' THEN 'FULL_TIME'
          WHEN NEW.employment_type = 'part_time' THEN 'PART_TIME'
          ELSE 'FULL_TIME'
        END,
        COALESCE(NEW.join_date, NEW.created_at::date, CURRENT_DATE),
        CASE 
          WHEN NEW.status = 'active' THEN 'ACTIVE'
          WHEN NEW.status = 'inactive' THEN 'DEACTIVATED'
          ELSE 'ACTIVE'
        END,
        NEW.qualification,
        NEW.salary,
        jsonb_build_object('street', NEW.address, 'city', NEW.city, 'state', NEW.state, 'zip', NEW.postal_code)
      )
      ON CONFLICT (id) DO UPDATE SET
        organisation_id = EXCLUDED.organisation_id,
        user_id = EXCLUDED.user_id,
        employee_id = EXCLUDED.employee_id,
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        designation = EXCLUDED.designation,
        employment_type = EXCLUDED.employment_type,
        joining_date = EXCLUDED.joining_date,
        status = EXCLUDED.status,
        qualification = EXCLUDED.qualification,
        salary = EXCLUDED.salary,
        address = EXCLUDED.address,
        updated_at = NOW();
        
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger for insert/update
    DROP TRIGGER IF EXISTS trg_sync_teacher_to_staff_profile ON public.staff_records;
    CREATE TRIGGER trg_sync_teacher_to_staff_profile
    AFTER INSERT OR UPDATE ON public.staff_records
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_teacher_to_staff_profile();

    -- Function to sync delete from staff_records to staff_profiles
    CREATE OR REPLACE FUNCTION public.delete_staff_profile_on_teacher_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      DELETE FROM public.staff_profiles WHERE id = OLD.id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger for delete
    DROP TRIGGER IF EXISTS trg_delete_staff_profile_on_teacher_delete ON public.staff_records;
    CREATE TRIGGER trg_delete_staff_profile_on_teacher_delete
    AFTER DELETE ON public.staff_records
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_staff_profile_on_teacher_delete();

    -- Workload recalculation function
    CREATE OR REPLACE FUNCTION public.recalculate_staff_workload()
    RETURNS TRIGGER AS $$
    DECLARE
      target_staff_id UUID;
      classes_cnt INT := 0;
      tasks_cnt INT := 0;
      total_score INT := 0;
      org_id UUID;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        target_staff_id := OLD.staff_id;
      ELSE
        target_staff_id := NEW.staff_id;
      END IF;

      IF target_staff_id IS NULL THEN
        RETURN NULL;
      END IF;

      -- Count active assignments
      SELECT COUNT(*) INTO classes_cnt FROM public.staff_assignments WHERE staff_id = target_staff_id AND status = 'ACTIVE';
      
      -- Count pending/in progress tasks
      SELECT COUNT(*) INTO tasks_cnt FROM public.staff_tasks WHERE staff_id = target_staff_id AND status IN ('PENDING', 'IN_PROGRESS', 'REVIEW');

      total_score := (classes_cnt * 25) + (tasks_cnt * 10);
      IF total_score > 200 THEN
        total_score := 200;
      END IF;

      SELECT organisation_id INTO org_id FROM public.staff_profiles WHERE id = target_staff_id;

      IF org_id IS NOT NULL THEN
        INSERT INTO public.staff_workloads (organisation_id, staff_id, workload_percentage, active_classes_count, active_tasks_count)
        VALUES (
          org_id,
          target_staff_id,
          total_score,
          classes_cnt,
          tasks_cnt
        )
        ON CONFLICT (staff_id) DO UPDATE SET
          workload_percentage = EXCLUDED.workload_percentage,
          active_classes_count = EXCLUDED.active_classes_count,
          active_tasks_count = EXCLUDED.active_tasks_count,
          updated_at = NOW();
      END IF;

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Triggers for workload update
    DROP TRIGGER IF EXISTS trg_recalculate_workload_on_assignment ON public.staff_assignments;
    CREATE TRIGGER trg_recalculate_workload_on_assignment
    AFTER INSERT OR UPDATE OR DELETE ON public.staff_assignments
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_staff_workload();

    DROP TRIGGER IF EXISTS trg_recalculate_workload_on_task ON public.staff_tasks;
    CREATE TRIGGER trg_recalculate_workload_on_task
    AFTER INSERT OR UPDATE OR DELETE ON public.staff_tasks
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_staff_workload();
  `;

  try {
    await client.query(query);
    console.log('Synchronization and workload triggers created successfully.');
  } catch (error) {
    console.error('Trigger creation failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
