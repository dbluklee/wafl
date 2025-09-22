import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authenticate, requireStaffOrOwner } from '../middlewares/auth';
import { logValidators } from '../validators/dashboard.validators';

const router = Router();
const logController = new LogController();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireStaffOrOwner);

// Main Logs Routes
router.get(
  '/',
  logValidators.getLogs,
  logController.getLogs
);

router.get(
  '/recent',
  logValidators.getRecentLogs,
  logController.getRecentLogs
);

router.get(
  '/stats',
  logValidators.getLogStats,
  logController.getLogStats
);

// Undo Routes
router.post(
  '/undo',
  logValidators.undoAction,
  logController.undoAction
);

router.get(
  '/undoable',
  logValidators.getUndoableActions,
  logController.getUndoableActions
);

// Filtered Logs Routes
router.get(
  '/actions/:action',
  logValidators.getLogsByAction,
  logController.getLogsByAction
);

router.get(
  '/table/:tableId',
  logValidators.getTableLogs,
  logController.getTableLogs
);

// Create Log Route (for manual log creation)
router.post(
  '/create',
  logValidators.createLog,
  logController.createLog
);

// Cleanup Route (owner only - would need additional middleware)
router.delete(
  '/cleanup',
  logController.cleanupOldLogs
);

export default router;