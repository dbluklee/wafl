import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.name === 'ValidationError' ? 400 : 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.name || 'INTERNAL_ERROR',
      message: err.message || '서버 오류가 발생했습니다',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};