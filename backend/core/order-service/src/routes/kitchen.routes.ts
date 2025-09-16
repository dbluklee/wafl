import { Router } from 'express';
import { body } from 'express-validator';
import { kitchenController, validateOrderId } from '../controllers/kitchen.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authenticateToken);

// 주방 전체 주문 현황
router.get('/', kitchenController.getAllOrders);

// 대기 중인 주문
router.get('/pending', kitchenController.getPendingOrders);

// 조리 중인 주문
router.get('/cooking', kitchenController.getCookingOrders);

// 완료된 주문 (서빙 대기)
router.get('/ready', kitchenController.getReadyOrders);

// 주방 통계
router.get('/stats', kitchenController.getKitchenStats);

// 특정 주문 조회 (주방 큐에서)
router.get('/:orderId', validateOrderId, kitchenController.getOrderById);

// 조리 시작
router.post('/:orderId/start', validateOrderId, kitchenController.startCooking);

// 조리 완료
router.post('/:orderId/complete', validateOrderId, kitchenController.completeOrder);

// 서빙 완료
router.post('/:orderId/serve', validateOrderId, kitchenController.markAsServed);

// 우선순위 설정
router.patch('/:orderId/priority', [
  ...validateOrderId,
  body('priority')
    .isInt({ min: 0, max: 10 })
    .withMessage('우선순위는 0-10 사이의 숫자여야 합니다')
], kitchenController.setPriority);

export default router;