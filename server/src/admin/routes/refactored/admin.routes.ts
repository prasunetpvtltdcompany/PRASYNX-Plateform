import { Router, type NextFunction, type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { auditLog } from '../../middleware/audit';
import { authController } from '../../controllers/auth.controller';
import {
  loginSchema, createOrgSchema, createManagementAccessSchema,
  verifyOrgSchema, changePasswordSchema
} from '../../validators/auth.validator';

const noopLimiter = (_req: Request, _res: Response, next: NextFunction) => next();
const authLimiter = noopLimiter;
const resetLimiter = noopLimiter;

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.post('/logout', asyncHandler((req, res) => authController.logout(req, res)));
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
