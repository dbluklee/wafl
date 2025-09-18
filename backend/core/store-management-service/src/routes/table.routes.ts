import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 테이블 목록 조회
router.get('/', tableController.getAll);

// 장소별 테이블 조회
router.get('/place/:placeId', tableController.getByPlace);

// 테이블 상세 조회
router.get('/:tableId', tableController.getById);

// 테이블 생성
router.post('/', tableController.create);

// 테이블 수정
router.put('/:tableId', tableController.update);

// 테이블 상태 변경
router.patch('/:tableId/status', tableController.updateStatus);

// QR 코드 재생성
router.post('/:tableId/qr', tableController.regenerateQR);

// 테이블 삭제
router.delete('/:tableId', tableController.delete);

// 테이블 일괄 생성
router.post('/bulk', tableController.bulkCreate);

export default router;