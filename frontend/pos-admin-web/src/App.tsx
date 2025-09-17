import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';

function App() {
  const navigate = useNavigate();

  // Apply Mode-1 class to body for color variables
  useEffect(() => {
    document.body.classList.add('Mode-1');
    return () => {
      document.body.classList.remove('Mode-1');
    };
  }, []);

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log('Sign out clicked');
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

  return (
    <div className="w-full h-full">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSignOut={handleSignOut}
              onManagement={handleManagement}
              onDashboard={handleDashboard}
              onAIAgent={handleAIAgent}
              onAnalytics={handleAnalytics}
            />
          }
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/management" element={<div className="text-white p-8">Management Page - Coming Soon</div>} />
        <Route path="/ai-agent" element={<div className="text-white p-8">AI Agent Page - Coming Soon</div>} />
        <Route path="/analytics" element={<div className="text-white p-8">Analytics Page - Coming Soon</div>} />
      </Routes>
    </div>
  );
}

export default App;