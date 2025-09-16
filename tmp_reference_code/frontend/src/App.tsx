import { useState, useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import ManagementPage from './pages/ManagementPage';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import type { PageType } from './types/navigation';
import { enterFullscreen, exitFullscreen, isFullscreen } from './utils/fullscreen';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [pageHistory, setPageHistory] = useState<PageType[]>(['welcome']);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState<PageType>('welcome');
  const [isInFullscreen, setIsInFullscreen] = useState(false);
  

  // Apply Mode-1 class to body for color variables
  useEffect(() => {
    document.body.classList.add('Mode-1');
    return () => {
      document.body.classList.remove('Mode-1');
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInFullscreen(isFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const navigateTo = async (page: PageType, requestFullscreen: boolean = false) => {
    // Enter fullscreen mode for auth pages if requested and not already in fullscreen
    if (requestFullscreen && !isInFullscreen) {
      try {
        await enterFullscreen();
        setIsInFullscreen(true);
      } catch (error) {
        console.log('Fullscreen request failed - user may need to interact first');
      }
    }
    
    // Regular fade transition
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentPage(page);
      setDisplayPage(page);
      setPageHistory(prev => [...prev, page]);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 25);
    }, 150);
  };

  const goBack = async () => {
    if (pageHistory.length > 1) {
      setIsTransitioning(true);
      
      // Only exit fullscreen when actually going back to welcome page
      const newHistory = pageHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      
      if (previousPage === 'welcome' && isFullscreen()) {
        try {
          await exitFullscreen();
        } catch (error) {
          console.log('Failed to exit fullscreen');
        }
      }
      
      // Fade out
      setTimeout(() => {
        setPageHistory(newHistory);
        setCurrentPage(previousPage);
        setDisplayPage(previousPage);
        
        // Fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 25);
      }, 150);
    }
  };

  const resetToWelcome = async () => {
    setIsTransitioning(true);
    
    // Exit fullscreen when returning to welcome
    if (isFullscreen()) {
      try {
        await exitFullscreen();
      } catch (error) {
        console.log('Failed to exit fullscreen');
      }
    }
    
    // Fade out
    setTimeout(() => {
      setCurrentPage('welcome');
      setDisplayPage('welcome');
      setPageHistory(['welcome']);
      
      // Fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 25);
    }, 150);
  };

  // Navigation handlers with fullscreen for auth pages
  const handleSignUp = () => navigateTo('signup', true);
  const handleSignIn = () => navigateTo('signin', true);
  const handleSignUpComplete = () => {
    // Keep fullscreen mode when going to homepage after auth
    navigateTo('homepage');
  };
  const handleSignInComplete = () => {
    // Keep fullscreen mode when going to homepage after auth
    navigateTo('homepage');
  };
  const handleSignOut = () => resetToWelcome();
  const handleManagement = () => navigateTo('management');
  const handleHome = () => navigateTo('homepage');

  // Render current page
  const renderCurrentPage = () => {
    switch (displayPage) {
      case 'welcome':
        return (
          <WelcomePage 
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
            onManagement={handleManagement}
          />
        );
      
      case 'management':
        return (
          <ManagementPage 
            onBack={goBack}
            onSignOut={handleSignOut}
            onHome={handleHome}
          />
        );
      
      default:
        return (
          <WelcomePage 
            onSignUp={handleSignUp} 
            onSignIn={handleSignIn} 
          />
        );
    }
  };

  // Show normal app flow
  // return <ComponentShowcasePage />;
  
  return (
    <div className="w-full h-full">
      <div 
        className={`w-full h-full transition-opacity duration-150 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;