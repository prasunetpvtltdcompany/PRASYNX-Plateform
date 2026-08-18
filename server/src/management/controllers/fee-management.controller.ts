import { Response } from 'express';
import { feeManagementService } from '../services/fee-management.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class FeeManagementController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getFeeStructures(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getFeeStructures(organisation_id);
    sendSuccess(res, result);
  }

  async createFeeStructure(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.createFeeStructure(organisation_id, req.body);
    sendCreated(res, result, 'Fee structure created');
  }

  async updateFeeStructure(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const result = await feeManagementService.updateFeeStructure(id, req.body);
    sendSuccess(res, result, 'Fee structure updated');
  }

  async deleteFeeStructure(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const result = await feeManagementService.deleteFeeStructure(id);
    sendSuccess(res, result, 'Fee structure deleted');
  }

  async getStudentFees(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { search, status, class: cls } = req.query;
    const result = await feeManagementService.getStudentFees(organisation_id, {
      search: search as string | undefined,
      status: status as string | undefined,
      class: cls as string | undefined,
    });
    sendSuccess(res, result);
  }

  async collectPayment(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.collectPayment(organisation_id, req.body);
    sendCreated(res, result, 'Payment collected');
  }

  async getTransactions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const result = await feeManagementService.getTransactions(organisation_id, limit);
    sendSuccess(res, result);
  }

  async getInvoices(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { status } = req.query;
    const result = await feeManagementService.getInvoices(organisation_id, { status: status as string | undefined });
    sendSuccess(res, result);
  }

  async createInvoice(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.createInvoice(organisation_id, req.body);
    sendCreated(res, result, 'Invoice created');
  }

  async getScholarships(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getScholarships(organisation_id);
    sendSuccess(res, result);
  }

  async approveScholarship(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const result = await feeManagementService.approveScholarship(id);
    sendSuccess(res, result, 'Scholarship approved');
  }

  async getFinancialAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getFinancialAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { type } = req.query;
    const result = await feeManagementService.getReports(organisation_id, type as string | undefined);
    sendSuccess(res, result);
  }

  async getSidebar(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await feeManagementService.getSidebar(organisation_id);
    sendSuccess(res, result);
  }
}

export const feeManagementController = new FeeManagementController();
