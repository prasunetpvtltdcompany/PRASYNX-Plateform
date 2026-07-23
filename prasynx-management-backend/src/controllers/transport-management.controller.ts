import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class TransportManagementController {
  async getRoutes(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('organisation_id', org_id)
        .order('route_name', { ascending: true });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch routes');
    }
  }

  async createRoute(req: Request, res: Response) {
    try {
      const { route_name, stops, distance, fee, organisation_id } = req.body;
      const { data, error } = await supabase
        .from('transport_routes')
        .insert({ route_name, stops, distance, fee, organisation_id })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create route');
    }
  }

  async updateRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabase
        .from('transport_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update route');
    }
  }

  async deleteRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('transport_routes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete route');
    }
  }

  async getVehicles(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('transport_vehicles')
        .select('*')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch vehicles');
    }
  }

  async createVehicle(req: Request, res: Response) {
    try {
      const { vehicle_number, driver_name, driver_phone, capacity, vehicle_type, organisation_id } = req.body;
      const { data, error } = await supabase
        .from('transport_vehicles')
        .insert({ vehicle_number, driver_name, driver_phone, capacity, vehicle_type, organisation_id })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create vehicle');
    }
  }

  async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabase
        .from('transport_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update vehicle');
    }
  }

  async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('transport_vehicles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete vehicle');
    }
  }

  async getAllocations(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('transport_assignments')
        .select('*, vehicle:transport_vehicles(*), route:transport_routes(*), student:students(*)')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch allocations');
    }
  }

  async createAllocation(req: Request, res: Response) {
    try {
      const { student_id, route_id, vehicle_id, pickup_point, drop_point, organisation_id } = req.body;
      const { data, error } = await supabase
        .from('transport_assignments')
        .insert({ student_id, route_id, vehicle_id, pickup_point, drop_point, organisation_id })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create allocation');
    }
  }

  async deleteAllocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('transport_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete allocation');
    }
  }

  async getExpenses(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('transport_expenses')
        .select('*')
        .eq('organisation_id', org_id)
        .order('date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch expenses');
    }
  }

  async createExpense(req: Request, res: Response) {
    try {
      const { vehicle_id, expense_type, amount, date, description, organisation_id } = req.body;
      const { data, error } = await supabase
        .from('transport_expenses')
        .insert({ vehicle_id, expense_type, amount, date, description, organisation_id })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create expense');
    }
  }
}

export const transportManagementController = new TransportManagementController();
