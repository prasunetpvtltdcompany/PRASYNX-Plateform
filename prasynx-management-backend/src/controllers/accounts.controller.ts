import { Response } from 'express';
import { AuthRequest } from '../types';
import { accountsService } from '../services/accounts.service';
import { sendSuccess, sendError } from '../utils/response';

class AccountsController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch dashboard'); }
  }

  async getChartOfAccounts(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getChartOfAccounts(organisation_id);
      sendSuccess(res, data, 'Chart of accounts fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch chart of accounts'); }
  }

  async createAccount(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createAccount(organisation_id, req.body);
      sendSuccess(res, data, 'Account created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create account'); }
  }

  async updateAccount(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.updateAccount(id, req.body);
      sendSuccess(res, data, 'Account updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update account'); }
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.deleteAccount(id);
      sendSuccess(res, data, 'Account deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete account'); }
  }

  async getLedgers(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getLedgers(organisation_id);
      sendSuccess(res, data, 'Ledgers fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch ledgers'); }
  }

  async getJournalEntries(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getJournalEntries(organisation_id, req.query);
      sendSuccess(res, data, 'Journal entries fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch journal entries'); }
  }

  async createJournalEntry(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createJournalEntry(organisation_id, req.body);
      sendSuccess(res, data, 'Journal entry created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create journal entry'); }
  }

  async updateJournalEntry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.updateJournalEntry(id, req.body);
      sendSuccess(res, data, 'Journal entry updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update journal entry'); }
  }

  async approveJournalEntry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.approveJournalEntry(id);
      sendSuccess(res, data, 'Journal entry approved');
    } catch (err: any) { sendError(res, err.message || 'Failed to approve journal entry'); }
  }

  async reverseJournalEntry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.reverseJournalEntry(id);
      sendSuccess(res, data, 'Journal entry reversed');
    } catch (err: any) { sendError(res, err.message || 'Failed to reverse journal entry'); }
  }

  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getTransactions(organisation_id, req.query);
      sendSuccess(res, data, 'Transactions fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch transactions'); }
  }

  async createTransaction(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createTransaction(organisation_id, req.body);
      sendSuccess(res, data, 'Transaction created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create transaction'); }
  }

  async getAssets(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getAssets(organisation_id);
      sendSuccess(res, data, 'Assets fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch assets'); }
  }

  async createAsset(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createAsset(organisation_id, req.body);
      sendSuccess(res, data, 'Asset created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create asset'); }
  }

  async updateAssetValue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.updateAssetValue(id, req.body);
      sendSuccess(res, data, 'Asset updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update asset'); }
  }

  async createLiability(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createLiability(organisation_id, req.body);
      sendSuccess(res, data, 'Liability created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create liability'); }
  }

  async getBudgets(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getBudgets(organisation_id);
      sendSuccess(res, data, 'Budgets fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch budgets'); }
  }

  async createBudget(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.createBudget(organisation_id, req.body);
      sendSuccess(res, data, 'Budget created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create budget'); }
  }

  async updateBudget(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await accountsService.updateBudget(id, req.body);
      sendSuccess(res, data, 'Budget updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update budget'); }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch analytics'); }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch AI insights'); }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch reports'); }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await accountsService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch sidebar'); }
  }
}

export const accountsController = new AccountsController();
