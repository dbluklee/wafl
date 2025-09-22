import { useState, useRef, useEffect } from 'react';
import { DESIGN_TOKENS } from '../types/design-tokens';
import { AuthService, type SignUpData } from '@wafl/auth-service';
import { useLogger } from '../hooks/useLogging';
import ButtonComp from './ButtonComp';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';
const authService = new AuthService(API_BASE_URL);

interface SignUpCompProps {
  onBack?: () => void;
  onSignUpComplete?: () => void;
}

interface SignUpForm {
  businessRegistrationNumber: string;
  storeName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  storeAddress: string;
  naverStoreLink: string;
}

export default function SignUpComp({ onBack, onSignUpComplete }: SignUpCompProps) {
  const { colors, fonts } = DESIGN_TOKENS;
  const containerRef = useRef<HTMLDivElement>(null);
  const { logUserSignIn } = useLogger();

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
  });

  const [formData, setFormData] = useState<SignUpForm>({
    businessRegistrationNumber: '',
    storeName: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    storeAddress: '',
    naverStoreLink: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<any | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth,
          height: clientHeight
        });
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleInputChange = (field: keyof SignUpForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const signUpData: SignUpData = {
        phone: formData.phoneNumber,
        name: formData.ownerName,
        email: formData.email,
        business_registration_number: formData.businessRegistrationNumber,
        store_name: formData.storeName,
        owner_name: formData.ownerName,
        store_address: formData.storeAddress,
        naver_store_link: formData.naverStoreLink || undefined,
      };

      const result = await authService.register(signUpData);
      setRegistrationData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const scaleFactor = Math.min(containerSize.width / 400, containerSize.height / 600);
  const responsiveScale = Math.max(0.7, Math.min(1.2, scaleFactor));

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${colors.buttonBorder}`,
    backgroundColor: colors.buttonBackground,
    color: 'var(--white)',
    fontFamily: fonts.pretendard,
    fontSize: '0.9rem',
    fontWeight: 400,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease-in-out',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    color: 'var(--white)',
    fontFamily: fonts.pretendard,
    fontSize: '0.85rem',
    fontWeight: 500,
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          padding: `${Math.max(8, 16 * responsiveScale)}px`,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minHeight: '100%'
        }}
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: `${Math.max(16, 24 * responsiveScale)}px` }}>
          <h1
            className="FontStyleBlockTitle"
            style={{
              color: 'var(--white)',
              marginBottom: `${Math.max(4, 8 * responsiveScale)}px`,
              fontSize: `${Math.max(1.2, 1.8 * responsiveScale)}rem`,
              transition: 'font-size 0.2s ease-in-out'
            }}
          >
            {registrationData ? 'Registration Complete!' : 'Sign Up'}
          </h1>
          <p
            className="FontStyleBlockText"
            style={{
              color: 'var(--light)',
              fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
              transition: 'font-size 0.2s ease-in-out'
            }}
          >
            {registrationData
              ? 'Your account has been created successfully'
              : 'Create your WAFL POS account'
            }
          </p>
        </div>

        {/* Registration Success */}
        {registrationData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="text-center rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <h3
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                Registration Successful!
              </h3>
              <p
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: '1rem',
                  opacity: 0.8,
                  lineHeight: '1.5',
                }}
              >
                You can now proceed to the dashboard to start using WAFL POS.
              </p>
            </div>

            <ButtonComp
              label="Continue to Dashboard"
              onClick={async () => {
                if (registrationData) {
                  localStorage.setItem('currentUser', JSON.stringify(registrationData));
                  await logUserSignIn(registrationData.userPin || 'new_user');
                }
                onSignUpComplete?.();
              }}
              isSelected={true}
              className="w-full"
              style={{ height: '48px' }}
            />
          </div>
        )}

        {/* Form */}
        {!registrationData && (
          <>
            {error && (
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)' }}
              >
                <p style={{ color: '#ff6b6b', fontFamily: fonts.pretendard, fontSize: '14px' }}>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%'
            }}>
              <div>
                <label style={labelStyle}>Business Registration Number</label>
                <input
                  type="text"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  style={inputStyle}
                  placeholder="123-45-67890"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Store Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter store name"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter owner's name"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  style={inputStyle}
                  placeholder="010-1234-5678"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Store Address</label>
                <textarea
                  value={formData.storeAddress}
                  onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                  style={{
                    ...inputStyle,
                    minHeight: '60px',
                    resize: 'vertical',
                    maxWidth: '100%'
                  }}
                  placeholder="Enter store address"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Naver Store Link (Optional)</label>
                <input
                  type="url"
                  value={formData.naverStoreLink}
                  onChange={(e) => handleInputChange('naverStoreLink', e.target.value)}
                  style={inputStyle}
                  placeholder="Enter Naver store link"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4" style={{ paddingTop: '12px' }}>
                <ButtonComp
                  label="Back"
                  onClick={onBack}
                  className="flex-1"
                  style={{ height: '44px' }}
                  disabled={isLoading}
                />
                <ButtonComp
                  label={isLoading ? 'Creating Account...' : 'Create Account'}
                  onClick={() => handleSubmit({} as React.FormEvent)}
                  isSelected={true}
                  className="flex-1"
                  style={{ height: '44px' }}
                  disabled={isLoading}
                />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}