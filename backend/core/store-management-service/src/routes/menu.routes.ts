import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../config/multer';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 메뉴 목록 조회
router.get('/', menuController.getAll);

// 메뉴 상세 조회
router.get('/:menuId', menuController.getById);

// 메뉴 생성
router.post('/', menuController.create);

// 메뉴 수정
router.put('/:menuId', menuController.update);

// 메뉴 품절 처리
router.patch('/:menuId/availability', menuController.updateAvailability);

// 메뉴 이미지 업로드
router.post('/:menuId/image', upload.single('image'), menuController.uploadImage);

// 메뉴 삭제
router.delete('/:menuId', menuController.delete);

// 재고 일괄 업데이트
router.put('/stock/bulk', menuController.bulkUpdateStock);

export default router;