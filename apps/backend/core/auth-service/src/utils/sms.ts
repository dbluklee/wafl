import axios from 'axios';
import { config } from '../config';
import { prisma } from '@shared/database';

export const smsUtils = {
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendVerificationCode(phone: string): Promise<boolean> {
    try {
      const code = this.generateVerificationCode();

      // SMS 발송 (개발 환경에서는 콘솔 출력)
      if (config.env === 'development') {
        console.log(`📱 SMS Verification Code for ${phone}: ${code}`);
      } else {
        // 실제 SMS API 호출
        await axios.post(config.sms.apiUrl, {
          to: phone,
          message: `[AI POS] 인증번호는 ${code}입니다.`
        }, {
          headers: {
            'Authorization': `Bearer ${config.sms.apiKey}`
          }
        });
      }

      // DB에 저장
      await prisma.smsVerification.create({
        data: {
          phone,
          verificationCode: code,
          expiresAt: new Date(Date.now() + config.sms.verificationExpiresIn * 1000)
        }
      });

      return true;
    } catch (error) {
      console.error('SMS send failed:', error);
      return false;
    }
  },

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const verification = await prisma.smsVerification.findFirst({
      where: {
        phone,
        verificationCode: code,
        isVerified: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!verification) return false;

    // 검증 완료 처리
    await prisma.smsVerification.update({
      where: { id: verification.id },
      data: { isVerified: true }
    });

    return true;
  }
};