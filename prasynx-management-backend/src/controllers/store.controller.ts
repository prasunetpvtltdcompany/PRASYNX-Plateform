import { Response } from 'express';
import { AuthRequest } from '../types';
import { storeService } from '../services/store.service';
import { sendSuccess, sendError } from '../utils/response';

class StoreController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Store dashboard fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch dashboard'); }
  }

  async getProducts(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getProducts(organisation_id, req.query);
      sendSuccess(res, data, 'Products fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch products'); }
  }

  async createProduct(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.createProduct(organisation_id, req.body);
      sendSuccess(res, data, 'Product created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create product'); }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.updateProduct(id, req.body);
      sendSuccess(res, data, 'Product updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update product'); }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.deleteProduct(id);
      sendSuccess(res, data, 'Product deleted');
    } catch (err: any) { sendError(res, err.message || 'Failed to delete product'); }
  }

  async duplicateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.duplicateProduct(id);
      sendSuccess(res, data, 'Product duplicated');
    } catch (err: any) { sendError(res, err.message || 'Failed to duplicate product'); }
  }

  async updateStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.updateStock(id, req.body);
      sendSuccess(res, data, 'Stock updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update stock'); }
  }

  async getOrders(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getOrders(organisation_id, req.query);
      sendSuccess(res, data, 'Orders fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch orders'); }
  }

  async createOrder(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.createOrder(organisation_id, req.body);
      sendSuccess(res, data, 'Order created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create order'); }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.updateOrderStatus(id, req.body);
      sendSuccess(res, data, 'Order status updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update order status'); }
  }

  async refundOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.refundOrder(id);
      sendSuccess(res, data, 'Order refunded');
    } catch (err: any) { sendError(res, err.message || 'Failed to refund order'); }
  }

  async getInventory(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getInventory(organisation_id);
      sendSuccess(res, data, 'Inventory fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch inventory'); }
  }

  async addStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.addStock(id, req.body);
      sendSuccess(res, data, 'Stock added');
    } catch (err: any) { sendError(res, err.message || 'Failed to add stock'); }
  }

  async removeStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.removeStock(id, req.body);
      sendSuccess(res, data, 'Stock removed');
    } catch (err: any) { sendError(res, err.message || 'Failed to remove stock'); }
  }

  async transferInventory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.transferInventory(id, req.body);
      sendSuccess(res, data, 'Inventory transferred');
    } catch (err: any) { sendError(res, err.message || 'Failed to transfer inventory'); }
  }

  async getCategories(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getCategories(organisation_id);
      sendSuccess(res, data, 'Categories fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch categories'); }
  }

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.createCategory(organisation_id, req.body);
      sendSuccess(res, data, 'Category created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create category'); }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.updateCategory(id, req.body);
      sendSuccess(res, data, 'Category updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update category'); }
  }

  async archiveCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.archiveCategory(id);
      sendSuccess(res, data, 'Category archived');
    } catch (err: any) { sendError(res, err.message || 'Failed to archive category'); }
  }

  async getSuppliers(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getSuppliers(organisation_id);
      sendSuccess(res, data, 'Suppliers fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch suppliers'); }
  }

  async createSupplier(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.createSupplier(organisation_id, req.body);
      sendSuccess(res, data, 'Supplier created');
    } catch (err: any) { sendError(res, err.message || 'Failed to create supplier'); }
  }

  async updateSupplier(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await storeService.updateSupplier(id, req.body);
      sendSuccess(res, data, 'Supplier updated');
    } catch (err: any) { sendError(res, err.message || 'Failed to update supplier'); }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch analytics'); }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch AI insights'); }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch reports'); }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await storeService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) { sendError(res, err.message || 'Failed to fetch sidebar'); }
  }
}

export const storeController = new StoreController();
