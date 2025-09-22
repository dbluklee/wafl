import { prisma } from '@shared/database';

export class ProfileService {
  // 프로필 조회 (기본 정보만)
  static async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              storeCode: true
            }
          }
        }
      });

      if (!user) return null;

      return {
        userId: user.id,
        storeId: user.storeId,
        storeName: user.store.name,
        storeCode: user.store.storeCode,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: !user.deletedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw error;
    }
  }

  // 프로필 수정 (이름만)
  static async updateProfile(userId: string, data: { name: string }) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              storeCode: true
            }
          }
        }
      });

      return {
        userId: updatedUser.id,
        storeId: updatedUser.storeId,
        storeName: updatedUser.store.name,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      };
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      throw error;
    }
  }

  // PIN 변경
  static async changePin(userId: string, currentPin: string, newPin: string): Promise<boolean> {
    try {
      // 현재 PIN 확인
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { userPin: true }
      });

      if (!user || user.userPin !== currentPin) {
        return false;
      }

      // 새 PIN으로 업데이트
      await prisma.user.update({
        where: { id: userId },
        data: { userPin: newPin }
      });

      return true;
    } catch (error) {
      console.error('PIN 변경 실패:', error);
      throw error;
    }
  }

  // 언어 설정 저장 (추후 확장 - 현재는 세션/캐시에만 저장)
  static async updateLanguage(userId: string, language: string): Promise<void> {
    try {
      // 현재 스키마에는 language 필드가 없으므로
      // 추후 확장 시 user_settings 테이블 또는 users 테이블에 언어 필드 추가
      console.log(`User ${userId} language setting updated to: ${language}`);

      // 임시로 현재는 로그만 남기고, 추후 실제 저장 로직 구현
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { preferredLanguage: language }
      // });
    } catch (error) {
      console.error('언어 설정 변경 실패:', error);
      throw error;
    }
  }
}