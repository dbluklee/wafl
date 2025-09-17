import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '입력 데이터가 올바르지 않습니다.',
      errors: errors.array()
    });
    return;
  }
  next();
};

export const profileValidation = {
  updateProfile: [
    body('name')
      .notEmpty()
      .withMessage('이름은 필수입니다.')
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2-50자 사이여야 합니다.'),
    handleValidationErrors
  ],

  changePin: [
    body('currentPin')
      .notEmpty()
      .withMessage('현재 PIN은 필수입니다.')
      .isLength({ min: 4, max: 6 })
      .withMessage('PIN은 4-6자리여야 합니다.')
      .isNumeric()
      .withMessage('PIN은 숫자만 입력 가능합니다.'),
    body('newPin')
      .notEmpty()
      .withMessage('새 PIN은 필수입니다.')
      .isLength({ min: 4, max: 6 })
      .withMessage('PIN은 4-6자리여야 합니다.')
      .isNumeric()
      .withMessage('PIN은 숫자만 입력 가능합니다.'),
    handleValidationErrors
  ]
};

export const staffValidation = {
  createStaff: [
    body('name')
      .notEmpty()
      .withMessage('직원 이름은 필수입니다.')
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2-50자 사이여야 합니다.'),
    body('userPin')
      .notEmpty()
      .withMessage('직원 PIN은 필수입니다.')
      .isLength({ min: 4, max: 6 })
      .withMessage('PIN은 4-6자리여야 합니다.')
      .isNumeric()
      .withMessage('PIN은 숫자만 입력 가능합니다.'),
    body('phone')
      .optional()
      .isMobilePhone('ko-KR')
      .withMessage('올바른 휴대폰 번호를 입력해주세요.'),
    handleValidationErrors
  ],

  updateStaff: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2-50자 사이여야 합니다.'),
    body('userPin')
      .optional()
      .isLength({ min: 4, max: 6 })
      .withMessage('PIN은 4-6자리여야 합니다.')
      .isNumeric()
      .withMessage('PIN은 숫자만 입력 가능합니다.'),
    body('phone')
      .optional()
      .isMobilePhone('ko-KR')
      .withMessage('올바른 휴대폰 번호를 입력해주세요.'),
    handleValidationErrors
  ]
};