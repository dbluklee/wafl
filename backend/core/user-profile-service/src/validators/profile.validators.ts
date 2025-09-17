import { body } from 'express-validator';

// 프로필 업데이트 검증
export const validateProfileUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('이름은 한글, 영문, 공백만 허용됩니다'),

  body('email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('유효한 이메일 형식이 아닙니다')
    .normalizeEmail(),

  body('settings.notifications')
    .optional()
    .isBoolean()
    .withMessage('알림 설정은 boolean 값이어야 합니다'),

  body('settings.soundAlert')
    .optional()
    .isBoolean()
    .withMessage('사운드 알림 설정은 boolean 값이어야 합니다'),

  body('settings.autoLogout')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('자동 로그아웃 시간은 5분에서 8시간(480분) 사이여야 합니다'),

  body('settings.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('테마는 light 또는 dark여야 합니다'),

  body('settings.language')
    .optional()
    .isIn(['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'])
    .withMessage('지원하지 않는 언어입니다'),

  body('settings.timezone')
    .optional()
    .custom((value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        throw new Error('유효하지 않은 타임존입니다');
      }
    })
];

// 설정만 업데이트 검증
export const validateSettingsUpdate = [
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('알림 설정은 boolean 값이어야 합니다'),

  body('soundAlert')
    .optional()
    .isBoolean()
    .withMessage('사운드 알림 설정은 boolean 값이어야 합니다'),

  body('autoLogout')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('자동 로그아웃 시간은 5분에서 8시간(480분) 사이여야 합니다'),

  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('테마는 light 또는 dark여야 합니다'),

  body('language')
    .optional()
    .isIn(['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'])
    .withMessage('지원하지 않는 언어입니다'),

  body('timezone')
    .optional()
    .custom((value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return true;
      } catch {
        throw new Error('유효하지 않은 타임존입니다');
      }
    })
];

// 비밀번호(PIN) 변경 검증
export const validatePasswordChange = [
  body('currentPin')
    .notEmpty()
    .withMessage('현재 PIN을 입력해주세요')
    .matches(/^\d{4}$/)
    .withMessage('PIN은 4자리 숫자여야 합니다'),

  body('newPin')
    .notEmpty()
    .withMessage('새 PIN을 입력해주세요')
    .matches(/^\d{4}$/)
    .withMessage('새 PIN은 4자리 숫자여야 합니다')
    .custom((value, { req }) => {
      if (value === req.body.currentPin) {
        throw new Error('새 PIN은 현재 PIN과 달라야 합니다');
      }
      return true;
    })
];

// 프로필 이미지 업로드 검증
export const validateProfileImageUpload = [
  // 파일 검증은 multer 미들웨어에서 처리
  // 추가적인 비즈니스 로직 검증 가능
];

// 공통 검증: 빈 문자열을 null로 변환
export const normalizeEmptyStrings = [
  body('email').customSanitizer((value) => {
    return value === '' ? null : value;
  }),

  body('profileImage').customSanitizer((value) => {
    return value === '' ? null : value;
  })
];