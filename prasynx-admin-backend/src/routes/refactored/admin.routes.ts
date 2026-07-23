import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { auditLog } from '../../middleware/audit';
import { authController } from '../../controllers/auth.controller';
import {
  loginSchema, createOrgSchema, createManagementAccessSchema,
  verifyOrgSchema, changePasswordSchema
} from '../../validators/auth.validator';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many attempts' } });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many attempts' } });

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/verify-token', asyncHandler((req, res) => authController.verifyToken(req, res)));
router.post('/forgot-password', resetLimiter, asyncHandler((req, res) => authController.forgotPassword(req, res)));
router.post('/reset-password', resetLimiter, asyncHandler((req, res) => authController.resetPassword(req, res)));
router.post('/refresh-token', asyncHandler((req, res) => authController.refreshToken(req, res)));

router.use(authenticate);
router.use(auditLog('admin_action'));

router.get('/credential-history', asyncHandler((req, res) => authController.getCredentialHistory(req, res)));
router.post('/verify-org', validateBody(verifyOrgSchema), asyncHandler((req, res) => authController.verifyOrg(req, res)));
router.post('/create-organisation', validateBody(createOrgSchema), asyncHandler((req, res) => authController.createOrganisation(req, res)));
router.post('/create-management-access', validateBody(createManagementAccessSchema), asyncHandler((req, res) => authController.createManagementAccess(req, res)));
router.post('/change-password', validateBody(changePasswordSchema), asyncHandler((req, res) => authController.changePassword(req, res)));

export default router;
