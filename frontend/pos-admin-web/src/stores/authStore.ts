import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import { toast } from 'sonner';

// 타입 정의를 여기서 직접 선언
interface LoginRequest {
  storeCode: string;
  pin: string;
  password?: string;
}

interface MobileLoginRequest {
  phoneNumber: string;
  authCode: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  store: Store;
}

interface User {
  id: string;
  name: string;
  role: 'owner' | 'staff';
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  // State
  user: User | null;
  store: Store | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  mobileLogin: (credentials: MobileLoginRequest) => Promise<void>;
  sendSmsCode: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setStore: (store: Store) => void;
  refreshAuthToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      store: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });

        try {
          const response = await api.post<LoginResponse>(
            API_ENDPOINTS.LOGIN,
            {
              storeCode: parseInt(credentials.storeCode),
              userPin: credentials.pin,
              password: credentials.password
            }
          );

          const data = response.data.data || response.data;
          if (!data) {
            throw new Error('No data received from server');
          }

          const { accessToken, refreshToken, userId, storeId, storeCode, role, name } = data;

          // Auth Service 응답 형식에 맞게 user와 store 객체 생성
          const user = {
            id: userId,
            name: name,
            role: role,
            storeId: storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const store = {
            id: storeId,
            code: storeCode.toString(),
            name: `매장 ${storeCode}`,
            address: '',
            phone: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Update state
          set({
            user,
            store,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store tokens in localStorage for axios interceptor
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          toast.success(`${user.name}님, 환영합니다!`);
        } catch (error: any) {
          set({ isLoading: false });

          const errorMessage = error.response?.data?.message ||
                               error.message ||
                               '로그인에 실패했습니다';

          toast.error(errorMessage);
          throw error;
        }
      },

      // Mobile login action
      mobileLogin: async (credentials: MobileLoginRequest) => {
        set({ isLoading: true });

        try {
          const response = await api.post<LoginResponse>(
            API_ENDPOINTS.MOBILE_LOGIN,
            credentials
          );

          const data = response.data.data || response.data;
          if (!data) {
            throw new Error('No data received from server');
          }

          const { accessToken, refreshToken, userId, storeId, storeCode, role, name } = data;

          // Auth Service 응답 형식에 맞게 user와 store 객체 생성
          const user = {
            id: userId,
            name: name,
            role: role,
            storeId: storeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const store = {
            id: storeId,
            code: storeCode.toString(),
            name: `매장 ${storeCode}`,
            address: '',
            phone: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Update state
          set({
            user,
            store,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store tokens in localStorage for axios interceptor
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          toast.success(`${user.name}님, 환영합니다!`);
        } catch (error: any) {
          set({ isLoading: false });

          const errorMessage = error.response?.data?.message ||
                               error.message ||
                               '모바일 로그인에 실패했습니다';

          toast.error(errorMessage);
          throw error;
        }
      },

      // Send SMS code
      sendSmsCode: async (phoneNumber: string) => {
        try {
          await api.post(API_ENDPOINTS.SEND_SMS, { phoneNumber });
          toast.success('인증번호가 발송되었습니다.');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message ||
                               error.message ||
                               'SMS 발송에 실패했습니다';
          toast.error(errorMessage);
          throw error;
        }
      },

      // Logout action
      logout: () => {
        // Call logout endpoint (optional, for server-side cleanup)
        api.post(API_ENDPOINTS.LOGOUT).catch(() => {
          // Ignore errors, we're logging out anyway
        });

        // Clear state
        set({
          user: null,
          store: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.STORE);

        toast.success('로그아웃되었습니다');
      },

      // Set tokens
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      },

      // Set user
      setUser: (user: User) => {
        set({ user });
      },

      // Set store
      setStore: (store: Store) => {
        set({ store });
      },

      // Refresh auth token
      refreshAuthToken: async (): Promise<boolean> => {
        const { refreshToken } = get();

        if (!refreshToken) {
          return false;
        }

        try {
          const response = await api.post(API_ENDPOINTS.REFRESH, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Update tokens
          get().setTokens(newAccessToken, newRefreshToken);

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);

          // If refresh fails, logout user
          get().logout();

          return false;
        }
      },

      // Check authentication status
      checkAuthStatus: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          return;
        }

        try {
          set({ isLoading: true });

          // Verify token by fetching user profile
          const response = await api.get(API_ENDPOINTS.PROFILE);
          const { user, store } = response.data.data;

          // Update user and store info
          set({
            user,
            store,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Auth status check failed:', error);

          // If status check fails, try to refresh token
          if (error.response?.status === 401) {
            const refreshSuccess = await get().refreshAuthToken();

            if (refreshSuccess) {
              // Retry status check after refresh
              try {
                const response = await api.get(API_ENDPOINTS.PROFILE);
                const { user, store } = response.data.data;

                set({
                  user,
                  store,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } catch (retryError) {
                console.error('Auth status retry failed:', retryError);
                set({ isLoading: false });
                get().logout();
              }
            } else {
              set({ isLoading: false });
            }
          } else {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // When hydrating from storage, check auth status
        if (state?.isAuthenticated && state?.accessToken) {
          state.checkAuthStatus();
        }
      },
    }
  )
);

// Computed selectors
export const selectUser = (state: AuthState) => state.user;
export const selectStore = (state: AuthState) => state.store;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsOwner = (state: AuthState) => state.user?.role === 'owner';
export const selectIsStaff = (state: AuthState) => state.user?.role === 'staff';