import { Request, Response, NextFunction } from 'express';
import { prisma } from '@shared/database';
import { IAuthRequest } from '../types';

export const storeContext = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as IAuthRequest;

    if (!authReq.user?.storeId) {
      return next();
    }

    const store = await prisma.store.findUnique({
      where: { id: authReq.user.storeId }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STORE_001',
          message: '매장 정보를 찾을 수 없습니다'
        }
      });
    }

    authReq.store = store;
    next();
  } catch (error) {
    next(error);
  }
};