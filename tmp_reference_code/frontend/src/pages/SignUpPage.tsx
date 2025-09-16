import React, { useState, useEffect } from 'react';
import SignUpImageComp from '../components/SignUpImageComp';
import SignUpComp from '../components/SignUpComp';

interface SignUpPageProps {
  onBack?: () => void;
  onSignUpComplete?: () => void;
}

export default function SignUpPage({ onBack, onSignUpComplete }: SignUpPageProps) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic layout based on screen size
  const isMobile = dimensions.width < 600;
  const isTablet = dimensions.width >= 600 && dimensions.width < 1200;

  return (
    <div 
      className="flex overflow-hidden"
      style={{ 
        width: '100vw',
        height: isTablet ? '100svh' : '100vh', // Use small viewport height on tablets
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#000000'
      }}
    >
      {/* Dynamic Layout based on screen size */}
      {isMobile ? (
        // Mobile: Stack vertically
        <div className="w-full h-full flex flex-col">
          {/* Top: SignUpImage - 40% height */}
          <div className="w-full" style={{ height: '40%' }}>
            <SignUpImageComp />
          </div>
          
          {/* Bottom: SignUpComp - 60% height */}
          <div className="w-full" style={{ height: '60%' }}>
            <SignUpComp onBack={onBack} onSignUpComplete={onSignUpComplete} />
          </div>
        </div>
      ) : (
        // Desktop/Tablet: Side by side
        <div className="w-full h-full flex">
          {/* Left Side: SignUpImage */}
          <div 
            className="h-full"
            style={{ 
              width: isTablet ? '35%' : '50%', // Give more space to form on tablets
              transition: 'width 0.3s ease-in-out'
            }}
          >
            <SignUpImageComp />
          </div>
          
          {/* Right Side: SignUpComp */}
          <div 
            className="h-full flex flex-col"
            style={{ 
              width: isTablet ? '65%' : '50%', // Match the adjusted width
              backgroundColor: '#000000',
              transition: 'width 0.3s ease-in-out',
              padding: isTablet ? 'clamp(0.25rem, 0.5vh, 0.75rem)' : 'clamp(1rem, 2vw, 2rem)',
              minHeight: 0
            }}
          >
            <div 
              className="flex-1 overflow-hidden"
              style={{ 
                width: '100%',
                maxWidth: isTablet ? '500px' : '600px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}
            >
              <SignUpComp onBack={onBack} onSignUpComplete={onSignUpComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}