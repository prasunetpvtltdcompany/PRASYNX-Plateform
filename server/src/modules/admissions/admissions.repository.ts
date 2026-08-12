import type { AdmissionDTO, AdmissionStatus, CreateAdmissionInput } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

export interface AdmissionRow {
  id: string;
  organisation_id: string;
  applicant_name: string;
  applicant_email: string | null;
  phone: string | null;
  applying_class: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  status: AdmissionStatus;
  academic_year_id: string | null;
  academic_year: string | null;
  created_at?: string;
}

const ADMISSION_COLUMNS =
  'id,organisation_id,applicant_name,applicant_email,phone,applying_class,parent_name,parent_phone,' +
  'status,academic_year_id,academic_year,created_at';

export class AdmissionsRepository {
  async list(tenantId: string): Promise<AdmissionDTO[]> {
    const { data, error } = await db
      .from('admission_applications')
      .select(ADMISSION_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as AdmissionDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<AdmissionDTO | null> {
    const { data, error } = await db
      .from('admission_applications')
      .select(ADMISSION_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as AdmissionDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateAdmissionInput): Promise<string> {
    const row = {
      organisation_id: tenantId,
      applicant_name: input.applicant_name,
      applicant_email: input.applicant_email ?? null,
      phone: input.phone ?? null,
      applying_class: input.applying_class ?? null,
      parent_name: input.parent_name ?? null,
      parent_phone: input.parent_phone ?? null,
      academic_year: input.academic_year ?? null,
      status: 'pending',
    };
    const { data, error } = await db.from('admission_applications').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Admission application could not be created');
    return data.id as string;
  }

  async updateStatus(tenantId: string, id: string, status: AdmissionStatus): Promise<void> {
    const { error } = await db
      .from('admission_applications')
      .update({ status })
      .eq('id', id)
      .eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db
      .from('admission_applications')
      .delete()
      .eq('id', id)
      .eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<AdmissionDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Admission application not found in this school');
    return found;
  }
}