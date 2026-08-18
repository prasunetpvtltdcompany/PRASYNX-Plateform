import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class HostelManagementController {
  async getRooms(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('hostel_rooms')
        .select('*')
        .eq('organisation_id', org_id)
        .order('room_number');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createRoom(req: Request, res: Response) {
    try {
      const { room_number, capacity, floor, building, room_type, monthly_rent, organisation_id } = req.body;
      const { data, error } = await supabase.from('hostel_rooms').insert({
        room_number, capacity: parseInt(capacity) || 0, floor: parseInt(floor) || 1,
        building, room_type, monthly_rent: parseFloat(monthly_rent) || 0,
        organisation_id, status: 'available'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('hostel_rooms').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('hostel_rooms').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getAllocations(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data: allocs, error } = await supabase
        .from('hostel_allocations')
        .select('*')
        .eq('organisation_id', org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!allocs || allocs.length === 0) { sendSuccess(res, []); return; }

      const roomIds = [...new Set(allocs.map((a: any) => a.room_id).filter(Boolean))];
      const studentIds = [...new Set(allocs.map((a: any) => a.student_id).filter(Boolean))];

      const [roomsRes, studentsRes] = await Promise.all([
        supabase.from('hostel_rooms').select('id, room_number, room_type, capacity, floor, building, monthly_rent, status').in('id', roomIds.length ? roomIds : ['none']),
        supabase.from('students').select('id, full_name, roll_number').in('id', studentIds.length ? studentIds : ['none']),
      ]);

      const roomsMap = new Map((roomsRes.data || []).map((r: any) => [r.id, r]));
      const studentsMap = new Map((studentsRes.data || []).map((s: any) => [s.id, s]));

      const result = allocs.map((a: any) => ({
        ...a,
        room: roomsMap.get(a.room_id) || null,
        student: studentsMap.get(a.student_id) || null,
      }));

      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAllocation(req: Request, res: Response) {
    try {
      const { student_id, room_id, room_number, bed_number, check_in_date, organisation_id } = req.body;
      const { data: room } = await supabase.from('hostel_rooms').select('room_number').eq('id', room_id).single();
      const { data, error } = await supabase.from('hostel_allocations').insert({
        student_id, room_id, room_number: room?.room_number || room_number || null,
        bed_number: bed_number || null, check_in_date, organisation_id, status: 'active'
      }).select().single();
      if (error) throw error;
      await supabase.from('hostel_rooms').update({ status: 'occupied' }).eq('id', room_id);
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateAllocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { check_out_date, status } = req.body;
      const { data: alloc } = await supabase.from('hostel_allocations').select('room_id').eq('id', id).single();
      const { data, error } = await supabase.from('hostel_allocations').update({
        check_out_date, status
      }).eq('id', id).select().single();
      if (error) throw error;
      if (status === 'checked_out' || status === 'inactive') {
        if (alloc) await supabase.from('hostel_rooms').update({ status: 'available' }).eq('id', alloc.room_id);
      }
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteAllocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data: alloc } = await supabase.from('hostel_allocations').select('room_id').eq('id', id).single();
      const { error } = await supabase.from('hostel_allocations').delete().eq('id', id);
      if (error) throw error;
      if (alloc) {
        await supabase.from('hostel_rooms').update({ status: 'available' }).eq('id', alloc.room_id);
      }
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}

export const hostelManagementController = new HostelManagementController();
