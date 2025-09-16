import { Response, NextFunction } from 'express';
import { paymentService } from '@/services/payment.service.simple';
import {
  IAuthenticatedRequest,
  IApiResponse,
  IPaymentRequest,
  IPaymentResponse,
  PaymentServiceError,
} from '@/types';

export class PaymentController {
  async createPayment(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse<IPaymentResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        throw new PaymentServiceError('Store ID is required', 400, 'STORE_ID_REQUIRED');
      }

      const paymentRequest: IPaymentRequest = {
        orderId: req.body.orderId,
        method: req.body.method,
        amount: req.body.amount,
        cardNumber: req.body.cardNumber,
        cardExpiryMonth: req.body.cardExpiryMonth,
        cardExpiryYear: req.body.cardExpiryYear,
        cardCvv: req.body.cardCvv,
        cardHolderName: req.body.cardHolderName,
        description: req.body.description,
        metadata: req.body.metadata,
      };

      const payment = await paymentService.createPayment(paymentRequest, storeId);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse<IPaymentResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        throw new PaymentServiceError('Store ID is required', 400, 'STORE_ID_REQUIRED');
      }

      const paymentId = req.params.id;
      const payment = await paymentService.getPayment(paymentId, storeId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentStatus(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse<IPaymentResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        throw new PaymentServiceError('Store ID is required', 400, 'STORE_ID_REQUIRED');
      }

      const paymentId = req.params.id;
      const { status } = req.body;

      const payment = await paymentService.updatePaymentStatus(paymentId, status, storeId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelPayment(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse<IPaymentResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        throw new PaymentServiceError('Store ID is required', 400, 'STORE_ID_REQUIRED');
      }

      const paymentId = req.params.id;
      const payment = await paymentService.cancelPayment(paymentId, storeId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async handlePGCallback(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('[Payment Controller] PG callback received:', req.body);

      res.status(200).json({
        success: true,
        data: {
          message: 'Callback processed',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByOrder(
    req: IAuthenticatedRequest,
    res: Response<IApiResponse<IPaymentResponse[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        throw new PaymentServiceError('Store ID is required', 400, 'STORE_ID_REQUIRED');
      }

      const orderId = req.params.orderId;
      const payments = await paymentService.getPaymentsByOrder(orderId, storeId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();