import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { profileValidation } from '../middleware/validation.middleware';

const router = Router();

// 모든 프로필 관련 라우트는 인증 필요
router.use(authMiddleware);

// 내 프로필 조회
router.get('/', ProfileController.getProfile);

// 프로필 수정 (이름만)
router.put('/', profileValidation.updateProfile, ProfileController.updateProfile);

// PIN 변경
router.put('/pin', profileValidation.changePin, ProfileController.changePin);

// 언어 설정 변경
router.put('/language', ProfileController.updateLanguage);

export default router;