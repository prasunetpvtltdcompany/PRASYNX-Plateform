import { Response } from 'express';
import { billingService } from '../services/billing.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class BillingController {
  async getOverview(req: AuthRequest, res: Response) {
    const data = await billingService.getOverview();
    sendSuccess(res, data);
  }

  async getPlans(req: AuthRequest, res: Response) {
    const data = await billingService.getPlans();
    sendSuccess(res, { plans: data });
  }

  async createPlan(req: AuthRequest, res: Response) {
    const data = await billingService.createPlan(req.body);
    sendCreated(res, { plan: data }, 'Plan created');
  }

  async updatePlan(req: AuthRequest, res: Response) {
    const data = await billingService.updatePlan(req.params.id, req.body);
    sendSuccess(res, { plan: data }, 'Plan updated');
  }

  async deletePlan(req: AuthRequest, res: Response) {
    const data = await billingService.deletePlan(req.params.id);
    sendSuccess(res, data, 'Plan deleted');
  }

  async getSubscriptions(req: AuthRequest, res: Response) {
    const data = await billingService.getSubscriptions();
    sendSuccess(res, { subscriptions: data });
  }

  async updateSubscription(req: AuthRequest, res: Response) {
    const data = await billingService.updateSubscription(req.params.id, req.body);
    sendSuccess(res, { subscription: data }, 'Subscription updated');
  }

  async deleteSubscription(req: AuthRequest, res: Response) {
    const data = await billingService.deleteSubscription(req.params.id);
    sendSuccess(res, data, 'Subscription deleted');
  }

  async getInvoices(req: AuthRequest, res: Response) {
    const data = await billingService.getInvoices();
    sendSuccess(res, { invoices: data });
  }

  async createInvoice(req: AuthRequest, res: Response) {
    const data = await billingService.createInvoice(req.body);
    sendCreated(res, { invoice: data }, 'Invoice generated');
  }

  async updateInvoiceStatus(req: AuthRequest, res: Response) {
    const data = await billingService.updateInvoiceStatus(req.params.id, req.body?.status);
    sendSuccess(res, { invoice: data }, 'Invoice status updated');
  }

  async deleteInvoice(req: AuthRequest, res: Response) {
    const data = await billingService.deleteInvoice(req.params.id);
    sendSuccess(res, data, 'Invoice deleted');
  }

  async getTransactions(req: AuthRequest, res: Response) {
    const data = await billingService.getTransactions();
    sendSuccess(res, { transactions: data });
  }

  async recordTransaction(req: AuthRequest, res: Response) {
    const data = await billingService.recordTransaction(req.body);
    sendCreated(res, data, 'Transaction recorded');
  }

  async updateTransaction(req: AuthRequest, res: Response) {
    const data = await billingService.updateTransaction(req.params.id, req.body);
    sendSuccess(res, { transaction: data }, 'Transaction updated');
  }

  async deleteTransaction(req: AuthRequest, res: Response) {
    const data = await billingService.deleteTransaction(req.params.id);
    sendSuccess(res, data, 'Transaction deleted');
  }

  async reconcile(req: AuthRequest, res: Response) {
    const data = await billingService.reconcile();
    sendSuccess(res, data, 'Billing data synced');
  }
}

export const billingController = new BillingController();
