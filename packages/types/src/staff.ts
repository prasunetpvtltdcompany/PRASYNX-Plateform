/** Staff module DTOs (schema: public.staff_records + related). */

export interface StaffRecordDTO {
  id: string;
  organisation_id: string;
  user_id: string | null;
  staff_unique_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  assigned_class: string | null;
  qualification: string | null;
  join_date: string | null;
  department: string | null;
  designation: string | null;
  experience_years: number | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  salary: number | null;
  employment_type: string | null;
  reporting_manager: string | null;
  status: string | null;
  role: string | null;
  created_at?: string;
}

export interface CreateStaffInput {
  full_name: string;
  email?: string;
  phone?: string;
  staff_unique_id?: string;
  subject?: string;
  assigned_class?: string;
  qualification?: string;
  join_date?: string;
  department?: string;
  designation?: string;
  experience_years?: number;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  salary?: number;
  employment_type?: string;
  reporting_manager?: string;
  status?: string;
  role?: string;
}

export interface StaffAttendanceDTO {
  id: string;
  organisation_id: string;
  staff_id: string;
  attendance_date: string | null;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
  status: string | null;
  remarks: string | null;
  marked_by: string | null;
  approved: boolean | null;
  created_at?: string;
}

export interface CreateStaffAttendanceInput {
  staff_id: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  remarks?: string;
}

export interface StaffLeaveRequestDTO {
  id: string;
  organisation_id: string;
  staff_id: string;
  leave_type: string | null;
  from_date: string | null;
  to_date: string | null;
  reason: string | null;
  status: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  created_at?: string;
}

export interface CreateStaffLeaveRequestInput {
  staff_id: string;
  leave_type?: string;
  from_date: string;
  to_date: string;
  reason?: string;
}

export interface StaffPayrollDTO {
  id: string;
  organisation_id: string;
  staff_id: string;
  base_salary: number | null;
  allowances: number | null;
  deductions: number | null;
  net_salary: number | null;
  pay_frequency: string | null;
  components: Record<string, unknown> | null;
  created_at?: string;
}

export interface StaffPayslipDTO {
  id: string;
  organisation_id: string;
  staff_id: string;
  month: string | null;
  year: number | null;
  gross_pay: number | null;
  deductions: number | null;
  net_pay: number | null;
  status: string | null;
  paid_at: string | null;
  payment_method: string | null;
  created_at?: string;
}