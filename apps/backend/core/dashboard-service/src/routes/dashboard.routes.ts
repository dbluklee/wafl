import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireStaffOrOwner } from '../middlewares/auth';
import { dashboardValidators } from '../validators/dashboard.validators';

const router = Router();
const dashboardController = new DashboardController();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireStaffOrOwner);

// Dashboard Overview Routes
router.get(
  '/overview',
  dashboardValidators.getOverview,
  dashboardController.getOverview
);

router.get(
  '/summary',
  dashboardValidators.getSummaryOnly,
  dashboardController.getSummaryOnly
);

// Real-time Status Routes
router.get(
  '/realtime/status',
  dashboardValidators.getRealtimeStatus,
  dashboardController.getRealtimeStatus
);

// Table Management Routes
router.patch(
  '/tables/:tableId/status',
  dashboardValidators.updateTableStatus,
  dashboardController.updateTableStatus
);

router.post(
  '/tables/:tableId/seat',
  dashboardValidators.seatTable,
  dashboardController.seatTable
);

router.post(
  '/tables/:tableId/clear',
  dashboardValidators.clearTable,
  dashboardController.clearTable
);

router.get(
  '/tables/:tableId',
  dashboardValidators.getTableDetail,
  dashboardController.getTableDetail
);

// Place Routes
router.get(
  '/places/:placeId/tables',
  dashboardValidators.getPlaceTables,
  dashboardController.getPlaceTables
);

// Statistics Routes
router.get(
  '/stats/today',
  dashboardValidators.getTodayStats,
  dashboardController.getTodayStats
);

export default router;