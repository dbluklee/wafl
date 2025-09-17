import React, { useState } from 'react';
import arrowIcon from '../assets/Common/arrow.svg';

interface BlockCompProps {
  intro?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
}

export default function BlockComp({ intro, title, description, onClick }: BlockCompProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (onClick) {
      setIsPressed(true);
      // Wait for the click animation to be visible, then trigger navigation
      setTimeout(() => {
        onClick();
        // Reset pressed state after navigation starts (during fade out)
        setTimeout(() => {
          setIsPressed(false);
        }, 200);
      }, 300);
    }
  };

  return (
    <div 
      className={`relative w-full h-full flex flex-col overflow-hidden ${onClick ? 'cursor-pointer transition-all duration-500 ease-out' : ''} ${isPressed ? 'scale-95' : ''}`}
      style={{ 
        backgroundColor: 'var(--deep-dark)',
        borderRadius: '2.25rem', // 36px converted to rem
        boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' // Inner shadow + subtle border
      }}
      onClick={handleClick}
      data-name="Block" 
      data-node-id="108:231"
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
      {/* BlockText - Centered in Block */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center text-center w-full h-full overflow-hidden"
        style={{ 
          padding: '2.5rem 4.5rem 4rem 2.5rem', // Extra right and bottom padding to avoid arrow
          gap: '0.5rem',
          maxHeight: '100%',
          boxSizing: 'border-box'
        }}
        data-name="BlockText" 
        data-node-id="108:222"
      >
        {/* BlockTextIntro */}
        {intro && (
          <div 
            className="FontStyleBlockText w-full"
            data-name="BlockTextIntro"
            data-node-id="108:223"
            style={{
              color: 'var(--grey)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
              width: '100%'
            }}
          >
            {intro}
          </div>
        )}
        
        {/* BlockTextTitle */}
        <div 
          className="FontStyleBlockTitle w-full flex-shrink-0"
          data-name="BlockTextTitle"
          data-node-id="108:224"
          style={{
            color: 'var(--white)',
            lineHeight: '1.1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            maxWidth: '100%',
            width: '100%'
          }}
        >
          {title}
        </div>
        
        {/* BlockTextDesc */}
        {description && (
          <div 
            className="FontStyleBlockText w-full"
            data-name="BlockTextDesc"
            data-node-id="108:225"
            style={{
              color: 'var(--grey)',
              lineHeight: '1.3',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
              width: '100%'
            }}
          >
            {description}
          </div>
        )}
      </div>
      
      {/* Arrow positioned at bottom-right */}
      <div className="absolute bottom-[0.1rem] right-[0.1rem] z-10 opacity-50">
        <img 
          alt="" 
          className="block" 
          src={arrowIcon} 
            style={{ 
              transform: 'scale(0.6)', 
              transformOrigin: 'bottom right'
            }} 
        />
      </div>
    </div>
  );
}