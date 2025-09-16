import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authMiddleware);

// 카테고리 목록 조회
router.get('/', categoryController.getAll);

// 카테고리 상세 조회
router.get('/:categoryId', categoryController.getById);

// 카테고리 생성
router.post('/', categoryController.create);

// 카테고리 수정
router.put('/:categoryId', categoryController.update);

// 카테고리 삭제
router.delete('/:categoryId', categoryController.delete);

// 카테고리 순서 변경
router.put('/reorder', categoryController.reorder);

export default router;