import { PrismaClient } from '../../../../../node_modules/@prisma/client';
import config from '../config';

const prisma = new PrismaClient();

// 포인트 적립 규칙 (더미)
const POINT_RULES = {
  EARN_RATE: 0.05,        // 5% 적립
  MIN_AMOUNT: 10000,      // 최소 적립 금액
  MAX_POINTS: 1000000,    // 최대 보유 포인트
  EXPIRY_DAYS: 365,       // 포인트 유효기간
};

interface PointsHistoryFilters {
  customerId: string;
  storeId: string;
  page: number;
  limit: number;
  type?: string;
}

interface EarnPointsData {
  customerId: string;
  storeId: string;
  orderId?: string;
  amount: number;
  description?: string;
}

interface RedeemPointsData {
  customerId: string;
  storeId: string;
  orderId?: string;
  points: number;
  description?: string;
}

interface AdjustPointsData {
  customerId: string;
  storeId: string;
  adminId: string;
  points: number;
  type: 'increase' | 'decrease';
  description: string;
}

export class PointsService {
  static async getPointsHistory(filters: PointsHistoryFilters) {
    // 현재 스키마에 포인트 테이블이 없으므로 더미 응답
    return {
      history: [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  static async earnPoints(data: EarnPointsData) {
    // 고객 존재 여부 확인
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    return {
      success: true,
      data: {
        earnedPoints: Math.floor(data.amount * POINT_RULES.EARN_RATE),
        customer: {
          id: customer.id,
          sessionId: customer.sessionId
        }
      }
    };
  }

  static async redeemPoints(data: RedeemPointsData) {
    // 고객 존재 여부 확인
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    return {
      success: true,
      message: '포인트 시스템이 현재 구현되지 않았습니다.',
      data: {
        customer: {
          id: customer.id,
          sessionId: customer.sessionId
        }
      }
    };
  }

  static async getPointsBalance(customerId: string, storeId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    return {
      customerId,
      currentPoints: 0,
      membershipLevel: 'bronze',
      expiringPoints: 0,
      membershipBenefits: {
        level: 'bronze',
        minSpent: 0,
        earnRate: 0.03,
        benefits: ['기본 포인트 적립']
      }
    };
  }

  static async adjustPoints(data: AdjustPointsData) {
    // 고객 존재 여부 확인
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    return {
      success: true,
      message: '포인트 조정 기능이 현재 구현되지 않았습니다.',
      data: {
        customer: {
          id: customer.id,
          sessionId: customer.sessionId
        }
      }
    };
  }

  static async getMembershipInfo(customerId: string, storeId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          select: {
            totalAmount: true
          }
        }
      }
    });

    if (!customer) {
      throw new Error('고객을 찾을 수 없습니다.');
    }

    // 주문 금액을 기반으로 임시 멤버십 정보 계산
    const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    let membershipLevel = 'bronze';

    if (totalSpent >= 3000000) membershipLevel = 'vip';
    else if (totalSpent >= 1000000) membershipLevel = 'gold';
    else if (totalSpent >= 500000) membershipLevel = 'silver';

    const membershipLevels = {
      bronze: { minSpent: 0, earnRate: 0.03, benefits: ['기본 포인트 적립'] },
      silver: { minSpent: 500000, earnRate: 0.05, benefits: ['포인트 적립률 향상', '생일 쿠폰'] },
      gold: { minSpent: 1000000, earnRate: 0.07, benefits: ['포인트 적립률 향상', '생일 쿠폰', '우선 예약'] },
      vip: { minSpent: 3000000, earnRate: 0.10, benefits: ['최고 포인트 적립률', '생일 쿠폰', '우선 예약', 'VIP 이벤트'] }
    };

    return {
      customer: {
        id: customer.id,
        sessionId: customer.sessionId,
        membershipLevel,
        totalSpent,
        visitCount: customer.orders.length,
        points: 0 // 포인트 테이블이 없으므로 0
      },
      currentBenefits: membershipLevels[membershipLevel as keyof typeof membershipLevels],
      nextLevel: membershipLevel === 'vip' ? null :
        membershipLevel === 'gold' ? 'vip' :
        membershipLevel === 'silver' ? 'gold' : 'silver',
      nextLevelRequirement: membershipLevel === 'vip' ? 0 :
        membershipLevel === 'gold' ? Math.max(0, 3000000 - totalSpent) :
        membershipLevel === 'silver' ? Math.max(0, 1000000 - totalSpent) :
        Math.max(0, 500000 - totalSpent)
    };
  }

  static async expirePoints(storeId: string) {
    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    return {
      processedCount: 0,
      totalExpiredPoints: 0,
      results: []
    };
  }

  static async getPointsStats(storeId: string, period: string) {
    // 포인트 시스템이 구현되지 않은 상태이므로 더미 응답
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // 실제 고객 수 조회
    const totalCustomers = await prisma.customer.count();

    return {
      period,
      startDate,
      endDate: now,
      earned: {
        totalPoints: 0,
        count: 0
      },
      redeemed: {
        totalPoints: 0,
        count: 0
      },
      customers: {
        total: totalCustomers,
        active: 0,
        activeRate: 0
      }
    };
  }
}