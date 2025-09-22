import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { HistoryController } from '../controllers/history.controller';
import { authMiddleware, ownerOnly } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route GET /api/v1/history
 * @desc 히스토리 목록 조회
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit은 1-100 사이의 숫자여야 합니다.'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset은 0 이상의 숫자여야 합니다.'),
    query('entityType').optional().isString().withMessage('entityType은 문자열이어야 합니다.'),
    query('entityId').optional().isUUID().withMessage('entityId는 유효한 UUID여야 합니다.'),
    query('action').optional().isString().withMessage('action은 문자열이어야 합니다.'),
    query('userId').optional().isUUID().withMessage('userId는 유효한 UUID여야 합니다.'),
    query('startDate').optional().isISO8601().withMessage('startDate는 유효한 날짜여야 합니다.'),
    query('endDate').optional().isISO8601().withMessage('endDate는 유효한 날짜여야 합니다.')
  ],
  handleValidationErrors,
  HistoryController.getHistory
);

/**
 * @route POST /api/v1/history
 * @desc 히스토리 생성 (다른 서비스에서 호출)
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  [
    body('action').notEmpty().withMessage('action은 필수입니다.'),
    body('entityType').notEmpty().withMessage('entityType은 필수입니다.'),
    body('entityId').notEmpty().withMessage('entityId는 필수입니다.'),
    body('entityName').optional().isString().withMessage('entityName은 문자열이어야 합니다.'),
    body('oldData').optional().isObject().withMessage('oldData는 객체여야 합니다.'),
    body('newData').optional().isObject().withMessage('newData는 객체여야 합니다.'),
    body('metadata').optional().isObject().withMessage('metadata는 객체여야 합니다.'),
    body('isUndoable').optional().isBoolean().withMessage('isUndoable은 불린값이어야 합니다.'),
    body('undoDeadlineMinutes').optional().isInt({ min: 1 }).withMessage('undoDeadlineMinutes는 양의 정수여야 합니다.')
  ],
  handleValidationErrors,
  HistoryController.createHistory
);

/**
 * @route POST /api/v1/history/undo
 * @desc Undo 실행
 * @access Private
 */
router.post(
  '/undo',
  authMiddleware,
  [
    body('actionId').isUUID().withMessage('actionId는 유효한 UUID여야 합니다.'),
    body('reason').optional().isString().withMessage('reason은 문자열이어야 합니다.')
  ],
  handleValidationErrors,
  HistoryController.executeUndo
);

/**
 * @route POST /api/v1/history/redo
 * @desc Redo 실행
 * @access Private
 */
router.post(
  '/redo',
  authMiddleware,
  [
    body('undoActionId').isUUID().withMessage('undoActionId는 유효한 UUID여야 합니다.')
  ],
  handleValidationErrors,
  HistoryController.executeRedo
);

/**
 * @route GET /api/v1/history/entity/:entityType/:entityId
 * @desc 특정 엔티티의 히스토리 조회
 * @access Private
 */
router.get(
  '/entity/:entityType/:entityId',
  authMiddleware,
  [
    param('entityType').notEmpty().withMessage('entityType은 필수입니다.'),
    param('entityId').isUUID().withMessage('entityId는 유효한 UUID여야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit은 1-50 사이의 숫자여야 합니다.')
  ],
  handleValidationErrors,
  HistoryController.getEntityHistory
);

export default router;