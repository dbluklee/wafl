import { body, param, query } from 'express-validator';

// 주문 생성 검증
export const validateCreateOrder = [
  body('tableId')
    .notEmpty()
    .withMessage('테이블 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 테이블 ID를 입력해주세요'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('주문 항목은 최소 1개 이상이어야 합니다'),

  body('items.*.menuId')
    .notEmpty()
    .withMessage('메뉴 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 메뉴 ID를 입력해주세요'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('수량은 1-99 사이의 숫자여야 합니다'),

  body('customerId')
    .optional()
    .isUUID()
    .withMessage('유효한 고객 ID를 입력해주세요'),

  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('특별 요청사항은 500자 이하로 입력해주세요'),

  body('customerLanguage')
    .optional()
    .isIn(['ko', 'en', 'ja', 'zh'])
    .withMessage('지원하지 않는 언어입니다'),

  body('aiInteraction')
    .optional()
    .isBoolean()
    .withMessage('AI 상호작용 여부는 boolean 값이어야 합니다')
];

// 주문 상태 변경 검증
export const validateUpdateOrderStatus = [
  param('orderId')
    .notEmpty()
    .withMessage('주문 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 주문 ID를 입력해주세요'),

  body('status')
    .notEmpty()
    .withMessage('상태는 필수입니다')
    .isIn(['pending', 'confirmed', 'cooking', 'ready', 'served', 'cancelled'])
    .withMessage('유효하지 않은 상태입니다'),

  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('사유는 200자 이하로 입력해주세요')
];

// 주문 취소 검증
export const validateCancelOrder = [
  param('orderId')
    .notEmpty()
    .withMessage('주문 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 주문 ID를 입력해주세요'),

  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('취소 사유는 200자 이하로 입력해주세요')
];

// 주문 조회 검증
export const validateGetOrder = [
  param('orderId')
    .notEmpty()
    .withMessage('주문 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 주문 ID를 입력해주세요')
];

// 테이블별 주문 조회 검증
export const validateGetTableOrders = [
  param('tableId')
    .notEmpty()
    .withMessage('테이블 ID는 필수입니다')
    .isUUID()
    .withMessage('유효한 테이블 ID를 입력해주세요')
];

// 주문 목록 조회 검증
export const validateGetOrders = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cooking', 'ready', 'served', 'cancelled'])
    .withMessage('유효하지 않은 상태입니다'),

  query('tableId')
    .optional()
    .isUUID()
    .withMessage('유효한 테이블 ID를 입력해주세요'),

  query('orderNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('주문번호는 50자 이하로 입력해주세요'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('유효한 시작 날짜를 입력해주세요'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('유효한 종료 날짜를 입력해주세요'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 숫자여야 합니다'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('한 페이지 항목 수는 1-100 사이여야 합니다')
];