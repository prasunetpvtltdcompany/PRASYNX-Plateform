import { Response } from 'express';
import { AuthRequest } from '../types';
import { transportService } from '../services/transport.service';
import { sendSuccess, sendError } from '../utils/response';

class TransportController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Transport dashboard fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch dashboard'); }
  }

  async getVehicles(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getVehicles(organisation_id, req.query);
      sendSuccess(res, data, 'Vehicles fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch vehicles'); }
  }

  async createVehicle(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.createVehicle(organisation_id, req.body);
      sendSuccess(res, data, 'Vehicle created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create vehicle'); }
  }

  async updateVehicle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.updateVehicle(id, req.body);
      sendSuccess(res, data, 'Vehicle updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update vehicle'); }
  }

  async deleteVehicle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.deleteVehicle(id);
      sendSuccess(res, data, 'Vehicle deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete vehicle'); }
  }

  async getServiceHistory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.getServiceHistory(id);
      sendSuccess(res, data, 'Service history fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch service history'); }
  }

  async getRoutes(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getRoutes(organisation_id, req.query);
      sendSuccess(res, data, 'Routes fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch routes'); }
  }

  async createRoute(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.createRoute(organisation_id, req.body);
      sendSuccess(res, data, 'Route created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create route'); }
  }

  async updateRoute(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.updateRoute(id, req.body);
      sendSuccess(res, data, 'Route updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update route'); }
  }

  async deleteRoute(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.deleteRoute(id);
      sendSuccess(res, data, 'Route deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete route'); }
  }

  async optimizeRoute(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.optimizeRoute(id);
      sendSuccess(res, data, 'Route optimized');
    } catch (err: any) { sendError(res, err.message || 'Failed to optimize route'); }
  }

  async getAssignments(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getAssignments(organisation_id);
      sendSuccess(res, data, 'Assignments fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch assignments'); }
  }

  async createAssignment(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.createAssignment(organisation_id, req.body);
      sendSuccess(res, data, 'Assignment created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create assignment'); }
  }

  async updateAssignment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.updateAssignment(id, req.body);
      sendSuccess(res, data, 'Assignment updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update assignment'); }
  }

  async deleteAssignment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.deleteAssignment(id);
      sendSuccess(res, data, 'Assignment deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete assignment'); }
  }

  async getDrivers(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getDrivers(organisation_id);
      sendSuccess(res, data, 'Drivers fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch drivers'); }
  }

  async getExpenses(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getExpenses(organisation_id, req.query);
      sendSuccess(res, data, 'Expenses fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch expenses'); }
  }

  async createExpense(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.createExpense(organisation_id, req.body);
      sendSuccess(res, data, 'Expense created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create expense'); }
  }

  async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await transportService.updateExpense(id, req.body);
      sendSuccess(res, data, 'Expense updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update expense'); }
  }

  async getGpsTracking(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getGpsTracking(organisation_id);
      sendSuccess(res, data, 'GPS tracking data fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch GPS data'); }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch analytics'); }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch AI insights'); }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch reports'); }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await transportService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch sidebar'); }
  }
}

export const transportController = new TransportController();
