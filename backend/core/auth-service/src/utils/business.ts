import axios from 'axios';
import { config } from '../config';
import { IBusinessVerification } from '../types';

export const businessUtils = {
  async verifyBusinessNumber(businessNumber: string): Promise<IBusinessVerification> {
    try {
      // 개발 환경에서는 항상 성공
      if (config.env === 'development') {
        return {
          valid: true,
          businessName: 'Demo Business'
        };
      }

      // 실제 국세청 API 호출
      const response = await axios.post(
        `${config.business.apiUrl}/validate`,
        {
          b_no: [businessNumber.replace(/-/g, '')]
        },
        {
          headers: {
            'Authorization': `Bearer ${config.business.apiKey}`
          }
        }
      );

      const result = response.data.data?.[0];
      return {
        valid: result?.b_stt === '01', // 01: 계속사업자
        businessName: result?.b_nm
      };
    } catch (error) {
      console.error('Business verification failed:', error);
      return { valid: false };
    }
  }
};