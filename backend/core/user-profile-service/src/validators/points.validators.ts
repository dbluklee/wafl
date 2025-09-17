import { body } from 'express-validator';

export const pointsValidators = {
  earn: [
    body('orderId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage('올바른 주문 ID를 입력해주세요.'),

    body('amount')
      .isNumeric()
      .isFloat({ min: 1000 })
      .withMessage('주문 금액은 1,000원 이상이어야 합니다.'),

    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('설명은 200자 이내로 입력해주세요.')
  ],

  redeem: [
    body('orderId')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage('올바른 주문 ID를 입력해주세요.'),

    body('points')
      .isInt({ min: 1000 })
      .withMessage('사용 포인트는 1,000P 이상이어야 합니다.'),

    body('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('설명은 200자 이내로 입력해주세요.')
  ],

  adjust: [
    body('points')
      .isInt({ min: 1 })
      .withMessage('조정 포인트는 1P 이상이어야 합니다.'),

    body('type')
      .isIn(['increase', 'decrease'])
      .withMessage('조정 타입은 increase 또는 decrease여야 합니다.'),

    body('description')
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('조정 사유는 1~200자 사이로 입력해주세요.')
  ]
};