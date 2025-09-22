import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/utils/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import { toast } from 'sonner';

// 타입 정의를 여기서 직접 선언
interface SigninRequest {
  storeCode: string;
  pin: string;
  password?: string;
}

interface MobileSigninRequest {
  phoneNumber: string;
  authCode: string;
}

interface SigninResponse {
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
  userPin: string | null; // 로그인한 PIN 저장
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  signin: (credentials: SigninRequest) => Promise<void>;
  mobileSignin: (credentials: MobileSigninRequest) => Promise<void>;
  sendSmsCode: (phoneNumber: string) => Promise<void>;
  signout: () => void;
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
      userPin: null,
      isAuthenticated: false,
      isLoading: false,

      // Signin action
      signin: async (credentials: SigninRequest) => {
        set({ isLoading: true });

        try {
          const response = await api.post(
            API_ENDPOINTS.SIGNIN,
            {
              storeCode: parseInt(credentials.storeCode),
              userPin: credentials.pin,
              password: credentials.password
            }
          );

          const apiResponse = response.data; // API 응답 데이터
          if (!apiResponse?.success || !apiResponse?.data) {
            throw new Error('No data received from server');
          }

          const authData = apiResponse.data;
          const { accessToken, refreshToken, userId, storeId, storeCode, role, name } = authData;

          // Transform to expected format
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
            name: `Store ${storeCode}`,
            address: '',
            phone: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // 디버깅: API 응답 데이터와 credentials 확인
          console.log('🔍 PIN/PASSWORD Signin API Response:', {
            accessToken: accessToken ? 'present' : 'missing',
            refreshToken: refreshToken ? 'present' : 'missing',
            user, store
          });
          console.log('🔍 Login credentials PIN:', credentials.pin);
          console.log('🔍 UserID vs PIN comparison:', { userId: user.id, credentialsPin: credentials.pin });

          // Update state
          set({
            user,
            store,
            accessToken,
            refreshToken,
            userPin: credentials.pin, // 로그인한 PIN 저장
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
                               '사인인에 실패했습니다';

          toast.error(errorMessage);
          throw error;
        }
      },

      // Mobile signin action
      mobileSignin: async (credentials: MobileSigninRequest) => {
        set({ isLoading: true });

        try {
          const response = await api.post<SigninResponse>(
            API_ENDPOINTS.MOBILE_SIGNIN,
            credentials
          );

          const data = response.data; // API 응답 데이터
          if (!data) {
            throw new Error('No data received from server');
          }

          const { accessToken, refreshToken, user, store } = data;

          // Use user and store objects directly from API response

          // Update state
          set({
            user,
            store,
            accessToken,
            refreshToken,
            userPin: null, // 모바일 로그인에는 PIN이 없음
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
                               '모바일 사인인에 실패했습니다';

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

      // Signout action
      signout: () => {
        // Clear state first to avoid auth loops
        set({
          user: null,
          store: null,
          accessToken: null,
          refreshToken: null,
          userPin: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear localStorage completely
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.STORE);
        localStorage.removeItem('auth-storage'); // Zustand persist storage 완전 삭제

        // Skip API call during signout to avoid 401 errors
        // Server-side cleanup is not critical for security

        toast.success('사인아웃되었습니다');
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

          // If refresh fails, signout user
          get().signout();

          return false;
        }
      },

      // Check authentication status
      checkAuthStatus: async () => {
        const { accessToken, user, store } = get();

        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        // If we have stored user and store data, assume authenticated
        if (user && store) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        // If no user/store data but have token, try to verify
        try {
          set({ isLoading: true });

          // Validate token by calling the profile endpoint
          await api.get('/api/v1/auth/profile');

          // If request succeeds, we're authenticated
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Auth status check failed:', error);

          // If status check fails, try to refresh token
          if (error.response?.status === 401) {
            const refreshSuccess = await get().refreshAuthToken();

            if (!refreshSuccess) {
              set({ isLoading: false });
              get().signout();
            } else {
              set({ isAuthenticated: true, isLoading: false });
            }
          } else {
            // For other errors, assume token is valid
            set({ isAuthenticated: true, isLoading: false });
          }
        }
      },
    }),
    {
      name: 'pos-admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userPin: state.userPin,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Allow auto-rehydrate for persistent login
        if (state) {
          // Only reset loading state, keep authentication if tokens exist
          state.isLoading = false;
        }
      },
    }
  )
);

// Expose authStore to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__ZUSTAND_AUTH_STORE__ = useAuthStore.getState();
  useAuthStore.subscribe((state) => {
    (window as any).__ZUSTAND_AUTH_STORE__ = state;
  });
}

// Computed selectors
export const selectUser = (state: AuthState) => state.user;
export const selectStore = (state: AuthState) => state.store;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectIsOwner = (state: AuthState) => state.user?.role === 'owner';
export const selectIsStaff = (state: AuthState) => state.user?.role === 'staff';