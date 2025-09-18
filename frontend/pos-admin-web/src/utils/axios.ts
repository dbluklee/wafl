import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from auth-storage first
    let token = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.accessToken;
      }
    } catch (e) {
      // Fallback to direct accessToken
      token = localStorage.getItem('accessToken');
    }

    // Debug logging
    console.log('🔍 Axios Request Interceptor:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
      body: config.data ? 'present' : 'none'
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized (but not on public pages)
    const currentPath = window.location.pathname;
    const publicPaths = ['/welcome', '/signin', '/signup'];

    if (error.response?.status === 401 && !originalRequest._retry && !publicPaths.includes(currentPath)) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('store');

        // Only redirect if not on public pages
        const currentPath = window.location.pathname;
        const publicPaths = ['/welcome', '/signin', '/signup'];
        if (!publicPaths.includes(currentPath)) {
          window.location.href = '/welcome';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          toast.error(`잘못된 요청: ${message}`);
          break;
        case 403:
          toast.error('접근 권한이 없습니다');
          break;
        case 404:
          toast.error('요청한 리소스를 찾을 수 없습니다');
          break;
        case 422:
          toast.error(`입력 데이터 오류: ${message}`);
          break;
        case 429:
          toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요');
          break;
        case 500:
          toast.error('서버 오류가 발생했습니다');
          break;
        case 502:
          toast.error('서버에 연결할 수 없습니다');
          break;
        case 503:
          toast.error('서비스를 이용할 수 없습니다');
          break;
        default:
          toast.error(`오류가 발생했습니다 (${status}): ${message}`);
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      toast.error('네트워크 연결을 확인해주세요');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('요청 시간이 초과되었습니다');
    } else {
      toast.error('예기치 못한 오류가 발생했습니다');
    }

    return Promise.reject(error);
  }
);

export default api;