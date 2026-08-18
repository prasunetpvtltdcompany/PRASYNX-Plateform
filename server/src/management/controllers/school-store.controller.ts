import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class SchoolStoreController {
  async getMenuItems(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('canteen_menu_items').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMenuItem(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('canteen_menu_items').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getPreOrders(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('meal_pre_orders').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPreOrder(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('meal_pre_orders').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('store_products').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('store_products').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('store_orders').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('store_orders').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getFundraisingCampaigns(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('fundraising_campaigns').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createFundraisingCampaign(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('fundraising_campaigns').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getDonations(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('donations').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createDonation(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('donations').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getMerchandiseItems(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('merchandise_items').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMerchandiseItem(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('merchandise_items').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getTicketSales(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('ticket_sales').select('*').eq('organisation_id', req.params.org_id);
      if (error) return sendError(res, error.message);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createTicketSale(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('ticket_sales').insert(req.body);
      if (error) return sendError(res, error.message);
      sendCreated(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const schoolStoreController = new SchoolStoreController();
