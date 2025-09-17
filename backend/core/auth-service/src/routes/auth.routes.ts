import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';
import {
  validatePinLogin,
  validateMobileLogin,
  validateStoreRegister,
  validateSmsRequest,
  validateCustomerSession
} from '../validators/auth';

const router = Router();

// 매장 가입 (온라인 원스톱)
router.post('/stores/register', validateStoreRegister, authController.registerStore);

// 통합 로그인 (PIN + Password)
router.post('/login', validatePinLogin, authController.loginWithPin);

// PIN 로그인
router.post('/login/pin', validatePinLogin, authController.loginWithPin);

// 모바일 로그인
router.post('/login/mobile', validateMobileLogin, authController.loginWithMobile);

// SMS 인증 요청
router.post('/mobile/request', validateSmsRequest, authController.requestSmsVerification);

// SMS 인증 확인
router.post('/mobile/verify', authController.verifySmsCode);

// 고객 세션 생성 (QR 주문)
router.post('/customer/session', validateCustomerSession, authController.createCustomerSession);

// 토큰 갱신
router.post('/refresh', authController.refreshToken);

// 로그아웃 (인증 필요)
router.post('/logout', authMiddleware, authController.logout);

export default router;