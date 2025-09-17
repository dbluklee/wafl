import React, { useState } from 'react';
import arrowIcon from '../assets/Common/arrow.svg';

interface BlockHighlightCompProps {
  intro?: string;
  title?: string;
  onClick?: () => void;
}

export default function BlockHighlightComp({ 
  intro = "Intro", 
  title = "HighlightTile",
  onClick
}: BlockHighlightCompProps) {
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
      data-name="HighlightBlock" 
      data-node-id="132:631"
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
          gap: 'clamp(0.25rem, 1vmin, 0.5rem)',
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
        
        {/* BlockTextTitle with BlockHighlight style and gradient */}
        <div 
          className="FontStyleBlockHighlight w-full flex-shrink-0 overflow-hidden"
          data-name="BlockTextTitle"
          data-node-id="108:224"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            maxWidth: '100%',
            width: '100%',
            maxHeight: '100%'
          }}
        >
          {title}
        </div>
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