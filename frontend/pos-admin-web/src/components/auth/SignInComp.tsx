import { useState, useEffect, useRef } from 'react';
import { DESIGN_TOKENS } from '../../types/design-tokens';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface SignInCompProps {
  onBack?: () => void;
  onSignInComplete?: () => void;
}

interface PinSignInForm {
  storeCode: string;
  pin: string;
  password: string;
}

interface MobileSignInForm {
  phoneNumber: string;
  authCode: string;
}

type TabType = 'MOBILE' | 'PIN_PASSWORD';

export default function SignInComp({ onBack, onSignInComplete }: SignInCompProps) {
  const { colors, fonts } = DESIGN_TOKENS;
  const containerRef = useRef<HTMLDivElement>(null);
  const { login, mobileLogin, sendSmsCode } = useAuthStore();

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
  });

  const [activeTab, setActiveTab] = useState<TabType>('PIN_PASSWORD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsCodeSent, setSmsCodeSent] = useState(false);

  const [pinForm, setPinForm] = useState<PinSignInForm>({
    storeCode: '',
    pin: '',
    password: '',
  });

  const [mobileForm, setMobileForm] = useState<MobileSignInForm>({
    phoneNumber: '',
    authCode: '',
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

  const handlePinSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loginData = {
        storeCode: pinForm.storeCode,
        pin: pinForm.pin,
        password: pinForm.password
      };

      await login(loginData);
      toast.success('로그인에 성공했습니다!');
      onSignInComplete?.();
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSendSmsCode = async () => {
    if (!mobileForm.phoneNumber || mobileForm.phoneNumber.length < 13) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    try {
      await sendSmsCode(mobileForm.phoneNumber);
      setSmsCodeSent(true);
      setError(null);
    } catch (error: any) {
      console.error('SMS send failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'SMS 발송에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleMobileSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await mobileLogin({
        phoneNumber: mobileForm.phoneNumber,
        authCode: mobileForm.authCode
      });
      toast.success('로그인에 성공했습니다!');
      onSignInComplete?.();
    } catch (error: any) {
      console.error('Mobile login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || '모바일 로그인에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
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
    color: colors.basicWhite,
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
    color: colors.basicWhite,
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
      color: '#ccc',
      fontFamily: fonts.pretendard,
      fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      textAlign: 'center' as const,
    },
    active: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: colors.basicWhite,
      fontWeight: 600,
    }
  };

  const buttonStyle = {
    padding: `${Math.max(8, 12 * responsiveScale)}px ${Math.max(16, 24 * responsiveScale)}px`,
    borderRadius: `${Math.max(4, 6 * responsiveScale)}px`,
    border: `1px solid ${colors.buttonBorder}`,
    backgroundColor: colors.buttonBackground,
    color: colors.basicWhite,
    fontFamily: fonts.pretendard,
    fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minWidth: '120px',
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
            style={{
              color: colors.basicWhite,
              marginBottom: `${Math.max(4, 8 * responsiveScale)}px`,
              fontSize: `${Math.max(1.2, 1.8 * responsiveScale)}rem`,
              fontFamily: fonts.pretendard,
              fontWeight: 800,
              transition: 'font-size 0.2s ease-in-out'
            }}
          >
            WAFL POS 로그인
          </h1>
          <p
            style={{
              color: '#ccc',
              fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
              fontFamily: fonts.pretendard,
              transition: 'font-size 0.2s ease-in-out'
            }}
          >
            매장코드와 PIN을 입력해주세요
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

        {/* Mobile Sign In */}
        {activeTab === 'MOBILE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(12, 16 * responsiveScale)}px`, width: '100%' }}>
            {/* Phone Number */}
            <div>
              <h3
                style={{
                  ...labelStyle,
                  fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
                }}
              >
                휴대폰 번호
              </h3>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={mobileForm.phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  required
                />
                <button
                  style={{
                    ...buttonStyle,
                    minWidth: '100px',
                    fontSize: `${Math.max(0.7, 0.8 * responsiveScale)}rem`,
                    backgroundColor: smsCodeSent ? 'rgba(34, 197, 94, 0.2)' : colors.buttonBackground,
                    borderColor: smsCodeSent ? '#22c55e' : colors.buttonBorder,
                    color: smsCodeSent ? '#22c55e' : colors.basicWhite,
                  }}
                  onClick={handleSendSmsCode}
                  disabled={isLoading || !mobileForm.phoneNumber}
                >
                  {smsCodeSent ? '재발송' : '인증번호'}
                </button>
              </div>
            </div>

            {/* Auth Code */}
            <div>
              <h3
                style={{
                  ...labelStyle,
                  fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
                }}
              >
                인증번호
              </h3>
              <input
                type="text"
                value={mobileForm.authCode}
                onChange={(e) => setMobileForm(prev => ({ ...prev, authCode: e.target.value }))}
                style={inputStyle}
                placeholder="6자리 인증번호를 입력하세요"
                maxLength={6}
                disabled={!smsCodeSent}
                required
              />
              {smsCodeSent && (
                <p style={{
                  color: '#22c55e',
                  fontSize: `${Math.max(0.7, 0.8 * responsiveScale)}rem`,
                  marginTop: `${Math.max(2, 4 * responsiveScale)}px`,
                  fontFamily: fonts.pretendard
                }}>
                  인증번호가 발송되었습니다. (5분 내 입력)
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4" style={{ marginTop: `${Math.max(16, 24 * responsiveScale)}px` }}>
              {onBack && (
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'transparent',
                  }}
                  onClick={onBack}
                  disabled={isLoading}
                >
                  뒤로가기
                </button>
              )}
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  cursor: (isLoading || !smsCodeSent || !mobileForm.authCode) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !smsCodeSent || !mobileForm.authCode) ? 0.5 : 1,
                }}
                onClick={handleMobileSignIn}
                disabled={isLoading || !smsCodeSent || !mobileForm.authCode}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>

            {/* Demo Mobile Info */}
            <div
              style={{
                marginTop: `${Math.max(20, 32 * responsiveScale)}px`,
                padding: `${Math.max(12, 16 * responsiveScale)}px`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: `${Math.max(4, 6 * responsiveScale)}px`,
                border: `1px solid ${colors.buttonBorder}`
              }}
            >
              <h3
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(6, 8 * responsiveScale)}px`
                }}
              >
                테스트 모바일 로그인
              </h3>
              <div style={{ fontSize: `${Math.max(0.7, 0.9 * responsiveScale)}rem`, color: '#ccc', fontFamily: fonts.pretendard }}>
                <p><span style={{ fontWeight: 500 }}>휴대폰:</span> 010-1234-5678</p>
                <p><span style={{ fontWeight: 500 }}>인증번호:</span> 123456 (자동 발송)</p>
                <p style={{ fontSize: `${Math.max(0.6, 0.8 * responsiveScale)}rem`, marginTop: `${Math.max(4, 6 * responsiveScale)}px` }}>
                  * 개발 환경에서는 실제 SMS가 발송되지 않습니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PIN Sign In */}
        {activeTab === 'PIN_PASSWORD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(12, 16 * responsiveScale)}px`, width: '100%' }}>
            {/* Store Code */}
            <div>
              <h3
                style={{
                  ...labelStyle,
                  fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
                }}
              >
                매장코드
              </h3>
              <input
                type="text"
                value={pinForm.storeCode}
                onChange={(e) => setPinForm(prev => ({ ...prev, storeCode: e.target.value }))}
                style={inputStyle}
                placeholder="4자리 숫자를 입력하세요"
                maxLength={4}
                required
              />
            </div>

            {/* PIN */}
            <div>
              <h3
                style={{
                  ...labelStyle,
                  fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
                }}
              >
                PIN 번호
              </h3>
              <input
                type="password"
                value={pinForm.pin}
                onChange={(e) => setPinForm(prev => ({ ...prev, pin: e.target.value }))}
                style={inputStyle}
                placeholder="4자리 PIN을 입력하세요"
                maxLength={4}
                required
              />
            </div>

            {/* Password */}
            <div>
              <h3
                style={{
                  ...labelStyle,
                  fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
                }}
              >
                비밀번호
              </h3>
              <input
                type="password"
                value={pinForm.password}
                onChange={(e) => setPinForm(prev => ({ ...prev, password: e.target.value }))}
                style={inputStyle}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4" style={{ marginTop: `${Math.max(16, 24 * responsiveScale)}px` }}>
              {onBack && (
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'transparent',
                  }}
                  onClick={onBack}
                  disabled={isLoading}
                >
                  뒤로가기
                </button>
              )}
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={handlePinSignIn}
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>

            {/* Demo Account Info */}
            <div
              style={{
                marginTop: `${Math.max(20, 32 * responsiveScale)}px`,
                padding: `${Math.max(12, 16 * responsiveScale)}px`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: `${Math.max(4, 6 * responsiveScale)}px`,
                border: `1px solid ${colors.buttonBorder}`
              }}
            >
              <h3
                style={{
                  color: colors.basicWhite,
                  fontFamily: fonts.pretendard,
                  fontSize: `${Math.max(0.8, 1.0 * responsiveScale)}rem`,
                  fontWeight: 600,
                  marginBottom: `${Math.max(6, 8 * responsiveScale)}px`
                }}
              >
                테스트 계정
              </h3>
              <div style={{ fontSize: `${Math.max(0.7, 0.9 * responsiveScale)}rem`, color: '#ccc', fontFamily: fonts.pretendard }}>
                <p><span style={{ fontWeight: 500 }}>매장코드:</span> 1001</p>
                <p><span style={{ fontWeight: 500 }}>점주 PIN:</span> 1234</p>
                <p><span style={{ fontWeight: 500 }}>직원 PIN:</span> 5678</p>
                <p><span style={{ fontWeight: 500 }}>비밀번호:</span> password</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}