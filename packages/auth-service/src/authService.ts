// Default API base URL - can be overridden by the consuming application
const DEFAULT_API_BASE = 'http://112.148.37.41:4000';

export interface SignInData {
  store_number: string;
  user_pin: string;
}

export interface SignUpData {
  phone: string;
  name: string;
  email?: string;
  business_registration_number: string;
  store_name: string;
  owner_name: string;
  store_address: string;
  naver_store_link?: string;
  pre_work?: boolean;
}

class AuthService {
  private apiBase: string;

  constructor(apiBase?: string) {
    this.apiBase = apiBase || DEFAULT_API_BASE;
  }

  async checkServerConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiBase}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          connected: true,
          message: 'Server connection successful'
        };
      } else {
        return {
          connected: false,
          message: `Server responded with status ${response.status}`
        };
      }
    } catch (error) {
      return {
        connected: false,
        message: `Server connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async signIn(signInData: SignInData): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/api/v1/auth/login/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeCode: signInData.store_number,
          userPin: signInData.user_pin,
          password: 'password' // Default password for demo
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in');
      }

      const result = await response.json();

      // Store token if provided
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async register(signUpData: SignUpData): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: signUpData.store_name,
          ownerName: signUpData.owner_name,
          phoneNumber: signUpData.phone,
          email: signUpData.email,
          businessRegistrationNumber: signUpData.business_registration_number,
          storeAddress: signUpData.store_address,
          naverStoreLink: signUpData.naver_store_link,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register');
      }

      const result = await response.json();

      // Store token if provided
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
  }
}

// Default instance - consuming applications can create their own with custom API base
export const authService = new AuthService();

// Export the class for custom instances
export { AuthService };