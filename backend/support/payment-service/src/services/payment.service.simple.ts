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
  PaymentServiceError,
  IPGResponse,
} from '@/types';

const mockPayments = new Map<string, IPaymentResponse>();

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
      this.validatePaymentRequest(request);

      const paymentId = uuidv4();
      const payment: IPaymentResponse = {
        id: paymentId,
        orderId: request.orderId,
        transactionId: '',
        method: request.method,
        amount: request.amount,
        status: 'pending',
        createdAt: new Date(),
      };

      mockPayments.set(paymentId, payment);
      paymentCache.setPayment(paymentId, payment, config.cache.ttlMedium);

      const processedPayment = await this.processPaymentWithPG(payment, request);
      return processedPayment;
    } catch (error) {
      console.error('[Payment Service] Payment creation failed:', error);

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Failed to create payment',
        500,
        'PAYMENT_CREATION_FAILED'
      );
    }
  }

  async getPayment(paymentId: string, storeId: string): Promise<IPaymentResponse> {
    console.log('[Payment Service] Getting payment:', paymentId);

    const cached = paymentCache.getPayment(paymentId);
    if (cached) {
      return cached;
    }

    const payment = mockPayments.get(paymentId);
    if (!payment) {
      throw new PaymentServiceError(
        'Payment not found',
        404,
        'PAYMENT_NOT_FOUND'
      );
    }

    paymentCache.setPayment(paymentId, payment, config.cache.ttlMedium);
    return payment;
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
    });

    const payment = await this.getPayment(paymentId, storeId);

    const updatedPayment: IPaymentResponse = {
      ...payment,
      status,
      pgResponse,
      completedAt: status === 'completed' ? new Date() : payment.completedAt,
    };

    if (pgResponse?.transactionId) {
      updatedPayment.transactionId = pgResponse.transactionId;
    }

    mockPayments.set(paymentId, updatedPayment);
    paymentCache.setPayment(paymentId, updatedPayment, config.cache.ttlMedium);

    return updatedPayment;
  }

  async cancelPayment(paymentId: string, storeId: string): Promise<IPaymentResponse> {
    console.log('[Payment Service] Cancelling payment:', paymentId);

    const payment = await this.getPayment(paymentId, storeId);

    if (!['pending', 'processing'].includes(payment.status)) {
      throw new PaymentServiceError(
        `Cannot cancel payment with status: ${payment.status}`,
        400,
        'INVALID_PAYMENT_STATUS'
      );
    }

    return this.updatePaymentStatus(paymentId, 'cancelled', storeId);
  }

  async getPaymentsByOrder(orderId: string, storeId: string): Promise<IPaymentResponse[]> {
    console.log('[Payment Service] Getting payments for order:', orderId);

    const payments = Array.from(mockPayments.values())
      .filter(payment => payment.orderId === orderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return payments;
  }

  private async processPaymentWithPG(
    payment: IPaymentResponse,
    request: IPaymentRequest
  ): Promise<IPaymentResponse> {
    console.log('[Payment Service] Processing payment with PG:', payment.id);

    try {
      await this.updatePaymentStatus(payment.id, 'processing', '');

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
      return await this.updatePaymentStatus(payment.id, finalStatus, '', pgResponse);
    } catch (error) {
      console.error('[Payment Service] PG processing failed:', error);

      try {
        await this.updatePaymentStatus(payment.id, 'failed', '');
      } catch (updateError) {
        console.error('[Payment Service] Failed to update payment status to failed:', updateError);
      }

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        'Payment processing failed',
        500,
        'PG_PROCESSING_FAILED'
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
}

export const paymentService = PaymentService.getInstance();

console.log('[Payment Service] Simple payment service initialized (Mock mode)');