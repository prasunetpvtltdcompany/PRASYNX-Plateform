import { Router } from 'express';
import { createFeeStructureSchema, assignFeeStructureSchema, recordPaymentSchema, feeStructureQuerySchema, studentFeeQuerySchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { financeController } from './finance.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.get(
  '/structures',
  authorizeAny(PERMISSIONS.SCHOOL_FINANCE_VIEW, PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  validate({ query: feeStructureQuerySchema }),
  financeController.listStructures,
);

router.post(
  '/structures',
  authorize(PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  userLimiter(60_000, 20, 'Too many fee structure writes, slow down.'),
  validate({ body: createFeeStructureSchema }),
  financeController.createStructure,
);

router.post(
  '/assign',
  authorize(PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  userLimiter(60_000, 20, 'Too many fee assignments, slow down.'),
  validate({ body: assignFeeStructureSchema }),
  financeController.assignToStudents,
);

router.post(
  '/payments',
  authorize(PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  userLimiter(60_000, 30, 'Too many payment writes, slow down.'),
  validate({ body: recordPaymentSchema }),
  financeController.recordPayment,
);

router.get(
  '/students',
  authorizeAny(PERMISSIONS.SCHOOL_FINANCE_VIEW, PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  validate({ query: studentFeeQuerySchema }),
  financeController.studentStatement,
);

router.get(
  '/fee/:studentFeeId',
  authorizeAny(PERMISSIONS.SCHOOL_FINANCE_VIEW, PERMISSIONS.SCHOOL_FINANCE_MANAGE),
  financeController.feeDetail,
);

export default router;