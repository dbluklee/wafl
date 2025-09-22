import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { DESIGN_TOKENS } from '../types/design-tokens';
import SignInComp from '../components/SignInComp';

const SigninPage: React.FC = () => {
  const { colors } = DESIGN_TOKENS;
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 페이지 로드 시 인증 상태 확인
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 이미 로그인된 상태라면 홈으로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSignInComplete = () => {
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: colors.bgBlack }}
    >
      <div
        className="h-full max-h-screen"
        style={{
          width: '50%',
          minWidth: '400px',
          maxWidth: '600px'
        }}
      >
        <SignInComp
          onSignInComplete={handleSignInComplete}
        />
      </div>
    </div>
  );
};

export default SigninPage;