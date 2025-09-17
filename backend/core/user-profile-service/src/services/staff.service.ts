import { PrismaClient } from '../../../../../node_modules/@prisma/client';

const prisma = new PrismaClient();

interface CreateStaffData {
  storeId: string;
  name: string;
  userPin: string;
  phone?: string;
}

interface UpdateStaffData {
  name?: string;
  userPin?: string;
  phone?: string;
}

export class StaffService {
  // 직원 목록 조회 (해당 매장의 직원만)
  static async getStaffList(storeId: string) {
    try {
      const staffList = await prisma.user.findMany({
        where: {
          storeId,
          role: 'staff', // 직원만 조회
          deletedAt: null // 활성 직원만
        },
        select: {
          id: true,
          name: true,
          phone: true,
          userPin: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          deletedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return staffList.map(staff => ({
        ...staff,
        isActive: !staff.deletedAt
      }));
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      throw error;
    }
  }

  // 직원 추가
  static async createStaff(data: CreateStaffData) {
    try {
      // PIN 중복 체크 (매장 내)
      const existingStaff = await prisma.user.findFirst({
        where: {
          storeId: data.storeId,
          userPin: data.userPin,
          deletedAt: null
        }
      });

      if (existingStaff) {
        throw new Error('이미 사용 중인 PIN입니다.');
      }

      // 전화번호 중복 체크 (전체)
      if (data.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: data.phone,
            deletedAt: null
          }
        });

        if (existingPhone) {
          throw new Error('이미 등록된 전화번호입니다.');
        }
      }

      const newStaff = await prisma.user.create({
        data: {
          storeId: data.storeId,
          name: data.name,
          userPin: data.userPin,
          phone: data.phone,
          role: 'staff'
        },
        select: {
          id: true,
          name: true,
          phone: true,
          userPin: true,
          role: true,
          createdAt: true
        }
      });

      return newStaff;
    } catch (error) {
      console.error('직원 추가 실패:', error);
      throw error;
    }
  }

  // 직원 수정
  static async updateStaff(staffId: string, storeId: string, data: UpdateStaffData) {
    try {
      // 해당 매장의 직원인지 확인
      const existingStaff = await prisma.user.findFirst({
        where: {
          id: staffId,
          storeId,
          role: 'staff',
          deletedAt: null
        }
      });

      if (!existingStaff) {
        return null;
      }

      // PIN 중복 체크 (변경하는 경우)
      if (data.userPin && data.userPin !== existingStaff.userPin) {
        const duplicatePin = await prisma.user.findFirst({
          where: {
            storeId,
            userPin: data.userPin,
            deletedAt: null,
            NOT: { id: staffId }
          }
        });

        if (duplicatePin) {
          throw new Error('이미 사용 중인 PIN입니다.');
        }
      }

      // 전화번호 중복 체크 (변경하는 경우)
      if (data.phone && data.phone !== existingStaff.phone) {
        const duplicatePhone = await prisma.user.findFirst({
          where: {
            phone: data.phone,
            deletedAt: null,
            NOT: { id: staffId }
          }
        });

        if (duplicatePhone) {
          throw new Error('이미 등록된 전화번호입니다.');
        }
      }

      const updatedStaff = await prisma.user.update({
        where: { id: staffId },
        data,
        select: {
          id: true,
          name: true,
          phone: true,
          userPin: true,
          role: true,
          updatedAt: true
        }
      });

      return updatedStaff;
    } catch (error) {
      console.error('직원 수정 실패:', error);
      throw error;
    }
  }

  // 직원 활성화/비활성화
  static async toggleStaffStatus(staffId: string, storeId: string, isActive: boolean) {
    try {
      // 해당 매장의 직원인지 확인
      const existingStaff = await prisma.user.findFirst({
        where: {
          id: staffId,
          storeId,
          role: 'staff'
        }
      });

      if (!existingStaff) {
        return null;
      }

      const updatedStaff = await prisma.user.update({
        where: { id: staffId },
        data: {
          deletedAt: isActive ? null : new Date()
        },
        select: {
          id: true,
          name: true,
          phone: true,
          userPin: true,
          role: true,
          deletedAt: true,
          updatedAt: true
        }
      });

      return {
        ...updatedStaff,
        isActive: !updatedStaff.deletedAt
      };
    } catch (error) {
      console.error('직원 상태 변경 실패:', error);
      throw error;
    }
  }
}