import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', error);

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다',
        details: error.message
      }
    });
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '데이터베이스 오류가 발생했습니다',
        details: error.message
      }
    });
  }

  // File upload errors
  if (error.message.includes('파일 형식')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_TYPE_ERROR',
        message: error.message
      }
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버에서 오류가 발생했습니다'
    }
  });
};