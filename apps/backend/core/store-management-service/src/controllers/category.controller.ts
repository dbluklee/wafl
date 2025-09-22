import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { IAuthRequest } from '../types';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      const categories = await categoryService.getAll(storeId);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { categoryId } = req.params;

      const category = await categoryService.getById(storeId, categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: '카테고리를 찾을 수 없습니다'
          }
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;

      // 프론트엔드에서 'order' 필드를 보내는 경우 'sortOrder'로 변환
      const categoryData = { ...req.body };
      if (categoryData.order !== undefined) {
        categoryData.sortOrder = categoryData.order;
        delete categoryData.order;
      }

      const category = await categoryService.create(storeId, categoryData);

      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { categoryId } = req.params;

      const category = await categoryService.update(storeId, categoryId, req.body);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { categoryId } = req.params;

      await categoryService.delete(storeId, categoryId);

      res.json({
        success: true,
        data: {
          message: '카테고리가 삭제되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as IAuthRequest;
      const storeId = authReq.user!.storeId;
      const { orders } = req.body;

      await categoryService.reorder(storeId, orders);

      res.json({
        success: true,
        data: {
          message: '카테고리 순서가 변경되었습니다'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();