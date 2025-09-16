import { useState, useEffect, useRef } from 'react';
import { DESIGN_TOKENS } from '../types/design-tokens';
import { userService, type SignUpData, type UserProfile } from '../services/userService';
import { useLogger } from '../hooks/useLogging';
import ButtonComp from './ButtonComp';

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
  const [registrationData, setRegistrationData] = useState<{user: any, store: any} | null>(null);
  const [phoneVerificationMessage, setPhoneVerificationMessage] = useState<string | null>(null);

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

    // Initial size
    updateSize();

    // ResizeObserver for more accurate container size tracking
    let resizeObserver: ResizeObserver | null = null;
    
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize
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

  const formatBusinessRegistrationNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    const limited = numbers.slice(0, 10);
    
    // Format as XXX-XX-XXXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
    }
  };

  const handleBusinessRegNumberChange = (value: string) => {
    const formatted = formatBusinessRegistrationNumber(value);
    setFormData(prev => ({ ...prev, businessRegistrationNumber: formatted }));
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, '');
    
    // Limit to 11 digits
    const limited = numbers.slice(0, 11);
    
    // Format based on length
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else if (limited.length <= 10) {
      // 10 digits: XXX-XXX-XXXX
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else {
      // 11 digits: XXX-XXXX-XXXX
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phoneNumber: formatted }));
  };

  const handlePhoneAuth = () => {
    console.log('Phone authentication requested');
    setPhoneVerificationMessage('Phone verification sent! Check your SMS messages. (This is a demo implementation)');
    
    // Clear the message after 5 seconds
    setTimeout(() => {
      setPhoneVerificationMessage(null);
    }, 5000);
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

      const result = await userService.register(signUpData);
      setRegistrationData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate responsive values based on container size
  // Check window width for tablet detection instead of container width
  const windowWidth = window.innerWidth;
  const isTabletSize = windowWidth >= 600 && windowWidth < 1200; // Broader range for tablets
  const scaleFactor = Math.min(containerSize.width / 400, containerSize.height / 600);
  // Improved scaling for tablets - less aggressive scaling
  const responsiveScale = isTabletSize 
    ? Math.max(0.85, Math.min(1.0, scaleFactor))  // More conservative scaling for tablets
    : Math.max(0.7, Math.min(1.2, scaleFactor));   // Original scaling for mobile/desktop
  
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
          padding: isTabletSize 
            ? `clamp(4px, 1vh, 12px) ${Math.max(8, 16 * responsiveScale)}px clamp(4px, 1vh, 12px)`
            : `clamp(8px, 2vh, 24px) ${Math.max(8, 16 * responsiveScale)}px clamp(8px, 2vh, 24px)`,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          minHeight: '100%'
        }}
      >
        <div style={{ flex: '0 0 auto', width: '100%' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: isTabletSize ? 'clamp(8px, 2vh, 16px)' : `${Math.max(16, 24 * responsiveScale)}px` }}>
          <h1 
            className="FontStyleBlockTitle"
            style={{
              color: 'var(--white)',
              marginBottom: `${Math.max(4, 8 * responsiveScale)}px`,
              fontSize: isTabletSize ? '1.3rem' : `${Math.max(1.2, 1.8 * responsiveScale)}rem`,
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
              : 'Create your BurnanaPOS account'
            }
          </p>
        </div>

        {/* Registration Success */}
        {registrationData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2vh, 1.5rem)' }}>
            <div className="text-center rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 'clamp(1rem, 2vh, 1.5rem)', borderRadius: 'clamp(6px, 0.8vw, 8px)' }}>
              <h3 
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  fontWeight: 700,
                  marginBottom: 'clamp(12px, 2vh, 16px)',
                }}
              >
                Your Login Credentials
              </h3>
              <div className="space-y-3">
                <div>
                  <p style={{ ...labelStyle, marginBottom: 'clamp(2px, 0.5vh, 4px)' }}>Store Number</p>
                  <p 
                    style={{
                      color: colors.basicWhite,
                      fontFamily: 'monospace',
                      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: 'clamp(6px, 1vh, 8px) clamp(12px, 2vw, 16px)',
                      borderRadius: 'clamp(6px, 0.8vw, 8px)',
                    }}
                  >
                    {registrationData.store.store_number}
                  </p>
                </div>
                <div>
                  <p style={{ ...labelStyle, marginBottom: 'clamp(2px, 0.5vh, 4px)' }}>User PIN</p>
                  <p 
                    style={{
                      color: colors.basicWhite,
                      fontFamily: 'monospace',
                      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: 'clamp(6px, 1vh, 8px) clamp(12px, 2vw, 16px)',
                      borderRadius: 'clamp(6px, 0.8vw, 8px)',
                    }}
                  >
                    {registrationData.store.user_pin}
                  </p>
                </div>
              </div>
              <p 
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                  opacity: 0.7,
                  marginTop: 'clamp(12px, 2vh, 16px)',
                  lineHeight: '1.5',
                }}
              >
                Please save these credentials safely. You will need them to sign in to your account.
              </p>
            </div>
            
            <ButtonComp 
              label="Continue to Dashboard"
              onClick={async () => {
                // Save user data to localStorage like signin does
                if (registrationData) {
                  // Create user object in same format as signin response
                  const userForStorage = {
                    userId: registrationData.user.id,
                    storeId: registrationData.store.id,
                    storeName: registrationData.store.store_name,
                    ownerName: registrationData.store.owner_name,
                    storeNumber: registrationData.store.store_number,
                    userPin: registrationData.store.user_pin,
                    preWork: registrationData.store.pre_work
                  };
                  
                  localStorage.setItem('currentUser', JSON.stringify(userForStorage));
                  
                  // Initialize logging session with user sign in after successful registration
                  if (registrationData.store.user_pin) {
                    await logUserSignIn(registrationData.store.user_pin);
                  }
                  
                  // Log server connection status like signin does
                  const connectionStatus = await userService.checkServerConnection();
                  const { loggingService } = await import('../services/loggingService');
                  await loggingService.logServerConnection(connectionStatus.connected, connectionStatus.message);
                }
                onSignUpComplete?.();
              }}
              isSelected={true}
              className="w-full"
              style={{ height: 'clamp(40px, 6vh, 56px)' }}
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
            
            {phoneVerificationMessage && (
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)' }}
              >
                <p style={{ color: '#6bff6b', fontFamily: fonts.pretendard, fontSize: '14px' }}>
                  {phoneVerificationMessage}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              width: '100%' 
            }}>
              {/* Row 1: Business Registration Number and Store Name */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: windowWidth < 480 ? '1fr' : '1fr 1fr', // Single column only on very small screens
                gap: '12px',
                width: '100%'
              }}>
                <div>
                  <label style={labelStyle}>Business Registration Number</label>
                  <input
                    type="text"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => handleBusinessRegNumberChange(e.target.value)}
                    style={inputStyle}
                    placeholder="123-45-67890"
                    maxLength={12}
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
              </div>

              {/* Row 2: Owner Name and Email (moved up) */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: windowWidth < 480 ? '1fr' : '1fr 1fr', // Single column only on very small screens
                gap: '12px',
                width: '100%'
              }}>
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
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <div className="flex gap-2" style={{ width: '100%' }}>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    style={{ ...inputStyle, flex: '1 1 auto', minWidth: 0 }}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    required
                  />
                  <ButtonComp 
                    label="Verify"
                    onClick={handlePhoneAuth}
                    className="FontStyleTitle"
                    style={{ height: '40px', minWidth: '70px', flexShrink: 0 }}
                  />
                </div>
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
                <button
                  type="submit"
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <ButtonComp 
                  label={isLoading ? 'Creating Account...' : 'Create Account'}
                  onClick={handleSubmit}
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
    </div>
  );
}