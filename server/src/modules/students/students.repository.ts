import type { CreateStudentInput, StudentDTO, UpdateStudentInput } from '@prasynx/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

export interface StudentRow {
  id: string;
  user_id: string | null;
  organisation_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  roll_number: string | null;
  class_id: string | null;
  section_id: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_relationship: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  blood_group: string | null;
  student_class: string | null;
  section: string | null;
  status: string;
  created_at?: string;
}

/** Column set verified against the live Supabase schema. */
const STUDENT_COLUMNS =
  'id,user_id,organisation_id,full_name,email,phone,roll_number,class_id,section_id,' +
  'parent_name,parent_email,parent_phone,parent_relationship,date_of_birth,gender,address,blood_group,' +
  'student_class,section,status,created_at';

export class StudentsRepository {
  async list(tenantId: string): Promise<StudentDTO[]> {
    const client = db;
    const { data: rows, error } = await client
      .from('students')
      .select(STUDENT_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('full_name');
    if (error) throw error;
    return this.enrich(client, (rows as unknown as StudentRow[]) ?? []);
  }

  async findById(tenantId: string, id: string): Promise<StudentDTO | null> {
    const client = db;
    const { data, error } = await client
      .from('students')
      .select(STUDENT_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [enriched] = await this.enrich(client, [data as unknown as StudentRow]);
    return enriched;
  }

  async create(tenantId: string, input: CreateStudentInput, userId: string | null): Promise<string> {
    const client = db;
    const row = {
      organisation_id: tenantId,
      full_name: input.full_name,
      roll_number: input.roll_number ?? null,
      class_id: input.class_id ?? null,
      section_id: input.section_id ?? null,
      student_class: input.class_name ?? null,
      section: input.section_name ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      user_id: userId,
      parent_name: input.parent_name ?? null,
      parent_email: input.parent_email ?? null,
      parent_phone: input.parent_phone ?? null,
      parent_relationship: input.parent_relationship ?? 'parent',
      date_of_birth: input.date_of_birth ?? null,
      gender: input.gender ?? null,
      address: input.address ?? null,
      blood_group: input.blood_group ?? null,
      status: 'active',
    };
    const { data, error } = await client.from('students').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Student could not be created');
    return data.id as string;
  }

  async update(tenantId: string, id: string, patch: UpdateStudentInput): Promise<void> {
    const client = db;
    const update: Record<string, unknown> = {};
    if (patch.full_name !== undefined) update.full_name = patch.full_name;
    if (patch.roll_number !== undefined) update.roll_number = patch.roll_number;
    if (patch.class_id !== undefined) update.class_id = patch.class_id;
    if (patch.class_name !== undefined) update.student_class = patch.class_name;
    if (patch.section_id !== undefined) update.section_id = patch.section_id;
    if (patch.section_name !== undefined) update.section = patch.section_name;
    if (patch.email !== undefined) update.email = patch.email;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (patch.parent_name !== undefined) update.parent_name = patch.parent_name;
    if (patch.parent_email !== undefined) update.parent_email = patch.parent_email;
    if (patch.parent_phone !== undefined) update.parent_phone = patch.parent_phone;
    if (patch.parent_relationship !== undefined) update.parent_relationship = patch.parent_relationship;
    if (patch.date_of_birth !== undefined) update.date_of_birth = patch.date_of_birth;
    if (patch.gender !== undefined) update.gender = patch.gender;
    if (patch.address !== undefined) update.address = patch.address;
    if (patch.blood_group !== undefined) update.blood_group = patch.blood_group;
    update.updated_at = new Date().toISOString();

    const { error } = await client.from('students').update(update).eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const client = db;
    await client.from('class_student_map').delete().eq('student_id', id).eq('organisation_id', tenantId);
    const { error } = await client.from('students').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  /** Keep class_student_map in sync with the student's current class. */
  async syncClassMap(tenantId: string, studentId: string, classId: string | null): Promise<void> {
    const client = db;
    await client.from('class_student_map').delete().eq('student_id', studentId).eq('organisation_id', tenantId);
    if (classId) {
      const { error } = await client
        .from('class_student_map')
        .insert({ organisation_id: tenantId, class_id: classId, student_id: studentId });
      if (error) throw error;
    }
  }

  async assertExists(tenantId: string, id: string): Promise<void> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Student not found in this school');
  }

  async resolveClassIdByName(tenantId: string, name: string): Promise<string | null> {
    const client = db;
    const { data } = await client.from('classes').select('id').eq('organisation_id', tenantId).eq('name', name).maybeSingle();
    return (data?.id as string | undefined) ?? null;
  }

  async resolveSectionIdByName(tenantId: string, classId: string, name: string): Promise<string | null> {
    const client = db;
    const { data } = await client.from('sections').select('id').eq('organisation_id', tenantId).eq('class_id', classId).eq('name', name).maybeSingle();
    return (data?.id as string | undefined) ?? null;
  }

  private async enrich(client: SupabaseClient, rows: StudentRow[]): Promise<StudentDTO[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.class_id).filter((v): v is string => !!v);
    const sectionIds = rows.map((r) => r.section_id).filter((v): v is string => !!v);

    const [classRes, sectionRes] = await Promise.all([
      ids.length ? client.from('classes').select('id,name').in('id', ids) : { data: null as null, error: null },
      sectionIds.length ? client.from('sections').select('id,name').in('id', sectionIds) : { data: null as null, error: null },
    ]);

    const className = new Map<string, string>(((classRes.data as { id: string; name: string }[] | null) ?? []).map((c) => [c.id, c.name]));
    const sectionName = new Map<string, string>(((sectionRes.data as { id: string; name: string }[] | null) ?? []).map((s) => [s.id, s.name]));

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      organisation_id: row.organisation_id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      roll_number: row.roll_number,
      class_id: row.class_id,
      section_id: row.section_id,
      class_name: row.class_id ? (className.get(row.class_id) ?? row.student_class) : row.student_class,
      section_name: row.section_id ? (sectionName.get(row.section_id) ?? row.section) : row.section,
      parent_name: row.parent_name,
      parent_email: row.parent_email,
      parent_phone: row.parent_phone,
      parent_relationship: row.parent_relationship,
      date_of_birth: row.date_of_birth,
      gender: row.gender,
      address: row.address,
      blood_group: row.blood_group,
      status: row.status as StudentDTO['status'],
      created_at: row.created_at,
    }));
  }
}