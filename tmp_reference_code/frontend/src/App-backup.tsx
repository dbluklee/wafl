import { useState } from 'react';
import WelcomeNew from './components/WelcomeNew';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import type { PageType } from './types/navigation';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [pageHistory, setPageHistory] = useState<PageType[]>(['welcome']);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    setPageHistory(prev => [...prev, page]);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  const resetToWelcome = () => {
    setCurrentPage('welcome');
    setPageHistory(['welcome']);
  };

  // Navigation handlers
  const handleSignUp = () => navigateTo('signup');
  const handleSignIn = () => navigateTo('signin');
  const handleSignUpComplete = () => navigateTo('homepage');
  const handleSignInComplete = () => navigateTo('homepage');
  const handleSignOut = () => resetToWelcome();

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <WelcomeNew 
            onSignUp={handleSignUp} 
            onSignIn={handleSignIn} 
          />
        );
      
      case 'signup':
        return (
          <SignUpPage 
            onBack={goBack}
            onSignUpComplete={handleSignUpComplete}
          />
        );
      
      case 'signin':
        return (
          <SignInPage 
            onBack={goBack}
            onSignInComplete={handleSignInComplete}
          />
        );
      
      case 'homepage':
        return (
          <HomePage 
            onSignOut={handleSignOut}
          />
        );
      
      default:
        return (
          <WelcomeNew 
            onSignUp={handleSignUp} 
            onSignIn={handleSignIn} 
          />
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderCurrentPage()}
    </div>
  );
}

export default App