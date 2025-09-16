import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';
import { IAuthRequest } from '../types';

export class MenuController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      // 쿼리 파라미터
      const filters = {
        categoryId: req.query.categoryId as string,
        available: req.query.available ? req.query.available === 'true' : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await menuService.getAll(storeId, filters, pagination);

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { menuId } = req.params;

      const menu = await menuService.getById(storeId, menuId);

      if (!menu) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MENU_NOT_FOUND',
            message: '메뉴를 찾을 수 없습니다'
          }
        });
      }

      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const menu = await menuService.create(storeId, req.body);

      res.status(201).json({
        success: true,
        data: menu
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { menuId } = req.params;

      const menu = await menuService.update(storeId, menuId, req.body);

      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { menuId } = req.params;

      const menu = await menuService.updateAvailability(storeId, menuId, req.body);

      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { menuId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: '이미지 파일이 필요합니다'
          }
        });
      }

      const imageUrl = await menuService.uploadImage(storeId, menuId, req.file);

      res.json({
        success: true,
        data: { imageUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { menuId } = req.params;

      await menuService.delete(storeId, menuId);

      res.json({
        success: true,
        data: {
          message: '메뉴가 삭제되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { updates } = req.body;

      await menuService.bulkUpdateStock(storeId, updates);

      res.json({
        success: true,
        data: {
          message: '재고가 업데이트되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const menuController = new MenuController();