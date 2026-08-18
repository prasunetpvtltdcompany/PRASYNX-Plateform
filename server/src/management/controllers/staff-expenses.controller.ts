import { Response } from 'express';
import { AuthRequest } from '../types';
import { staffExpensesService } from '../services/staff-expenses.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

class StaffExpensesController {
  async getExpenses(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await staffExpensesService.getExpenses(organisation_id, req.query);
      sendSuccess(res, data, 'Expenses fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch expenses'); }
  }

  async createExpense(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await staffExpensesService.createExpense(organisation_id, req.body, req.user?.userId);
      sendCreated(res, data, 'Expense created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create expense'); }
  }

  async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await staffExpensesService.updateExpense(id, req.body);
      sendSuccess(res, data, 'Expense updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update expense'); }
  }

  async deleteExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await staffExpensesService.deleteExpense(id);
      sendSuccess(res, data, 'Expense deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete expense'); }
  }

  async getSummary(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await staffExpensesService.getSummary(organisation_id);
      sendSuccess(res, data, 'Expense summary fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch expense summary'); }
  }
}

export const staffExpensesController = new StaffExpensesController();