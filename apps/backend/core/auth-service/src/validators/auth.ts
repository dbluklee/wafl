import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 검증 결과 확인 미들웨어
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다',
        details: errors.array()
      }
    });
  }
  next();
};

// PIN 로그인 검증
export const validatePinLogin = [
  body('storeCode')
    .isInt()
    .custom((value) => {
      const str = value.toString();
      if (str.length !== 6) {
        throw new Error('매장 코드는 정확히 6자리 숫자여야 합니다');
      }
      return true;
    }),
  body('userPin')
    .isLength({ min: 4, max: 4 })
    .isString()
    .matches(/^[0-9]{4}$/)
    .withMessage('PIN은 정확히 4자리 숫자여야 합니다'),
  handleValidationErrors
];

// 모바일 로그인 검증
export const validateMobileLogin = [
  body('phone')
    .matches(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/)
    .withMessage('올바른 전화번호 형식이 아닙니다'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('인증번호는 6자리 숫자여야 합니다'),
  handleValidationErrors
];

// 매장 가입 검증
export const validateStoreRegister = [
  body('businessNumber')
    .matches(/^[0-9]{3}-?[0-9]{2}-?[0-9]{5}$/)
    .withMessage('올바른 사업자번호 형식이 아닙니다'),
  body('phone')
    .matches(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/)
    .withMessage('올바른 전화번호 형식이 아닙니다'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('인증번호는 6자리 숫자여야 합니다'),
  body('storeName')
    .isLength({ min: 2, max: 100 })
    .withMessage('매장명은 2자 이상 100자 이하여야 합니다'),
  body('naverPlaceUrl')
    .optional()
    .isURL()
    .withMessage('올바른 URL 형식이 아닙니다'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다'),
  handleValidationErrors
];

// SMS 인증 요청 검증
export const validateSmsRequest = [
  body('phone')
    .matches(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/)
    .withMessage('올바른 전화번호 형식이 아닙니다'),
  handleValidationErrors
];

// 고객 세션 생성 검증
export const validateCustomerSession = [
  body('qrCode')
    .isLength({ min: 5, max: 100 })
    .withMessage('QR 코드가 올바르지 않습니다'),
  body('language')
    .optional()
    .isIn(['ko', 'en', 'ja', 'zh'])
    .withMessage('지원하지 않는 언어입니다'),
  handleValidationErrors
];