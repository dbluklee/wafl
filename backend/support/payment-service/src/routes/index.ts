import { Router } from 'express';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/payments', paymentRoutes);

export default router;