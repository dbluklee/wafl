import { Router } from 'express';
import { placeController } from '../controllers/place.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 장소 목록 조회
router.get('/', placeController.getAll);

// 장소 상세 조회
router.get('/:placeId', placeController.getById);

// 장소 생성
router.post('/', placeController.create);

// 장소 수정
router.put('/:placeId', placeController.update);

// 장소 삭제
router.delete('/:placeId', placeController.delete);

export default router;