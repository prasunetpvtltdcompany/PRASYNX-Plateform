/** Discipline module DTOs (schema: public.behavioral_incidents). */

export interface DisciplineIncidentDTO {
  id: string;
  organisation_id: string;
  student_id: string;
  incident_type: string | null;
  title: string;
  description: string | null;
  severity: string | null;
  location: string | null;
  reported_by: string | null;
  reported_at: string | null;
  action_taken: string | null;
  action_detail: string | null;
  action_date: string | null;
  status: string | null;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  evidence_url: string | null;
  created_at?: string;
}

export interface CreateDisciplineIncidentInput {
  student_id: string;
  incident_type?: string;
  title: string;
  description?: string;
  severity?: string;
  location?: string;
  action_taken?: string;
  status?: string;
  evidence_url?: string;
}

export interface UpdateDisciplineIncidentInput {
  status?: string;
  action_taken?: string;
  action_detail?: string;
  resolution_notes?: string;
}