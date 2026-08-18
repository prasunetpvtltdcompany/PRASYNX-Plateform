import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { userManagementController } from '../controllers/user-management.controller';

const router = Router();

router.use(authenticate);
router.use(auditLog('admin_action'));

// Company admins (platform-level) — must be declared before the generic /users/:id routes
router.get('/users/company-admins', asyncHandler((req, res) => userManagementController.getCompanyAdmins(req, res)));
router.post('/users/company-admins', asyncHandler((req, res) => userManagementController.createCompanyAdmin(req, res)));
router.put('/users/company-admins/:id', asyncHandler((req, res) => userManagementController.updateCompanyAdmin(req, res)));
router.delete('/users/company-admins/:id', asyncHandler((req, res) => userManagementController.deleteCompanyAdmin(req, res)));

// User directory
router.get('/users/stats', asyncHandler((req, res) => userManagementController.getStats(req, res)));
router.get('/users', asyncHandler((req, res) => userManagementController.getUsers(req, res)));
router.post('/users', asyncHandler((req, res) => userManagementController.createUser(req, res)));
router.put('/users/:id/status', asyncHandler((req, res) => userManagementController.updateUserStatus(req, res)));
router.delete('/users/:id', asyncHandler((req, res) => userManagementController.deleteUser(req, res)));

export default router;