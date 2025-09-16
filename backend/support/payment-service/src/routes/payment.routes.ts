import { Router } from 'express';
import { paymentController } from '@/controllers/payment.controller';
import { authenticateToken, staffAndOwner } from '@/middlewares/auth';
import { handleValidationErrors } from '@/middlewares/error';
import {
  createPaymentValidation,
  updatePaymentStatusValidation,
  paymentIdValidation,
  orderIdValidation,
} from '@/validators/payment.validators';

const router = Router();

router.post(
  '/',
  authenticateToken,
  staffAndOwner,
  createPaymentValidation,
  handleValidationErrors,
  paymentController.createPayment
);

router.get(
  '/:id',
  authenticateToken,
  staffAndOwner,
  paymentIdValidation,
  handleValidationErrors,
  paymentController.getPayment
);

router.patch(
  '/:id/status',
  authenticateToken,
  staffAndOwner,
  updatePaymentStatusValidation,
  handleValidationErrors,
  paymentController.updatePaymentStatus
);

router.post(
  '/:id/cancel',
  authenticateToken,
  staffAndOwner,
  paymentIdValidation,
  handleValidationErrors,
  paymentController.cancelPayment
);

router.post(
  '/callback',
  paymentController.handlePGCallback
);

router.get(
  '/order/:orderId',
  authenticateToken,
  staffAndOwner,
  orderIdValidation,
  handleValidationErrors,
  paymentController.getPaymentsByOrder
);

export default router;