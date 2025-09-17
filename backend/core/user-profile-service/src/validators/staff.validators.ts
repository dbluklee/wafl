import { body, param, query } from 'express-validator';

// 직원 생성 검증
export const validateStaffCreate = [
  body('name')
    .notEmpty()
    .withMessage('이름을 입력해주세요')
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('이름은 한글, 영문, 공백만 허용됩니다'),

  body('phone')
    .notEmpty()
    .withMessage('전화번호를 입력해주세요')
    .matches(/^01[0-9]-?\d{3,4}-?\d{4}$/)
    .withMessage('올바른 휴대폰 번호 형식이 아닙니다 (010-xxxx-xxxx)'),

  body('userPin')
    .notEmpty()
    .withMessage('PIN을 입력해주세요')
    .matches(/^\d{4}$/)
    .withMessage('PIN은 4자리 숫자여야 합니다'),

  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('유효한 이메일 형식이 아닙니다')
    .normalizeEmail(),

  // role은 자동으로 'staff'로 설정되므로 검증하지 않음
  body('role')
    .optional()
    .isIn(['staff'])
    .withMessage('직원 역할은 staff만 가능합니다'),
];

// 직원 업데이트 검증
export const validateStaffUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('이름은 한글, 영문, 공백만 허용됩니다'),

  body('phone')
    .optional()
    .matches(/^01[0-9]-?\d{3,4}-?\d{4}$/)
    .withMessage('올바른 휴대폰 번호 형식이 아닙니다 (010-xxxx-xxxx)'),

  body('userPin')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('PIN은 4자리 숫자여야 합니다'),

  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('유효한 이메일 형식이 아닙니다')
    .normalizeEmail(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('활성 상태는 boolean 값이어야 합니다'),

  // role 변경 방지
  body('role')
    .not()
    .exists()
    .withMessage('역할은 변경할 수 없습니다'),
];

// 직원 상태 변경 검증
export const validateStaffStatusToggle = [
  body('isActive')
    .notEmpty()
    .withMessage('활성 상태를 지정해주세요')
    .isBoolean()
    .withMessage('활성 상태는 boolean 값이어야 합니다'),
];

// 직원 ID 파라미터 검증
export const validateStaffId = [
  param('id')
    .notEmpty()
    .withMessage('직원 ID를 입력해주세요')
    .isUUID()
    .withMessage('유효한 직원 ID 형식이 아닙니다'),
];

// 직원 목록 조회 쿼리 검증
export const validateStaffListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('페이지 크기는 1-100 사이여야 합니다')
    .toInt(),

  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('검색어는 100자 이하여야 합니다')
    .trim(),

  query('role')
    .optional()
    .isIn(['owner', 'staff'])
    .withMessage('역할은 owner 또는 staff여야 합니다'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('활성 상태는 boolean 값이어야 합니다')
    .toBoolean(),

  query('sortBy')
    .optional()
    .isIn(['name', 'phone', 'role', 'created_at', 'updated_at', 'last_login_at'])
    .withMessage('정렬 기준이 올바르지 않습니다'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('정렬 순서는 asc 또는 desc여야 합니다'),
];

// 활동 로그 조회 쿼리 검증
export const validateActivityLogsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('페이지 크기는 1-100 사이여야 합니다')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['timestamp', 'action'])
    .withMessage('정렬 기준이 올바르지 않습니다'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('정렬 순서는 asc 또는 desc여야 합니다'),

  query('action')
    .optional()
    .isIn(['login', 'logout', 'order_create', 'order_cancel', 'payment_process', 'menu_update', 'table_status_change'])
    .withMessage('유효하지 않은 액션입니다'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 유효한 ISO 8601 형식이어야 합니다')
    .toDate(),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 유효한 ISO 8601 형식이어야 합니다')
    .toDate(),
];

// 빈 문자열을 null로 정규화
export const normalizeStaffFields = [
  body('email').customSanitizer((value) => {
    return value === '' ? null : value;
  }),

  body('name').customSanitizer((value) => {
    return typeof value === 'string' ? value.trim() : value;
  }),

  body('phone').customSanitizer((value) => {
    return typeof value === 'string' ? value.replace(/\s|-/g, '') : value;
  }),
];

// PIN 보안 검증 (추가 보안 규칙)
export const validatePinSecurity = [
  body('userPin')
    .custom((value) => {
      if (!value) return true; // optional일 때

      // 연속된 숫자 체크 (1234, 4321 등)
      if (/(\d)\1{3}/.test(value)) {
        throw new Error('PIN에 같은 숫자를 4번 연속 사용할 수 없습니다');
      }

      // 순차 숫자 체크
      const sequential = ['0123', '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210'];
      if (sequential.includes(value)) {
        throw new Error('PIN에 연속된 숫자를 사용할 수 없습니다');
      }

      // 너무 간단한 PIN 체크
      const simplePins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'];
      if (simplePins.includes(value)) {
        throw new Error('너무 단순한 PIN입니다. 다른 PIN을 선택해주세요');
      }

      return true;
    })
];

// 전화번호 정규화
export const normalizePhoneNumber = [
  body('phone').customSanitizer((value) => {
    if (typeof value === 'string') {
      // 하이픈과 공백 제거 후 표준 형식으로 변환
      const cleaned = value.replace(/\s|-/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('010')) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
      }
    }
    return value;
  })
];