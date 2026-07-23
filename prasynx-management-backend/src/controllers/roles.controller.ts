import { Response } from 'express';
import { AuthRequest } from '../types';
import { rolesService } from '../services/roles.service';
import { sendSuccess, sendError } from '../utils/response';

class RolesController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch dashboard');
    }
  }

  async getRoles(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getRoles(organisation_id);
      sendSuccess(res, data, 'Roles fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch roles');
    }
  }

  async createRole(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.createRole(organisation_id, req.body);
      sendSuccess(res, data, 'Role created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create role');
    }
  }

  async updateRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await rolesService.updateRole(id, req.body);
      sendSuccess(res, data, 'Role updated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update role');
    }
  }

  async deleteRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await rolesService.deleteRole(id);
      sendSuccess(res, data, 'Role deleted');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete role');
    }
  }

  async assignPermissions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await rolesService.assignPermissions(id, req.body);
      sendSuccess(res, data, 'Permissions assigned');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to assign permissions');
    }
  }

  async getPermissions(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getPermissions(organisation_id);
      sendSuccess(res, data, 'Permissions fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch permissions');
    }
  }

  async getUsers(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getUsers(organisation_id, req.query);
      sendSuccess(res, data, 'Users fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch users');
    }
  }

  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const data = await rolesService.updateUserRole(user_id, req.body);
      sendSuccess(res, data, 'User role updated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update user role');
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getAuditLogs(organisation_id);
      sendSuccess(res, data, 'Audit logs fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch audit logs');
    }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch analytics');
    }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch reports');
    }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await rolesService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch sidebar');
    }
  }
}

export const rolesController = new RolesController();
