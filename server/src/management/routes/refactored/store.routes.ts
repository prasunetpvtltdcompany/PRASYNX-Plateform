import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { storeController } from '../../controllers/store.controller';

const router = Router();


// URL param org_id/organisation_id must match JWT
router.param('organisation_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('org_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.use(authenticate);
router.use(authorize('management', 'admin', 'store', 'accountant', 'student', 'parent'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => storeController.getDashboard(req, res)));
router.get('/products/:organisation_id', asyncHandler((req, res) => storeController.getProducts(req, res)));
router.post('/products/:organisation_id', asyncHandler((req, res) => storeController.createProduct(req, res)));
router.put('/products/:id', asyncHandler((req, res) => storeController.updateProduct(req, res)));
router.delete('/products/:id', asyncHandler((req, res) => storeController.deleteProduct(req, res)));
router.post('/products/:id/duplicate', asyncHandler((req, res) => storeController.duplicateProduct(req, res)));
router.post('/products/:id/stock', asyncHandler((req, res) => storeController.updateStock(req, res)));
router.get('/orders/:organisation_id', asyncHandler((req, res) => storeController.getOrders(req, res)));
router.post('/orders/:organisation_id', asyncHandler((req, res) => storeController.createOrder(req, res)));
router.put('/orders/:id/status', asyncHandler((req, res) => storeController.updateOrderStatus(req, res)));
router.post('/orders/:id/refund', asyncHandler((req, res) => storeController.refundOrder(req, res)));
router.get('/inventory/:organisation_id', asyncHandler((req, res) => storeController.getInventory(req, res)));
router.post('/inventory/:id/add', asyncHandler((req, res) => storeController.addStock(req, res)));
router.post('/inventory/:id/remove', asyncHandler((req, res) => storeController.removeStock(req, res)));
router.post('/inventory/:id/transfer', asyncHandler((req, res) => storeController.transferInventory(req, res)));
router.get('/categories/:organisation_id', asyncHandler((req, res) => storeController.getCategories(req, res)));
router.post('/categories/:organisation_id', asyncHandler((req, res) => storeController.createCategory(req, res)));
router.put('/categories/:id', asyncHandler((req, res) => storeController.updateCategory(req, res)));
router.post('/categories/:id/archive', asyncHandler((req, res) => storeController.archiveCategory(req, res)));
router.get('/suppliers/:organisation_id', asyncHandler((req, res) => storeController.getSuppliers(req, res)));
router.post('/suppliers/:organisation_id', asyncHandler((req, res) => storeController.createSupplier(req, res)));
router.put('/suppliers/:id', asyncHandler((req, res) => storeController.updateSupplier(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => storeController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => storeController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => storeController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => storeController.getSidebar(req, res)));

export default router;
