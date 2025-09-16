import { Request, Response, NextFunction } from 'express';
import { placeService } from '../services/place.service';
import { IAuthRequest } from '../types';

export class PlaceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const places = await placeService.getAll(storeId);

      res.json({
        success: true,
        data: places
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { placeId } = req.params;

      const place = await placeService.getById(storeId, placeId);

      if (!place) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PLACE_NOT_FOUND',
            message: '장소를 찾을 수 없습니다'
          }
        });
      }

      res.json({
        success: true,
        data: place
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const place = await placeService.create(storeId, req.body);

      res.status(201).json({
        success: true,
        data: place
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { placeId } = req.params;

      const place = await placeService.update(storeId, placeId, req.body);

      res.json({
        success: true,
        data: place
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { placeId } = req.params;

      await placeService.delete(storeId, placeId);

      res.json({
        success: true,
        data: {
          message: '장소가 삭제되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const placeController = new PlaceController();