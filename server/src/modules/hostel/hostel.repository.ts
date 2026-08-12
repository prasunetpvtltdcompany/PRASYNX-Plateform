import type { CreateHostelRoomInput, HostelAllocationDTO, HostelRoomDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const ROOM_COLUMNS = 'id,organisation_id,room_number,capacity,floor,building,room_type,monthly_rent,status,created_at';
const ALLOC_COLUMNS = 'id,organisation_id,student_id,room_id,check_in_date,check_out_date,status,created_at';

export class HostelRepository {
  async listRooms(tenantId: string): Promise<HostelRoomDTO[]> {
    const { data, error } = await db
      .from('hostel_rooms')
      .select(ROOM_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('building');
    if (error) throw error;
    return (data as unknown as HostelRoomDTO[]) ?? [];
  }

  async listAllocations(tenantId: string): Promise<HostelAllocationDTO[]> {
    const { data, error } = await db
      .from('hostel_allocations')
      .select(ALLOC_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as HostelAllocationDTO[]) ?? [];
  }

  async findRoom(tenantId: string, id: string): Promise<HostelRoomDTO | null> {
    const { data, error } = await db
      .from('hostel_rooms')
      .select(ROOM_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as HostelRoomDTO | null) ?? null;
  }

  async createRoom(tenantId: string, input: CreateHostelRoomInput): Promise<string> {
    const row = {
      organisation_id: tenantId,
      room_number: input.room_number,
      capacity: input.capacity ?? null,
      floor: input.floor ?? null,
      building: input.building ?? null,
      room_type: input.room_type ?? null,
      monthly_rent: input.monthly_rent ?? null,
      status: input.status ?? 'available',
    };
    const { data, error } = await db.from('hostel_rooms').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Hostel room could not be created');
    return data.id as string;
  }

  async removeRoom(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('hostel_rooms').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertRoom(tenantId: string, id: string): Promise<HostelRoomDTO> {
    const found = await this.findRoom(tenantId, id);
    if (!found) throw new NotFoundError('Hostel room not found in this school');
    return found;
  }
}