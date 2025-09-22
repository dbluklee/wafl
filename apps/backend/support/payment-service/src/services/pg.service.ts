import { v4 as uuidv4 } from 'uuid';
import config from '@/config';
// import { paymentCache } from '@/utils/cache'; // TODO: 향후 캐싱 기능에 사용
import {
  IMockPGRequest,
  IMockPGResponse,
  IPGResponse,
  IPaymentRequest,
  PaymentServiceError,
} from '@/types';

export class PGService {
  private static instance: PGService;
  private failureCardNumbers = [
    '0000-0000-0000-0000',
    '1111-1111-1111-1111',
    '9999-9999-9999-9999',
  ];

  public static getInstance(): PGService {
    if (!PGService.instance) {
      PGService.instance = new PGService();
    }
    return PGService.instance;
  }

  async processCardPayment(request: IPaymentRequest): Promise<IPGResponse> {
    console.log('[PG Service] Processing card payment:', {
      orderId: request.orderId,
      amount: request.amount,
      method: request.method,
    });

    try {
      const mockRequest: IMockPGRequest = {
        merchantId: config.pg.merchantId,
        transactionId: uuidv4(),
        amount: request.amount,
        cardNumber: request.cardNumber || '',
        cardExpiryMonth: request.cardExpiryMonth || '',
        cardExpiryYear: request.cardExpiryYear || '',
        cardCvv: request.cardCvv || '',
        cardHolderName: request.cardHolderName || '',
        description: request.description || '',
      };

      await this.simulateNetworkDelay();

      const mockResponse = await this.mockPGAPICall(mockRequest);

      const pgResponse: IPGResponse = {
        success: mockResponse.success,
        transactionId: mockResponse.transactionId,
        message: mockResponse.message,
        rawResponse: mockResponse,
      };

      if (mockResponse.approvalNumber) {
        pgResponse.approvalNumber = mockResponse.approvalNumber;
      }
      if (mockResponse.errorCode) {
        pgResponse.errorCode = mockResponse.errorCode;
      }

      console.log('[PG Service] Card payment result:', {
        success: pgResponse.success,
        transactionId: pgResponse.transactionId,
        message: pgResponse.message,
      });

      return pgResponse;
    } catch (error) {
      console.error('[PG Service] Card payment error:', error);
      throw new PaymentServiceError(
        'PG service unavailable',
        503,
        'PG_SERVICE_ERROR',
        { originalError: error }
      );
    }
  }

  async processCashPayment(request: IPaymentRequest): Promise<IPGResponse> {
    console.log('[PG Service] Processing cash payment:', {
      orderId: request.orderId,
      amount: request.amount,
    });

    await this.simulateNetworkDelay(500);

    const pgResponse: IPGResponse = {
      success: true,
      transactionId: `CASH_${uuidv4()}`,
      message: 'Cash payment completed',
      rawResponse: {
        method: 'cash',
        timestamp: new Date(),
      },
    };
    pgResponse.approvalNumber = `CSH_${Date.now()}`;

    console.log('[PG Service] Cash payment completed:', pgResponse.transactionId);
    return pgResponse;
  }

  async processMobilePayment(request: IPaymentRequest): Promise<IPGResponse> {
    console.log('[PG Service] Processing mobile payment:', {
      orderId: request.orderId,
      amount: request.amount,
    });

    try {
      await this.simulateNetworkDelay(2000);

      const isSuccess = Math.random() > 0.1;

      const pgResponse: IPGResponse = {
        success: isSuccess,
        transactionId: `MOBILE_${uuidv4()}`,
        message: isSuccess ? 'Mobile payment completed' : 'Mobile payment failed - timeout',
        rawResponse: {
          method: 'mobile',
          provider: 'KakaoPay',
          timestamp: new Date(),
        },
      };

      if (isSuccess) {
        pgResponse.approvalNumber = `MOB_${Date.now()}`;
      } else {
        pgResponse.errorCode = 'MOBILE_TIMEOUT';
      }

      console.log('[PG Service] Mobile payment result:', {
        success: pgResponse.success,
        message: pgResponse.message,
      });

      return pgResponse;
    } catch (error) {
      console.error('[PG Service] Mobile payment error:', error);
      return {
        success: false,
        message: 'Mobile payment service error',
        errorCode: 'MOBILE_SERVICE_ERROR',
        rawResponse: { error: error },
      };
    }
  }

  async processRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<IPGResponse> {
    console.log('[PG Service] Processing refund:', {
      transactionId,
      amount,
      reason,
    });

    try {
      await this.simulateNetworkDelay(1500);

      const refundTransactionId = `REFUND_${uuidv4()}`;
      const isSuccess = Math.random() > 0.05;

      const pgResponse: IPGResponse = {
        success: isSuccess,
        transactionId: refundTransactionId,
        message: isSuccess ? 'Refund processed successfully' : 'Refund failed - insufficient balance',
        rawResponse: {
          originalTransactionId: transactionId,
          refundAmount: amount,
          reason,
          timestamp: new Date(),
        },
      };

      if (isSuccess) {
        pgResponse.approvalNumber = `REF_${Date.now()}`;
      } else {
        pgResponse.errorCode = 'INSUFFICIENT_BALANCE';
      }

      console.log('[PG Service] Refund result:', {
        success: pgResponse.success,
        transactionId: pgResponse.transactionId,
        message: pgResponse.message,
      });

      return pgResponse;
    } catch (error) {
      console.error('[PG Service] Refund error:', error);
      throw new PaymentServiceError(
        'Refund service unavailable',
        503,
        'REFUND_SERVICE_ERROR',
        { originalError: error }
      );
    }
  }

  async cancelPayment(transactionId: string): Promise<IPGResponse> {
    console.log('[PG Service] Cancelling payment:', transactionId);

    try {
      await this.simulateNetworkDelay(1000);

      const cancelTransactionId = `CANCEL_${uuidv4()}`;

      const pgResponse: IPGResponse = {
        success: true,
        transactionId: cancelTransactionId,
        approvalNumber: `CAN_${Date.now()}`,
        message: 'Payment cancelled successfully',
        rawResponse: {
          originalTransactionId: transactionId,
          timestamp: new Date(),
        },
      };

      console.log('[PG Service] Payment cancelled:', pgResponse.transactionId);
      return pgResponse;
    } catch (error) {
      console.error('[PG Service] Cancel error:', error);
      throw new PaymentServiceError(
        'Cancel service unavailable',
        503,
        'CANCEL_SERVICE_ERROR',
        { originalError: error }
      );
    }
  }

  private async mockPGAPICall(request: IMockPGRequest): Promise<IMockPGResponse> {
    const isFailureCard = this.failureCardNumbers.includes(request.cardNumber);
    const randomFailure = Math.random() < 0.02;

    if (isFailureCard || randomFailure) {
      return {
        success: false,
        transactionId: request.transactionId,
        message: isFailureCard ? 'Invalid card number' : 'Card processing failed',
        errorCode: isFailureCard ? 'INVALID_CARD' : 'PROCESSING_ERROR',
        timestamp: new Date(),
      };
    }

    if (request.amount <= 0) {
      return {
        success: false,
        transactionId: request.transactionId,
        message: 'Invalid amount',
        errorCode: 'INVALID_AMOUNT',
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      transactionId: request.transactionId,
      approvalNumber: `APP_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message: 'Payment completed successfully',
      timestamp: new Date(),
    };
  }

  private async simulateNetworkDelay(minMs: number = 800, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
  }

  validateExpiryDate(month: string, year: string): boolean {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) return false;

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  }

  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    return cleaned.replace(/(.{4})/g, '$1-').slice(0, -1);
  }

  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    if (cleaned.length < 8) return '****';

    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);

    return `${first4}${middle}${last4}`;
  }

  async getTransactionStatus(transactionId: string): Promise<{
    status: 'success' | 'failed' | 'pending' | 'not_found';
    message: string;
  }> {
    console.log('[PG Service] Checking transaction status:', transactionId);

    await this.simulateNetworkDelay(300, 800);

    if (transactionId.startsWith('INVALID_')) {
      return {
        status: 'not_found',
        message: 'Transaction not found',
      };
    }

    if (transactionId.startsWith('PENDING_')) {
      return {
        status: 'pending',
        message: 'Transaction is still processing',
      };
    }

    return {
      status: 'success',
      message: 'Transaction completed successfully',
    };
  }
}

export const pgService = PGService.getInstance();

console.log('[PG Service] Mock PG service initialized with test configuration');