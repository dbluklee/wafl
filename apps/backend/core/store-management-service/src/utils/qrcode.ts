import QRCode from 'qrcode';
import { config } from '../config';

export const qrCodeUtils = {
  async generateQRCode(tableId: string, qrCode: string): Promise<string> {
    const url = `${config.qr.baseUrl}/qr/${qrCode}`;

    // Base64 이미지 생성
    const qrImage = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrImage;
  },

  generateQRString(storeCode: number, tableNumber: number): string {
    const timestamp = Date.now().toString(36);
    return `QR_${storeCode}_${tableNumber.toString().padStart(2, '0')}_${timestamp}`;
  }
};