import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateToken, requireOwner } from '../middlewares/auth';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateGetOrder,
  validateGetTableOrders,
  validateGetOrders
} from '../validators/order';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authenticateToken);

// 주문 생성 (고객도 가능)
router.post('/', validateCreateOrder, orderController.create);

// 주문 목록 조회
router.get('/', validateGetOrders, orderController.getAll);

// 주문 상세 조회
router.get('/:orderId', validateGetOrder, orderController.getById);

// 주문 상태 변경 (직원 이상)
router.patch('/:orderId/status', validateUpdateOrderStatus, orderController.updateStatus);

// 주문 취소
router.post('/:orderId/cancel', validateCancelOrder, orderController.cancel);

// 테이블별 주문 조회
router.get('/table/:tableId', validateGetTableOrders, orderController.getTableOrders);

// 주문 통계 (점주 전용)
router.get('/stats/summary', requireOwner, orderController.getStatistics);

export default router;