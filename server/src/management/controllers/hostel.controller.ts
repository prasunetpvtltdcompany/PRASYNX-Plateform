import { Response } from 'express';
import { AuthRequest } from '../types';
import { hostelService } from '../services/hostel.service';
import { sendSuccess, sendError } from '../utils/response';

class HostelController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Hostel dashboard fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch dashboard'); }
  }

  async getHostels(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getHostels(organisation_id);
      sendSuccess(res, data, 'Hostels fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch hostels'); }
  }

  async createHostel(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.createHostel(organisation_id, req.body);
      sendSuccess(res, data, 'Hostel created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create hostel'); }
  }

  async updateHostel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.updateHostel(id, req.body);
      sendSuccess(res, data, 'Hostel updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update hostel'); }
  }

  async deleteHostel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.deleteHostel(id);
      sendSuccess(res, data, 'Hostel deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete hostel'); }
  }

  async getRooms(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getRooms(organisation_id, req.query);
      sendSuccess(res, data, 'Rooms fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch rooms'); }
  }

  async createRoom(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.createRoom(organisation_id, req.body);
      sendSuccess(res, data, 'Room created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create room'); }
  }

  async updateRoom(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.updateRoom(id, req.body);
      sendSuccess(res, data, 'Room updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update room'); }
  }

  async deleteRoom(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.deleteRoom(id);
      sendSuccess(res, data, 'Room deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete room'); }
  }

  async getAllocations(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getAllocations(organisation_id);
      sendSuccess(res, data, 'Allocations fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch allocations'); }
  }

  async createAllocation(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.createAllocation(organisation_id, req.body);
      sendSuccess(res, data, 'Allocation created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create allocation'); }
  }

  async updateAllocation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.updateAllocation(id, req.body);
      sendSuccess(res, data, 'Allocation updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update allocation'); }
  }

  async deleteAllocation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.deleteAllocation(id);
      sendSuccess(res, data, 'Allocation deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete allocation'); }
  }

  async getWardens(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getWardens(organisation_id);
      sendSuccess(res, data, 'Wardens fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch wardens'); }
  }

  async getAttendance(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getAttendance(organisation_id);
      sendSuccess(res, data, 'Attendance fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch attendance'); }
  }

  async markAttendance(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.markAttendance(organisation_id, req.body);
      sendSuccess(res, data, 'Attendance marked');
    } catch (err: any) { sendError(res, err.message || 'Failed to mark attendance'); }
  }

  async getFees(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getFees(organisation_id);
      sendSuccess(res, data, 'Fees fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch fees'); }
  }

  async collectFee(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.collectFee(id, req.body);
      sendSuccess(res, data, 'Fee collected');
    } catch (err: any) { sendError(res, err.message || 'Failed to collect fee'); }
  }

  async getVisitors(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getVisitors(organisation_id);
      sendSuccess(res, data, 'Visitors fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch visitors'); }
  }

  async approveVisitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.approveVisitor(id);
      sendSuccess(res, data, 'Visitor approved');
    } catch (err: any) { sendError(res, err.message || 'Failed to approve visitor'); }
  }

  async rejectVisitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await hostelService.rejectVisitor(id);
      sendSuccess(res, data, 'Visitor rejected');
    } catch (err: any) { sendError(res, err.message || 'Failed to reject visitor'); }
  }

  async getMaintenance(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getMaintenance(organisation_id);
      sendSuccess(res, data, 'Maintenance requests fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch maintenance'); }
  }

  async createMaintenanceTicket(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.createMaintenanceTicket(organisation_id, req.body);
      sendSuccess(res, data, 'Maintenance ticket created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create ticket'); }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch analytics'); }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch AI insights'); }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch reports'); }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await hostelService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch sidebar'); }
  }
}

export const hostelController = new HostelController();
