import { useState, useEffect, useRef } from 'react';
import { DESIGN_TOKENS } from '../types/design-tokens';
import { userService, type SignInData } from '../services/userService';
import { useLogger } from '../hooks/useLogging';
import MobileSignInComp, { type MobileSignInForm } from './MobileSignInComp';
import PinSignInComp, { type PinSignInForm } from './PinSignInComp';

interface SignInCompProps {
  onBack?: () => void;
  onSignInComplete?: () => void;
}


type TabType = 'MOBILE' | 'PIN_PASSWORD';

export default function SignInComp({ onBack, onSignInComplete }: SignInCompProps) {
  const { colors, fonts } = DESIGN_TOKENS;
  const containerRef = useRef<HTMLDivElement>(null);
  const { logUserSignIn } = useLogger();
  
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
  });

  const [activeTab, setActiveTab] = useState<TabType>('MOBILE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mobileForm, setMobileForm] = useState<MobileSignInForm>({
    phoneNumber: '',
    authNumber: '',
  });

  const [pinForm, setPinForm] = useState<PinSignInForm>({
    storeId: '',
    userPin: '',
    password: '',
  });

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

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else if (limited.length <= 10) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setMobileForm(prev => ({ ...prev, phoneNumber: formatted }));
  };

  const handlePhoneAuth = () => {
    console.log('Phone authentication requested');
    alert('Phone authentication sent (dummy implementation)');
  };

  const handleMobileSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For mobile sign in, we'll need to implement the actual logic
      // This is a placeholder implementation
      console.log('Mobile sign in:', mobileForm);
      alert('Mobile sign in not yet implemented');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mobile sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check server connection
      const connectionStatus = await userService.checkServerConnection();
      
      if (!connectionStatus.connected) {
        setError(`Connection failed: ${connectionStatus.message}`);
        return;
      }

      const signInData: SignInData = {
        store_number: pinForm.storeId,
        user_pin: pinForm.userPin
      };

      const user = await userService.signIn(signInData);
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Initialize logging session with user sign in
      await logUserSignIn(user.userPin);
      
      // Log server connection status after session is started
      const { loggingService } = await import('../services/loggingService');
      await loggingService.logServerConnection(connectionStatus.connected, connectionStatus.message);
      
      onSignInComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pin sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate responsive values based on container size
  const scaleFactor = Math.min(containerSize.width / 400, containerSize.height / 600);
  const responsiveScale = Math.max(0.7, Math.min(1.2, scaleFactor));
  
  const inputStyle = {
    width: '100%',
    padding: `${Math.max(6, 8 * responsiveScale)}px ${Math.max(8, 12 * responsiveScale)}px`,
    borderRadius: `${Math.max(4, 6 * responsiveScale)}px`,
    border: `1px solid ${colors.buttonBorder}`,
    backgroundColor: colors.buttonBackground,
    color: 'var(--white)',
    fontFamily: fonts.pretendard,
    fontSize: `${Math.max(0.7, 0.9 * responsiveScale)}rem`,
    fontWeight: 400,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease-in-out',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: `${Math.max(3, 4 * responsiveScale)}px`,
    color: 'var(--white)',
    fontFamily: fonts.pretendard,
    fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
    fontWeight: 500,
  };

  const tabStyle = {
    base: {
      flex: 1,
      padding: `${Math.max(6, 8 * responsiveScale)}px ${Math.max(8, 12 * responsiveScale)}px`,
      borderRadius: `${Math.max(4, 6 * responsiveScale)}px`,
      border: `1px solid ${colors.buttonBorder}`,
      backgroundColor: colors.buttonBackground,
      color: 'var(--light)',
      fontFamily: fonts.pretendard,
      fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      textAlign: 'center' as const,
    },
    active: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: 'var(--white)',
      fontWeight: 600,
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <div 
        className="w-full overflow-y-auto overflow-x-hidden max-h-full" 
        style={{ 
          padding: `0 ${Math.max(8, 16 * responsiveScale)}px`,
          maxWidth: '100%'
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
            Sign In
          </h1>
          <p 
            className="FontStyleBlockText"
            style={{
              color: 'var(--light)',
              fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
              transition: 'font-size 0.2s ease-in-out'
            }}
          >
            Access your BurnanaPOS account
          </p>
        </div>

        {/* Error Message */}
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

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: `${Math.max(16, 24 * responsiveScale)}px` }}>
          <button
            style={{
              ...tabStyle.base,
              ...(activeTab === 'MOBILE' ? tabStyle.active : {})
            }}
            onClick={() => setActiveTab('MOBILE')}
          >
            MOBILE
          </button>
          <button
            style={{
              ...tabStyle.base,
              ...(activeTab === 'PIN_PASSWORD' ? tabStyle.active : {})
            }}
            onClick={() => setActiveTab('PIN_PASSWORD')}
          >
            PIN/PASSWORD
          </button>
        </div>

        {/* Mobile Sign In Component */}
        {activeTab === 'MOBILE' && (
          <MobileSignInComp
            form={mobileForm}
            onPhoneNumberChange={handlePhoneNumberChange}
            onAuthNumberChange={(value) => setMobileForm(prev => ({ ...prev, authNumber: value }))}
            onPhoneAuth={handlePhoneAuth}
            onBack={onBack}
            onSignIn={handleMobileSignIn}
            isLoading={isLoading}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            responsiveScale={responsiveScale}
          />
        )}

        {/* Pin Sign In Component */}
        {activeTab === 'PIN_PASSWORD' && (
          <PinSignInComp
            form={pinForm}
            onStoreIdChange={(value) => setPinForm(prev => ({ ...prev, storeId: value }))}
            onUserPinChange={(value) => setPinForm(prev => ({ ...prev, userPin: value }))}
            onPasswordChange={(value) => setPinForm(prev => ({ ...prev, password: value }))}
            onBack={onBack}
            onSignIn={handlePinSignIn}
            isLoading={isLoading}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            responsiveScale={responsiveScale}
          />
        )}
      </div>
    </div>
  );
}

