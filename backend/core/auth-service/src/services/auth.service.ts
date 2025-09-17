import bcrypt from 'bcrypt';
import { prisma } from '@shared/database';
import { jwtUtils } from '../utils/jwt';
import { smsUtils } from '../utils/sms';
import { businessUtils } from '../utils/business';
import { sessionStore, refreshTokenStore } from '../config/memory-store';
import {
  IPinLoginRequest,
  IMobileLoginRequest,
  IStoreRegisterRequest,
  ICustomerSessionRequest,
  IAuthResponse
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  // PIN 로그인
  async loginWithPin(data: IPinLoginRequest): Promise<IAuthResponse> {
    const store = await prisma.store.findUnique({
      where: { storeCode: parseInt(data.storeCode) }
    });

    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    const user = await prisma.user.findFirst({
      where: {
        storeId: store.id,
        userPin: data.userPin,
        deletedAt: null
      }
    });

    if (!user) {
      throw new Error('잘못된 PIN 번호입니다.');
    }

    // Password 검증 (password가 제공된 경우)
    if (data.password && user.password) {
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('잘못된 비밀번호입니다.');
      }
    } else if (data.password && !user.password) {
      throw new Error('해당 사용자는 비밀번호 로그인을 지원하지 않습니다.');
    }

    // JWT 토큰 생성
    const { accessToken, refreshToken } = await jwtUtils.generateTokenPair({
      userId: user.id,
      storeId: store.id,
      role: user.role as 'owner' | 'staff'
    });

    // 마지막 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // 세션 저장
    await sessionStore.set(user.id, {
      userId: user.id,
      storeId: store.id,
      role: user.role,
      name: user.name
    });

    return {
      success: true,
      data: {
        userId: user.id,
        storeId: store.id,
        storeCode: store.storeCode,
        role: user.role,
        name: user.name,
        accessToken,
        refreshToken
      }
    };
  }

  // 모바일 인증 로그인
  async loginWithMobile(data: IMobileLoginRequest): Promise<IAuthResponse> {
    // SMS 인증 확인
    const isVerified = await smsUtils.verifyCode(data.phone, data.verificationCode);

    if (!isVerified) {
      throw new Error('인증번호가 올바르지 않습니다.');
    }

    const user = await prisma.user.findFirst({
      where: {
        phone: data.phone,
        isMobileVerified: true,
        deletedAt: null
      },
      include: {
        store: true
      }
    });

    if (!user) {
      throw new Error('등록되지 않은 전화번호입니다.');
    }

    const { accessToken, refreshToken } = await jwtUtils.generateTokenPair({
      userId: user.id,
      storeId: user.storeId,
      role: user.role as 'owner' | 'staff'
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await sessionStore.set(user.id, {
      userId: user.id,
      storeId: user.storeId,
      role: user.role,
      name: user.name
    });

    return {
      success: true,
      data: {
        userId: user.id,
        storeId: user.storeId,
        storeCode: user.store.storeCode,
        role: user.role,
        name: user.name,
        accessToken,
        refreshToken
      }
    };
  }

  // 매장 가입 (온라인 원스톱)
  async registerStore(data: IStoreRegisterRequest): Promise<IAuthResponse> {
    // SMS 인증 확인
    const isVerified = await smsUtils.verifyCode(data.phone, data.verificationCode);

    if (!isVerified) {
      throw new Error('인증번호가 올바르지 않습니다.');
    }

    // 사업자번호 검증
    const businessVerification = await businessUtils.verifyBusinessNumber(data.businessNumber);

    if (!businessVerification.valid) {
      throw new Error('유효하지 않은 사업자번호입니다.');
    }

    // 중복 체크
    const existingStore = await prisma.store.findFirst({
      where: { businessNumber: data.businessNumber }
    });

    if (existingStore) {
      throw new Error('이미 등록된 사업자번호입니다.');
    }

    // 트랜잭션으로 매장과 사용자 동시 생성
    const result = await prisma.$transaction(async (tx) => {
      // 매장 코드 생성 (1000 ~ 9999)
      const lastStore = await tx.store.findFirst({
        orderBy: { storeCode: 'desc' }
      });
      const storeCode = (lastStore?.storeCode || 1000) + 1;

      // 매장 생성
      const store = await tx.store.create({
        data: {
          storeCode,
          name: data.storeName,
          businessNumber: data.businessNumber,
          email: data.email,
          phone: data.phone,
          address: data.address,
          scrapingUrl: data.naverPlaceUrl,
          subscriptionStatus: 'trial'
        }
      });

      // 점주 계정 생성
      const userPin = Math.floor(1000 + Math.random() * 9000).toString();
      const user = await tx.user.create({
        data: {
          storeId: store.id,
          name: '점주',
          phone: data.phone,
          userPin,
          password: await bcrypt.hash(`${storeCode}${userPin}`, 10),
          role: 'owner',
          isMobileVerified: true
        }
      });

      // 기본 카테고리 생성
      await tx.category.createMany({
        data: [
          { storeId: store.id, name: '메인 메뉴', color: '#FF5733', sortOrder: 1 },
          { storeId: store.id, name: '사이드', color: '#33FF57', sortOrder: 2 },
          { storeId: store.id, name: '음료', color: '#3357FF', sortOrder: 3 }
        ]
      });

      // 기본 장소 생성
      const place = await tx.place.create({
        data: {
          storeId: store.id,
          name: 'Main Hall',
          color: '#28a745'
        }
      });

      // 기본 테이블 5개 생성
      for (let i = 1; i <= 5; i++) {
        await tx.table.create({
          data: {
            storeId: store.id,
            placeId: place.id,
            name: `Table ${i}`,
            qrCode: `QR_${storeCode}_${i.toString().padStart(2, '0')}`,
            capacity: 4,
            status: 'empty'
          }
        });
      }

      return { store, user };
    });

    // JWT 토큰 생성
    const { accessToken, refreshToken } = await jwtUtils.generateTokenPair({
      userId: result.user.id,
      storeId: result.store.id,
      role: 'owner'
    });

    return {
      success: true,
      data: {
        userId: result.user.id,
        storeId: result.store.id,
        storeCode: result.store.storeCode,
        role: 'owner',
        name: result.user.name,
        accessToken,
        refreshToken
      }
    };
  }

  // 고객 세션 생성 (QR 주문)
  async createCustomerSession(data: ICustomerSessionRequest) {
    const table = await prisma.table.findUnique({
      where: { qrCode: data.qrCode },
      include: {
        store: true
      }
    });

    if (!table) {
      throw new Error('유효하지 않은 QR 코드입니다.');
    }

    // 고객 세션 생성
    const sessionId = uuidv4();
    const customer = await prisma.customer.create({
      data: {
        sessionId,
        language: data.language || 'ko'
      }
    });

    // 테이블 상태 업데이트
    if (table.status === 'empty') {
      await prisma.table.update({
        where: { id: table.id },
        data: { status: 'seated' }
      });
    }

    // Redis에 세션 저장
    await sessionStore.set(sessionId, {
      customerId: customer.id,
      tableId: table.id,
      storeId: table.storeId,
      language: customer.language
    });

    return {
      success: true,
      data: {
        sessionId,
        customerId: customer.id,
        tableId: table.id,
        tableName: table.name,
        storeId: table.storeId
      }
    };
  }

  // SMS 인증번호 요청
  async requestSmsVerification(phone: string): Promise<{ success: boolean; expiresIn: number }> {
    const success = await smsUtils.sendVerificationCode(phone);

    if (!success) {
      throw new Error('SMS 발송에 실패했습니다.');
    }

    return {
      success: true,
      expiresIn: 300 // config.sms.verificationExpiresIn
    };
  }

  // 토큰 갱신
  async refreshToken(refreshToken: string, userId: string): Promise<IAuthResponse> {
    const isValid = await jwtUtils.verifyRefreshToken(refreshToken, userId);

    if (!isValid) {
      throw new Error('유효하지 않은 Refresh Token입니다.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    });

    if (!user || user.deletedAt) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const { accessToken, refreshToken: newRefreshToken } = await jwtUtils.generateTokenPair({
      userId: user.id,
      storeId: user.storeId,
      role: user.role as 'owner' | 'staff'
    });

    return {
      success: true,
      data: {
        userId: user.id,
        storeId: user.storeId,
        storeCode: user.store.storeCode,
        role: user.role,
        name: user.name,
        accessToken,
        refreshToken: newRefreshToken
      }
    };
  }

  // 로그아웃
  async logout(userId: string): Promise<void> {
    await sessionStore.delete(userId);
    await refreshTokenStore.delete(userId);
  }
}

export const authService = new AuthService();