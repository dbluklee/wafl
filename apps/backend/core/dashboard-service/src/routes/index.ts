import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import logRoutes from './log.routes';

const router = Router();

// Mount route modules
router.use('/', dashboardRoutes);
router.use('/logs', logRoutes);

export default router;