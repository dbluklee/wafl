import React, { useState, useEffect, useRef } from 'react';
import signUpImage from '../assets/SignUpPage/SignUpImage.jpg';

interface SignUpImageCompProps {
  className?: string;
}

export default function SignUpImageComp({ className }: SignUpImageCompProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
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

  // Calculate optimal image sizing based on container dimensions
  const aspectRatio = containerSize.width / containerSize.height;
  const isMobileAspect = aspectRatio < 1; // Portrait mode
  
  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center ${className || ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        minHeight: 0,
        minWidth: 0
      }}
    >
      <img 
        src={signUpImage}
        alt="Sign Up"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          transition: 'transform 0.3s ease-in-out',
          transform: `scale(${Math.max(1, Math.min(1.1, aspectRatio / 1.5))})`,
        }}
      />
      
      {/* Responsive overlay gradient for better text readability on mobile */}
      {isMobileAspect && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}