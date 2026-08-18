import { Response } from 'express';
import { AuthRequest } from '../types';
import { payrollService } from '../services/payroll.service';
import { sendSuccess, sendError } from '../utils/response';

class PayrollController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch dashboard'); }
  }

  async getPayrollRecords(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getPayrollRecords(organisation_id, req.query);
      sendSuccess(res, data, 'Payroll records fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch payroll records'); }
  }

  async createPayrollRecord(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.createPayrollRecord(organisation_id, req.body);
      sendSuccess(res, data, 'Payroll record created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create payroll record'); }
  }

  async updatePayrollRecord(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await payrollService.updatePayrollRecord(id, req.body);
      sendSuccess(res, data, 'Payroll record updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update payroll record'); }
  }

  async processPayroll(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await payrollService.processPayroll(id);
      sendSuccess(res, data, 'Payroll processed');
    } catch (err: any) { sendError(res, err.message || 'Failed to process payroll'); }
  }

  async markPaid(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await payrollService.markPaid(id);
      sendSuccess(res, data, 'Payroll marked as paid');
    } catch (err: any) { sendError(res, err.message || 'Failed to mark payroll as paid'); }
  }

  async getSalaryStructures(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getSalaryStructures(organisation_id);
      sendSuccess(res, data, 'Salary structures fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch salary structures'); }
  }

  async createSalaryStructure(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.createSalaryStructure(organisation_id, req.body);
      sendSuccess(res, data, 'Salary structure created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create salary structure'); }
  }

  async updateSalaryStructure(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await payrollService.updateSalaryStructure(id, req.body);
      sendSuccess(res, data, 'Salary structure updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update salary structure'); }
  }

  async getEmployeeSalaries(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getEmployeeSalaries(organisation_id);
      sendSuccess(res, data, 'Employee salaries fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch employee salaries'); }
  }

  async getDeductions(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getDeductions(organisation_id);
      sendSuccess(res, data, 'Deductions fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch deductions'); }
  }

  async createDeduction(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.createDeduction(organisation_id, req.body);
      sendSuccess(res, data, 'Deduction created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create deduction'); }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch analytics'); }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch AI insights'); }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch reports'); }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await payrollService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch sidebar'); }
  }
}

export const payrollController = new PayrollController();
