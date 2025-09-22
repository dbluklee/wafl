import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import ManagementPage from '@/pages/ManagementPage';
import WelcomePage from '@/pages/WelcomePage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const signout = useAuthStore((state) => state.signout);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Enhanced authentication check: require both isAuthenticated flag and actual user data
  const isReallyAuthenticated = isAuthenticated && user && accessToken;

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔍 Auth State Changed:', {
      isAuthenticated,
      hasUser: !!user,
      hasAccessToken: !!accessToken,
      isReallyAuthenticated,
      currentPath: location.pathname
    });
  }, [isAuthenticated, user, accessToken, isReallyAuthenticated, location.pathname]);

  // Apply Mode-1 class to body for color variables
  useEffect(() => {
    document.body.classList.add('Mode-1');
    return () => {
      document.body.classList.remove('Mode-1');
    };
  }, []);

  // Check authentication status on app start (only if not on public pages)
  useEffect(() => {
    const publicPaths = ['/welcome', '/signin', '/signup'];
    if (!publicPaths.includes(location.pathname)) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, location.pathname]);

  // URL masking - hide specific paths in address bar (but not during navigation)
  useEffect(() => {
    const hidePaths = ['/signin', '/signup', '/welcome', '/management', '/dashboard', '/ai-agent', '/analytics'];
    if (hidePaths.includes(location.pathname)) {
      // Use replaceState to hide the actual path but preserve navigation state
      const timer = setTimeout(() => {
        window.history.replaceState({ path: location.pathname }, '', '/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleSignOut = () => {
    signout();
    // Use setTimeout to ensure signout state has been processed
    setTimeout(() => {
      navigate('/welcome', { replace: true });
    }, 100);
  };

  const handleSignInComplete = () => {
    // Force navigate to home page after successful signin
    console.log('🎯 Sign in completed, navigating to home');
    navigate('/', { replace: true });
  };

  const handleSignUpComplete = () => {
    navigate('/');
  };

  const handleManagement = () => {
    navigate('/management');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleAIAgent = () => {
    navigate('/ai-agent');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleBackToWelcome = () => {
    navigate('/welcome');
  };

  return (
    <div className="w-full h-full">
      <Routes>
        {/* Welcome flow - public routes */}
        <Route
          path="/welcome"
          element={
            <WelcomePage
              onSignUp={handleSignUp}
              onSignIn={handleSignIn}
            />
          }
        />
        <Route
          path="/signin"
          element={
            <SignInPage
              onBack={handleBackToWelcome}
              onSignInComplete={handleSignInComplete}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUpPage
              onBack={handleBackToWelcome}
              onSignUpComplete={handleSignUpComplete}
            />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isReallyAuthenticated ? (
              <HomePage
                onSignOut={handleSignOut}
                onManagement={handleManagement}
                onDashboard={handleDashboard}
                onAIAgent={handleAIAgent}
                onAnalytics={handleAnalytics}
              />
            ) : (
              <WelcomePage
                onSignUp={handleSignUp}
                onSignIn={handleSignIn}
              />
            )
          }
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/management"
          element={
            <ManagementPage
              onHome={handleHome}
              onSignOut={handleSignOut}
            />
          }
        />
        <Route path="/ai-agent" element={<div className="text-white p-8">AI Agent Page - Coming Soon</div>} />
        <Route path="/analytics" element={<div className="text-white p-8">Analytics Page - Coming Soon</div>} />

        {/* Catch-all route - redirect any unknown paths to welcome */}
        <Route
          path="*"
          element={
            <WelcomePage
              onSignUp={handleSignUp}
              onSignIn={handleSignIn}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;