import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware, ownerOnly } from '../middleware/auth.middleware';
import { staffValidation } from '../middleware/validation.middleware';

const router = Router();

// 모든 직원 관리 라우트는 인증 + 점주 권한 필요
router.use(authMiddleware, ownerOnly);

// 직원 목록 조회
router.get('/', StaffController.getStaffList);

// 직원 추가
router.post('/', staffValidation.createStaff, StaffController.createStaff);

// 직원 정보 수정
router.put('/:staffId', staffValidation.updateStaff, StaffController.updateStaff);

// 직원 활성화/비활성화
router.patch('/:staffId/status', StaffController.toggleStaffStatus);

export default router;