import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// School Store (legacy) routes — canteen menu, pre-orders, products, orders,
// fundraising campaigns, donations, merchandise, and ticket sales
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { schoolStoreController } from '../controllers/school-store.controller';

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

router.use(verifyManagementAuth);
router.use(enforceOrgAccess());


router.get('/menu/:org_id', asyncHandler(schoolStoreController.getMenuItems));
router.post('/menu', asyncHandler(schoolStoreController.createMenuItem));

router.get('/pre-orders/:org_id', asyncHandler(schoolStoreController.getPreOrders));
router.post('/pre-orders', asyncHandler(schoolStoreController.createPreOrder));

router.get('/products/:org_id', asyncHandler(schoolStoreController.getProducts));
router.post('/products', asyncHandler(schoolStoreController.createProduct));

router.get('/orders/:org_id', asyncHandler(schoolStoreController.getOrders));
router.post('/orders', asyncHandler(schoolStoreController.createOrder));

router.get('/fundraising/:org_id', asyncHandler(schoolStoreController.getFundraisingCampaigns));
router.post('/fundraising', asyncHandler(schoolStoreController.createFundraisingCampaign));

router.get('/donations/:org_id', asyncHandler(schoolStoreController.getDonations));
router.post('/donations', asyncHandler(schoolStoreController.createDonation));

router.get('/merchandise/:org_id', asyncHandler(schoolStoreController.getMerchandiseItems));
router.post('/merchandise', asyncHandler(schoolStoreController.createMerchandiseItem));

router.get('/tickets/:org_id', asyncHandler(schoolStoreController.getTicketSales));
router.post('/tickets', asyncHandler(schoolStoreController.createTicketSale));

export default router;
