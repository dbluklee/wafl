import { body, param } from 'express-validator';

export const createPaymentValidation = [
  body('orderId')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),

  body('method')
    .isIn(['card', 'cash', 'mobile'])
    .withMessage('Payment method must be card, cash, or mobile'),

  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),

  body('cardNumber')
    .optional()
    .isString()
    .matches(/^[\d\s\-]+$/)
    .withMessage('Card number must contain only numbers, spaces, and dashes'),

  body('cardExpiryMonth')
    .optional()
    .isString()
    .matches(/^(0[1-9]|1[0-2])$/)
    .withMessage('Card expiry month must be 01-12'),

  body('cardExpiryYear')
    .optional()
    .isString()
    .matches(/^\d{2}$/)
    .withMessage('Card expiry year must be 2 digits'),

  body('cardCvv')
    .optional()
    .isString()
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3-4 digits'),

  body('cardHolderName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Card holder name must be 1-100 characters'),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),
];

export const updatePaymentStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Payment ID must be a valid UUID'),

  body('status')
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled'])
    .withMessage('Status must be pending, processing, completed, failed, or cancelled'),
];

export const paymentIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Payment ID must be a valid UUID'),
];

export const orderIdValidation = [
  param('orderId')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),
];