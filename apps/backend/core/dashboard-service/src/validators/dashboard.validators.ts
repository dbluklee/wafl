import { body, param, query } from 'express-validator';
import { ETableStatus, ELogAction } from '../types';

// Table Status Update Validators
export const validateUpdateTableStatus = [
  param('tableId')
    .isUUID()
    .withMessage('Valid table ID is required'),

  body('status')
    .isIn(Object.values(ETableStatus))
    .withMessage(`Status must be one of: ${Object.values(ETableStatus).join(', ')}`),

  body('numberOfPeople')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Number of people must be between 0 and 20'),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be a string with maximum 500 characters')
];

// Seat Table Validators
export const validateSeatTable = [
  param('tableId')
    .isUUID()
    .withMessage('Valid table ID is required'),

  body('numberOfPeople')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of people must be between 1 and 20')
];

// Clear Table Validators
export const validateClearTable = [
  param('tableId')
    .isUUID()
    .withMessage('Valid table ID is required')
];

// Get Table Detail Validators
export const validateGetTableDetail = [
  param('tableId')
    .isUUID()
    .withMessage('Valid table ID is required')
];

// Get Place Tables Validators
export const validateGetPlaceTables = [
  param('placeId')
    .isUUID()
    .withMessage('Valid place ID is required')
];

// Log Pagination Validators
export const validateLogsPagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),

  query('action')
    .optional()
    .isIn(Object.values(ELogAction))
    .withMessage(`Action must be one of: ${Object.values(ELogAction).join(', ')}`)
];

// Undo Action Validators
export const validateUndoAction = [
  body('logId')
    .isUUID()
    .withMessage('Valid log ID is required')
];

// Get Logs by Action Validators
export const validateGetLogsByAction = [
  param('action')
    .isIn(Object.values(ELogAction))
    .withMessage(`Action must be one of: ${Object.values(ELogAction).join(', ')}`),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Get Table Logs Validators
export const validateGetTableLogs = [
  param('tableId')
    .isUUID()
    .withMessage('Valid table ID is required'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Create Log Validators
export const validateCreateLog = [
  body('action')
    .isIn(Object.values(ELogAction))
    .withMessage(`Action must be one of: ${Object.values(ELogAction).join(', ')}`),

  body('details')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Details must be a string between 1 and 1000 characters'),

  body('tableId')
    .optional()
    .isUUID()
    .withMessage('Table ID must be a valid UUID'),

  body('tableName')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Table name must be a string with maximum 50 characters'),

  body('orderId')
    .optional()
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),

  body('orderNumber')
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage('Order number must be a string with maximum 20 characters'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),

  body('oldData')
    .optional()
    .isObject()
    .withMessage('Old data must be an object'),

  body('newData')
    .optional()
    .isObject()
    .withMessage('New data must be an object'),

  body('isUndoable')
    .optional()
    .isBoolean()
    .withMessage('Is undoable must be a boolean')
];

// Get Recent Logs Validators
export const validateGetRecentLogs = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Get Undoable Actions Validators
export const validateGetUndoableActions = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Real-time Status Validators (no specific validation needed)
export const validateGetRealtimeStatus = [];

// Summary Only Validators (no specific validation needed)
export const validateGetSummaryOnly = [];

// Overview Validators (no specific validation needed)
export const validateGetOverview = [];

// Today Stats Validators (no specific validation needed)
export const validateGetTodayStats = [];

// Log Stats Validators (no specific validation needed)
export const validateGetLogStats = [];

// Custom validators for complex scenarios
export const validateTableStatusTransition = (currentStatus: ETableStatus, newStatus: ETableStatus): boolean => {
  // Define valid status transitions
  const validTransitions: { [key in ETableStatus]: ETableStatus[] } = {
    [ETableStatus.EMPTY]: [ETableStatus.SEATED],
    [ETableStatus.SEATED]: [ETableStatus.ORDERED, ETableStatus.EMPTY],
    [ETableStatus.ORDERED]: [ETableStatus.EMPTY, ETableStatus.SEATED]
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Business logic validators
export const validateBusinessRules = {
  // Check if table can be seated
  canSeatTable: (currentStatus: ETableStatus): boolean => {
    return currentStatus === ETableStatus.EMPTY;
  },

  // Check if table can be cleared
  canClearTable: (currentStatus: ETableStatus): boolean => {
    return [ETableStatus.SEATED, ETableStatus.ORDERED].includes(currentStatus);
  },

  // Check if number of people is reasonable
  isReasonableNumberOfPeople: (numberOfPeople: number): boolean => {
    return numberOfPeople >= 1 && numberOfPeople <= 20;
  },

  // Check if action can be undone
  canUndoAction: (createdAt: Date, undoableTimeLimit: number): boolean => {
    const timeDiff = Date.now() - createdAt.getTime();
    return timeDiff <= undoableTimeLimit;
  }
};

// Sanitizers
export const sanitizeTableStatusUpdate = [
  body('status').trim(),
  body('notes').optional().trim().escape()
];

export const sanitizeLogCreation = [
  body('details').trim().escape(),
  body('tableName').optional().trim(),
  body('orderNumber').optional().trim()
];

export const sanitizeStringInputs = [
  body(['details', 'tableName', 'orderNumber', 'notes'])
    .optional()
    .trim()
    .escape()
];

// Export all validators as a grouped object for easy import
export const dashboardValidators = {
  updateTableStatus: validateUpdateTableStatus,
  seatTable: validateSeatTable,
  clearTable: validateClearTable,
  getTableDetail: validateGetTableDetail,
  getPlaceTables: validateGetPlaceTables,
  getOverview: validateGetOverview,
  getTodayStats: validateGetTodayStats,
  getSummaryOnly: validateGetSummaryOnly,
  getRealtimeStatus: validateGetRealtimeStatus
};

export const logValidators = {
  getLogs: validateLogsPagination,
  undoAction: validateUndoAction,
  getLogsByAction: validateGetLogsByAction,
  getTableLogs: validateGetTableLogs,
  createLog: validateCreateLog,
  getRecentLogs: validateGetRecentLogs,
  getUndoableActions: validateGetUndoableActions,
  getLogStats: validateGetLogStats
};