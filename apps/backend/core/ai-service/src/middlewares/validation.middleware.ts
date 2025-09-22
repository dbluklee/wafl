import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import logger from '@/utils/logger';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      endpoint: req.originalUrl,
      method: req.method,
      errors: errors.array()
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }

  next();
};

export default { validateRequest };