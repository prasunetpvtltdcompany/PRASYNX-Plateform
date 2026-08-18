import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Smart Transport Controller (Legacy)
 *
 * Handles smart transport operations including RFID cards, bus tracking,
 * geofence alerts, pickup authorizations, bus routes, and driver behavior.
 * Functions: getRfidCards, createRfidCard, getBusTracking, createBusTracking,
 *            getGeofenceAlerts, createGeofenceAlert, getPickupAuthorizations,
 *            createPickupAuthorization, getBusRoutes, createBusRoute,
 *            getDriverBehavior, createDriverBehavior
 */
export class TransportSmartController {
  async getRfidCards(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('rfid_cards').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createRfidCard(req: Request, res: Response) {
    const { error } = await supabase.from('rfid_cards').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getBusTracking(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('bus_tracking').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createBusTracking(req: Request, res: Response) {
    const { error } = await supabase.from('bus_tracking').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getGeofenceAlerts(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('geofence_alerts').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createGeofenceAlert(req: Request, res: Response) {
    const { error } = await supabase.from('geofence_alerts').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getPickupAuthorizations(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('pickup_authorizations').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPickupAuthorization(req: Request, res: Response) {
    const { error } = await supabase.from('pickup_authorizations').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getBusRoutes(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('bus_routes').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createBusRoute(req: Request, res: Response) {
    const { error } = await supabase.from('bus_routes').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getDriverBehavior(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('driver_behavior').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createDriverBehavior(req: Request, res: Response) {
    const { error } = await supabase.from('driver_behavior').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }
}

export const transportSmartController = new TransportSmartController();
