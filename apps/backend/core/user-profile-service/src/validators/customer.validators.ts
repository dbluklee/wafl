import { body } from 'express-validator';

export const customerValidators = {
  create: [
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('고객명은 1~50자 사이여야 합니다.'),

    body('phone')
      .optional()
      .isMobilePhone('ko-KR')
      .withMessage('올바른 휴대폰 번호를 입력해주세요.'),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('올바른 이메일 주소를 입력해주세요.'),

    body('birthday')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('올바른 생년월일을 입력해주세요.'),

    body('notes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('메모는 500자 이내로 입력해주세요.'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('태그는 배열 형태여야 합니다.')
      .custom((tags) => {
        if (tags.length > 10) {
          throw new Error('태그는 최대 10개까지 가능합니다.');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 20) {
            throw new Error('각 태그는 20자 이내의 문자열이어야 합니다.');
          }
        }
        return true;
      })
  ],

  update: [
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('고객명은 1~50자 사이여야 합니다.'),

    body('phone')
      .optional()
      .isMobilePhone('ko-KR')
      .withMessage('올바른 휴대폰 번호를 입력해주세요.'),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('올바른 이메일 주소를 입력해주세요.'),

    body('birthday')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('올바른 생년월일을 입력해주세요.'),

    body('notes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('메모는 500자 이내로 입력해주세요.'),

    body('tags')
      .optional()
      .isArray()
      .withMessage('태그는 배열 형태여야 합니다.')
      .custom((tags) => {
        if (tags.length > 10) {
          throw new Error('태그는 최대 10개까지 가능합니다.');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 20) {
            throw new Error('각 태그는 20자 이내의 문자열이어야 합니다.');
          }
        }
        return true;
      }),

    body('membershipLevel')
      .optional()
      .isIn(['bronze', 'silver', 'gold', 'vip'])
      .withMessage('올바른 멤버십 등급을 선택해주세요.')
  ],

  updateTags: [
    body('tags')
      .isArray()
      .withMessage('태그는 배열 형태여야 합니다.')
      .custom((tags) => {
        if (tags.length > 10) {
          throw new Error('태그는 최대 10개까지 가능합니다.');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.length > 20) {
            throw new Error('각 태그는 20자 이내의 문자열이어야 합니다.');
          }
        }
        return true;
      })
  ]
};