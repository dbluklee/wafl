import React, { useState } from 'react';

interface BlockSmallCompProps {
  icon?: string;
  alt?: string;
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockSmallComp({ 
  icon, 
  alt = "Icon",
  onClick,
  enableFlip = false,
  backContent
}: BlockSmallCompProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (enableFlip) {
      setIsFlipped(!isFlipped);
    } else if (onClick) {
      onClick();
    }
  };
  return (
    <div 
      className={`relative w-full h-full ${enableFlip || onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        perspective: '1000px',
      }}
      onClick={handleClick}
      data-name="BlockSmall" 
      data-node-id="132:339"
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 w-full h-full flex flex-col overflow-hidden"
          style={{ 
            backgroundColor: 'var(--deep-dark)',
            borderRadius: '2.25rem',
            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Subtle border overlay */}
          <div 
            aria-hidden="true" 
            className="absolute inset-0 pointer-events-none" 
            style={{
              borderRadius: '2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          />
          {/* Icon centered in Block */}
          <div 
            className="absolute inset-0 flex items-center justify-center w-full h-full z-10"
            style={{ 
              padding: '1.125rem',
              boxSizing: 'border-box'
            }}
          >
            <img 
              alt={alt}
              className="block object-contain"
              src={icon}
              style={{ 
                height: '30%',
                width: '30%',
                objectFit: 'contain',
                filter: icon?.endsWith('.svg') 
                  ? 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
                  : 'none'
              }}
            />
          </div>
        </div>

        {/* Back Side */}
        {enableFlip && backContent && (
          <div 
            className="absolute inset-0 w-full h-full flex flex-col justify-center items-center overflow-hidden"
            style={{ 
              backgroundColor: 'var(--deep-dark)',
              borderRadius: '2.25rem',
              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: '1rem',
              boxSizing: 'border-box',
            }}
          >
            {/* Subtle border overlay */}
            <div 
              aria-hidden="true" 
              className="absolute inset-0 pointer-events-none" 
              style={{
                borderRadius: '2.25rem',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            />
            {/* Back content */}
            <div className="text-center z-10">
              {backContent.storeNumber && (
                <div className="mb-2">
                  <div className="text-xs text-white/60 mb-1">Store #</div>
                  <div className="text-sm text-white font-medium">{backContent.storeNumber}</div>
                </div>
              )}
              {backContent.userPin && (
                <div>
                  <div className="text-xs text-white/60 mb-1">User PIN</div>
                  <div className="text-sm text-white font-medium">{backContent.userPin}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}