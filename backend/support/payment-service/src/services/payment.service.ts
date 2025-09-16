import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import config from '@/config';
import { paymentCache } from '@/utils/cache';
import { pgService } from './pg.service';
import {
  IPaymentRequest,
  IPaymentResponse,
  TPaymentMethod,
  TPaymentStatus,
  IOrderInfo,
  PaymentServiceError,
  IPGResponse,
} from '@/types';

const prisma = new PrismaClient();

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createPayment(request: IPaymentRequest, storeId: string): Promise<IPaymentResponse> {
    console.log('[Payment Service] Creating payment:', {
      orderId: request.orderId,
      method: request.method,
      amount: request.amount,
      storeId,
    });

    try {
      const orderInfo = await this.validateOrder(request.orderId, storeId);

      if (orderInfo.totalAmount !== request.amount) {
        throw new PaymentServiceError(
          `Payment amount ${request.amount} does not match order amount ${orderInfo.totalAmount}`,
          400,
          'AMOUNT_MISMATCH'
        );
      }

      this.validatePaymentRequest(request);

      const payment = await prisma.payment.create({
        data: {
          id: uuidv4(),
          orderId: request.orderId,
          transactionId: '',
          method: request.method,
          amount: request.amount,
          status: 'pending',
          cardReaderId: request.metadata?.cardReaderId,
          createdAt: new Date(),
        },
      });

      const paymentResponse: IPaymentResponse = {
        id: payment.id,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        method: payment.method as TPaymentMethod,
        amount: payment.amount,
        status: payment.status as TPaymentStatus,
        createdAt: payment.createdAt,
      };

      paymentCache.setPayment(payment.id, paymentResponse, config.cache.ttlMedium);

      const processedPayment = await this.processPaymentWithPG(payment.id, request);

      console.log('[Payment Service] Payment created and processed:', {
        paymentId: processedPayment.id,
        status: processedPayment.status,
        transactionId: processedPayment.transactionId,
      });

      return processedPayment;
    } catch (error) {
      console.error('[Payment Service] Payment creation failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Failed to create payment',
        500,
        'PAYMENT_CREATION_FAILED',
        { originalError: error }
      );
    }
  }

  async getPayment(paymentId: string, storeId: string): Promise<IPaymentResponse> {
    console.log('[Payment Service] Getting payment:', paymentId);

    try {
      const cached = paymentCache.getPayment(paymentId);
      if (cached) {
        console.log('[Payment Service] Payment found in cache');
        return cached;
      }

      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          order: {
            storeId: storeId,
          },
        },
      });

      if (!payment) {
        throw new PaymentServiceError(
          'Payment not found',
          404,
          'PAYMENT_NOT_FOUND'
        );
      }

      const paymentResponse: IPaymentResponse = {
        id: payment.id,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        method: payment.method as TPaymentMethod,
        amount: payment.amount,
        status: payment.status as TPaymentStatus,
        pgResponse: payment.pgResponse as IPGResponse,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || undefined,
      };

      paymentCache.setPayment(payment.id, paymentResponse, config.cache.ttlMedium);
      return paymentResponse;
    } catch (error) {
      console.error('[Payment Service] Get payment failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Failed to get payment',
        500,
        'PAYMENT_RETRIEVAL_FAILED'
      );
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: TPaymentStatus,
    storeId: string,
    pgResponse?: IPGResponse
  ): Promise<IPaymentResponse> {
    console.log('[Payment Service] Updating payment status:', {
      paymentId,
      status,
      hasResponse: !!pgResponse,
    });

    try {
      const existingPayment = await this.getPayment(paymentId, storeId);

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (pgResponse) {
        updateData.pgResponse = pgResponse;
        updateData.transactionId = pgResponse.transactionId || existingPayment.transactionId;
      }

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
      });

      const paymentResponse: IPaymentResponse = {
        id: updatedPayment.id,
        orderId: updatedPayment.orderId,
        transactionId: updatedPayment.transactionId,
        method: updatedPayment.method as TPaymentMethod,
        amount: updatedPayment.amount,
        status: updatedPayment.status as TPaymentStatus,
        pgResponse: updatedPayment.pgResponse as IPGResponse,
        createdAt: updatedPayment.createdAt,
        completedAt: updatedPayment.completedAt || undefined,
      };

      paymentCache.setPayment(paymentId, paymentResponse, config.cache.ttlMedium);

      if (status === 'completed') {
        await this.notifyOrderService(paymentResponse);
        await this.notifyDashboardService(paymentResponse);
      }

      console.log('[Payment Service] Payment status updated:', {
        paymentId,
        newStatus: status,
      });

      return paymentResponse;
    } catch (error) {
      console.error('[Payment Service] Update payment status failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Failed to update payment status',
        500,
        'PAYMENT_UPDATE_FAILED'
      );
    }
  }

  async cancelPayment(paymentId: string, storeId: string): Promise<IPaymentResponse> {
    console.log('[Payment Service] Cancelling payment:', paymentId);

    try {
      const payment = await this.getPayment(paymentId, storeId);

      if (!['pending', 'processing'].includes(payment.status)) {
        throw new PaymentServiceError(
          `Cannot cancel payment with status: ${payment.status}`,
          400,
          'INVALID_PAYMENT_STATUS'
        );
      }

      if (payment.transactionId && payment.status === 'processing') {
        const pgResponse = await pgService.cancelPayment(payment.transactionId);

        if (!pgResponse.success) {
          throw new PaymentServiceError(
            'PG cancellation failed',
            400,
            'PG_CANCEL_FAILED',
            { pgResponse }
          );
        }
      }

      const cancelledPayment = await this.updatePaymentStatus(
        paymentId,
        'cancelled',
        storeId,
        payment.transactionId ? {
          success: true,
          transactionId: `CANCEL_${payment.transactionId}`,
          message: 'Payment cancelled',
        } : undefined
      );

      console.log('[Payment Service] Payment cancelled:', paymentId);
      return cancelledPayment;
    } catch (error) {
      console.error('[Payment Service] Cancel payment failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Failed to cancel payment',
        500,
        'PAYMENT_CANCEL_FAILED'
      );
    }
  }

  async getPaymentsByOrder(orderId: string, storeId: string): Promise<IPaymentResponse[]> {
    console.log('[Payment Service] Getting payments for order:', orderId);

    try {
      const payments = await prisma.payment.findMany({
        where: {
          orderId,
          order: {
            storeId: storeId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return payments.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        method: payment.method as TPaymentMethod,
        amount: payment.amount,
        status: payment.status as TPaymentStatus,
        pgResponse: payment.pgResponse as IPGResponse,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || undefined,
      }));
    } catch (error) {
      console.error('[Payment Service] Get payments by order failed:', error);
      throw new PaymentServiceError(
        'Failed to get payments by order',
        500,
        'PAYMENTS_RETRIEVAL_FAILED'
      );
    }
  }

  private async processPaymentWithPG(
    paymentId: string,
    request: IPaymentRequest
  ): Promise<IPaymentResponse> {
    console.log('[Payment Service] Processing payment with PG:', paymentId);

    try {
      await this.updatePaymentStatus(paymentId, 'processing', '');

      let pgResponse: IPGResponse;

      switch (request.method) {
        case 'card':
          pgResponse = await pgService.processCardPayment(request);
          break;
        case 'cash':
          pgResponse = await pgService.processCashPayment(request);
          break;
        case 'mobile':
          pgResponse = await pgService.processMobilePayment(request);
          break;
        default:
          throw new PaymentServiceError(
            `Unsupported payment method: ${request.method}`,
            400,
            'UNSUPPORTED_PAYMENT_METHOD'
          );
      }

      const finalStatus: TPaymentStatus = pgResponse.success ? 'completed' : 'failed';
      const updatedPayment = await this.updatePaymentStatus(
        paymentId,
        finalStatus,
        '',
        pgResponse
      );

      return updatedPayment;
    } catch (error) {
      console.error('[Payment Service] PG processing failed:', error);

      try {
        await this.updatePaymentStatus(paymentId, 'failed', '');
      } catch (updateError) {
        console.error('[Payment Service] Failed to update payment status to failed:', updateError);
      }

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Payment processing failed',
        500,
        'PG_PROCESSING_FAILED',
        { originalError: error }
      );
    }
  }

  private async validateOrder(orderId: string, storeId: string): Promise<IOrderInfo> {
    console.log('[Payment Service] Validating order:', orderId);

    try {
      const response = await axios.get(
        `${config.services.order}/api/v1/orders/${orderId}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new PaymentServiceError(
          'Order not found',
          404,
          'ORDER_NOT_FOUND'
        );
      }

      const orderInfo: IOrderInfo = response.data.data;

      if (orderInfo.storeId !== storeId) {
        throw new PaymentServiceError(
          'Order does not belong to this store',
          403,
          'ORDER_STORE_MISMATCH'
        );
      }

      if (!['confirmed', 'cooking'].includes(orderInfo.status)) {
        throw new PaymentServiceError(
          `Cannot pay for order with status: ${orderInfo.status}`,
          400,
          'INVALID_ORDER_STATUS'
        );
      }

      return orderInfo;
    } catch (error) {
      console.error('[Payment Service] Order validation failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new PaymentServiceError(
            'Order service unavailable',
            503,
            'ORDER_SERVICE_UNAVAILABLE'
          );
        }

        if (error.response?.status === 404) {
          throw new PaymentServiceError(
            'Order not found',
            404,
            'ORDER_NOT_FOUND'
          );
        }
      }

      throw new PaymentServiceError(
        'Failed to validate order',
        500,
        'ORDER_VALIDATION_FAILED'
      );
    }
  }

  private validatePaymentRequest(request: IPaymentRequest): void {
    if (request.amount <= 0) {
      throw new PaymentServiceError(
        'Payment amount must be greater than 0',
        400,
        'INVALID_AMOUNT'
      );
    }

    if (request.method === 'card') {
      if (!request.cardNumber || !pgService.validateCardNumber(request.cardNumber)) {
        throw new PaymentServiceError(
          'Invalid card number',
          400,
          'INVALID_CARD_NUMBER'
        );
      }

      if (!request.cardExpiryMonth || !request.cardExpiryYear ||
          !pgService.validateExpiryDate(request.cardExpiryMonth, request.cardExpiryYear)) {
        throw new PaymentServiceError(
          'Invalid card expiry date',
          400,
          'INVALID_CARD_EXPIRY'
        );
      }

      if (!request.cardCvv || !pgService.validateCVV(request.cardCvv)) {
        throw new PaymentServiceError(
          'Invalid CVV',
          400,
          'INVALID_CVV'
        );
      }
    }
  }

  private async notifyOrderService(payment: IPaymentResponse): Promise<void> {
    try {
      console.log('[Payment Service] Notifying order service of payment completion:', payment.id);

      await axios.patch(
        `${config.services.order}/api/v1/orders/${payment.orderId}/status`,
        {
          status: 'paid',
          paymentId: payment.id,
          paymentMethod: payment.method,
          paidAmount: payment.amount,
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[Payment Service] Order service notified successfully');
    } catch (error) {
      console.error('[Payment Service] Failed to notify order service:', error);
    }
  }

  private async notifyDashboardService(payment: IPaymentResponse): Promise<void> {
    try {
      console.log('[Payment Service] Notifying dashboard service of payment completion:', payment.id);

      await axios.post(
        `${config.services.dashboard}/api/v1/dashboard/logs`,
        {
          action: 'payment_completed',
          entityType: 'payment',
          entityId: payment.id,
          data: {
            orderId: payment.orderId,
            method: payment.method,
            amount: payment.amount,
            transactionId: payment.transactionId,
          },
          metadata: {
            source: 'payment-service',
          },
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[Payment Service] Dashboard service notified successfully');
    } catch (error) {
      console.error('[Payment Service] Failed to notify dashboard service:', error);
    }
  }
}

export const paymentService = PaymentService.getInstance();

console.log('[Payment Service] Payment service initialized');