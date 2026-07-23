import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class InventoryManagementController {
  async getAssets(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_assets')
        .select('*')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAsset(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_assets')
        .insert({
          asset_name: req.body.asset_name,
          category: req.body.category,
          brand: req.body.brand,
          model: req.body.model,
          serial_number: req.body.serial_number,
          qr_code: req.body.qr_code,
          purchase_date: req.body.purchase_date,
          purchase_price: req.body.purchase_price,
          location: req.body.location,
          status: req.body.status || 'available',
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateAsset(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_assets')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .select('*')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .insert({
          item_name: req.body.item_name,
          quantity: req.body.quantity,
          unit_price: req.body.unit_price,
          vendor: req.body.vendor,
          order_date: req.body.order_date,
          status: req.body.status || 'pending',
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updatePurchaseOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .update({ status: req.body.status })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getStock(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_stock')
        .select('*')
        .eq('organisation_id', req.params.org_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createStock(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_stock')
        .insert({
          item_name: req.body.item_name,
          category: req.body.category,
          quantity: req.body.quantity,
          unit: req.body.unit,
          min_stock_level: req.body.min_stock_level,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('inventory_stock')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getMaintenanceRequests(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createMaintenanceRequest(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          asset_id: req.body.asset_id,
          description: req.body.description,
          priority: req.body.priority || 'medium',
          status: req.body.status || 'open',
          reported_by: req.body.reported_by,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateMaintenanceRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ status: req.body.status })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}

export const inventoryManagementController = new InventoryManagementController();
