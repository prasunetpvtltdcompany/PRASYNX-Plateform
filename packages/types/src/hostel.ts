/** Hostel module DTOs (schemata: public.hostel_rooms, public.hostel_allocations). */

export interface HostelRoomDTO {
  id: string;
  organisation_id: string;
  room_number: string;
  capacity: number | null;
  floor: string | null;
  building: string | null;
  room_type: string | null;
  monthly_rent: string | null;
  status: string | null;
  created_at?: string;
}

export interface CreateHostelRoomInput {
  room_number: string;
  capacity?: number;
  floor?: string;
  building?: string;
  room_type?: string;
  monthly_rent?: string;
  status?: string;
}

export interface HostelAllocationDTO {
  id: string;
  organisation_id: string;
  student_id: string;
  room_id: string;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string | null;
  created_at?: string;
}