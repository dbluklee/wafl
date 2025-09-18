import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (Korean Won)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

// Format date for display
export function formatDate(date: string | Date, formatStr?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (formatStr) {
    return format(dateObj, formatStr, { locale: ko });
  }

  // Default smart formatting
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm', { locale: ko });
  } else if (isYesterday(dateObj)) {
    return `어제 ${format(dateObj, 'HH:mm', { locale: ko })}`;
  } else {
    return format(dateObj, 'MM/dd HH:mm', { locale: ko });
  }
}

// Format relative time (e.g., "5분 전")
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
}

// Generate random ID
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${id}` : id;
}

// Generate QR code URL
export function generateQRCodeUrl(tableId: string, storeCode: string): string {
  const baseUrl = window.location.origin;
  const qrData = `${baseUrl}/order?store=${storeCode}&table=${tableId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
}

// Validate store code format (4 digits)
export function isValidStoreCode(code: string): boolean {
  return /^[0-9]{4}$/.test(code);
}

// Validate PIN format (4 digits)
export function isValidPin(pin: string): boolean {
  return /^[0-9]{4}$/.test(pin);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  return /^[0-9-+\s()]{8,20}$/.test(phone);
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

// Get contrasting text color for background
export function getContrastingColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// File utilities
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.'));
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function uniqBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy text to clipboard:', fallbackError);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// Generate download link for blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format table status for display
export function formatTableStatus(status: string): string {
  const statusMap = {
    available: '사용가능',
    occupied: '사용중',
    reserved: '예약됨',
    cleaning: '정리중',
  } as Record<string, string>;

  return statusMap[status] || status;
}

// Format order status for display
export function formatOrderStatus(status: string): string {
  const statusMap = {
    pending: '대기',
    confirmed: '확인됨',
    in_progress: '준비중',
    ready: '준비완료',
    served: '서빙완료',
    completed: '완료',
    cancelled: '취소',
  } as Record<string, string>;

  return statusMap[status] || status;
}

// Format payment method for display
export function formatPaymentMethod(method: string): string {
  const methodMap = {
    cash: '현금',
    card: '카드',
    mobile: '모바일',
  } as Record<string, string>;

  return methodMap[method] || method;
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// Fullscreen utilities
export function enterFullscreen(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!document.fullscreenElement) {
      const documentElement = document.documentElement;

      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen().then(resolve).catch(reject);
      } else if ((documentElement as any).webkitRequestFullscreen) {
        (documentElement as any).webkitRequestFullscreen();
        resolve();
      } else if ((documentElement as any).msRequestFullscreen) {
        (documentElement as any).msRequestFullscreen();
        resolve();
      } else {
        reject(new Error('Fullscreen API is not supported'));
      }
    } else {
      resolve();
    }
  });
}

export function exitFullscreen(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(resolve).catch(reject);
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        resolve();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
        resolve();
      } else {
        reject(new Error('Fullscreen API is not supported'));
      }
    } else {
      resolve();
    }
  });
}

export function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    return exitFullscreen();
  } else {
    return enterFullscreen();
  }
}

export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}