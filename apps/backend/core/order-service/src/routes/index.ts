import { Router } from 'express';
import orderRoutes from './order.routes';
import kitchenRoutes from './kitchen.routes';

const router = Router();

router.use('/orders', orderRoutes);
router.use('/kitchen', kitchenRoutes);

export default router;