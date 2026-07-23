import { Router } from 'express';
import { loginController } from '../controllers/login.controller';
import { credentialController } from '../controllers/credential.controller';
import { organisationController } from '../controllers/organisation.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/credential-history', authenticate, asyncHandler(async (req, res) => credentialController.getHistory(req, res)));
router.post('/login', asyncHandler(async (req, res) => loginController.login(req, res)));
router.post('/verify-org', authenticate, asyncHandler(async (req, res) => organisationController.verifyOrg(req, res)));
router.post('/create-organisation', authenticate, asyncHandler(async (req, res) => organisationController.createOrganisation(req, res)));
router.post('/create-management-access', authenticate, asyncHandler(async (req, res) => organisationController.createManagementAccess(req, res)));

export default router;
