import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import ManagementPage from '@/pages/ManagementPage';
import WelcomePage from '@/pages/WelcomePage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signout = useAuthStore((state) => state.signout);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Apply Mode-1 class to body for color variables
  useEffect(() => {
    document.body.classList.add('Mode-1');
    return () => {
      document.body.classList.remove('Mode-1');
    };
  }, []);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleSignOut = () => {
    signout();
    navigate('/welcome');
  };

  const handleSignInComplete = () => {
    navigate('/');
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
            isAuthenticated ? (
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
      </Routes>
    </div>
  );
}

export default App;