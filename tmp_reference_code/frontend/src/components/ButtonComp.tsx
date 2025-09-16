import React, { useState, useRef } from 'react';

interface ButtonCompProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'default' | 'delete';
  onDelete?: () => void;
}

export default function ButtonComp({ 
  label, 
  isSelected = false, 
  onClick, 
  className = "",
  style,
  disabled = false,
  type = 'default',
  onDelete
}: ButtonCompProps) {
  // Delete button state management
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentSwipeDistance = useRef(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const maxSwipeDistance = 62;
  const deleteThreshold = 30;

  // Event handlers for delete button
  const handleStart = (clientX: number) => {
    if (disabled || type !== 'delete') return;
    
    console.log('🗑️ Delete button handleStart', { isSwipeActive, clientX });
    
    // Always start dragging immediately - no two-step process needed
    setIsSwipeActive(true);
    startX.current = clientX;
    setIsDragging(true);
    console.log('🗑️ Starting immediate drag from position:', clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || type !== 'delete') return;
    const distance = clientX - startX.current;
    const newDistance = Math.max(0, Math.min(distance, maxSwipeDistance));
    console.log('🗑️ Swipe move', { clientX, startX: startX.current, distance, newDistance, currentSwipeDistance: swipeDistance });
    currentSwipeDistance.current = newDistance;
    setSwipeDistance(newDistance);
  };

  const handleEnd = () => {
    if (!isDragging || disabled || type !== 'delete') return;
    
    // Use the ref value which is always current, not the potentially stale state
    const finalDistance = currentSwipeDistance.current;
    setIsDragging(false);
    
    console.log('🗑️ Delete swipe ended. Distance:', finalDistance, 'State distance:', swipeDistance, 'Threshold:', deleteThreshold);
    if (finalDistance >= deleteThreshold) {
      console.log('🗑️ Swipe threshold reached, calling onDelete');
      onDelete?.();
      currentSwipeDistance.current = 0;
      setSwipeDistance(0);
      setIsSwipeActive(false);
    } else {
      console.log('🗑️ Swipe threshold not reached, snapping back');
      currentSwipeDistance.current = 0;
      setSwipeDistance(0);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (type === 'delete') {
      e.preventDefault();
      e.stopPropagation();
      handleStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (type === 'delete') {
      handleMove(e.touches[0].clientX);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (type === 'delete') {
      handleEnd();
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (type === 'delete') {
      e.preventDefault();
      e.stopPropagation();
      handleStart(e.clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (type === 'delete') {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (type === 'delete') {
      handleEnd();
    }
  };

  // Global mouse events
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && type === 'delete') {
        handleMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging && type === 'delete') {
        handleEnd();
      }
    };

    if (isDragging && type === 'delete') {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, type]);

  // Click outside to cancel
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSwipeActive && !isDragging && type === 'delete' && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsSwipeActive(false);
        setSwipeDistance(0);
      }
    };

    if (isSwipeActive && type === 'delete') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSwipeActive, isDragging, type]);

  return (
    <div 
      ref={buttonRef}
      className={`box-border content-stretch flex items-center justify-center overflow-hidden relative shrink-0 h-full rounded-[1.25rem] ${
        disabled 
          ? 'cursor-not-allowed opacity-50' 
          : (type === 'delete' && isSwipeActive) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer active:scale-95'
        } ${
        isSelected 
          ? 'bg-[rgba(255,255,255,0.1)] border-[0.1rem] border-[var(--grey)]' 
          : ''
        } ${className}`}
      style={{ 
        height: '100%', 
        maxHeight: '2rem',
        ...style }}
      onClick={disabled ? undefined : (type === 'delete' ? undefined : onClick)}
      onTouchStart={type === 'delete' ? handleTouchStart : undefined}
      onTouchMove={type === 'delete' ? handleTouchMove : undefined}
      onTouchEnd={type === 'delete' ? handleTouchEnd : undefined}
      onMouseDown={type === 'delete' ? handleMouseDown : undefined}
      onMouseMove={type === 'delete' ? handleMouseMove : undefined}
      onMouseUp={type === 'delete' ? handleMouseUp : undefined}
      data-name="ButtonBody"
    >
      {type === 'delete' ? (
        // DeleteItem for delete type buttons
        <div 
          className="box-border content-stretch flex items-center justify-center overflow-hidden relative shrink-0 h-full"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: isSwipeActive ? 'clamp(0.1rem, 0.05vw, 0.4rem) 0.25rem' : 'clamp(0.2rem, 0.5vw, 0.4rem) clamp(0.8rem, 2.4vw, 2rem)',
            width: '8vw' // Fixed width for DeleteItem
          }}
          data-name="DeleteItem"
        >
          {isSwipeActive ? (
            // SwipeStatus state - pink box and 'swipe' text
            <div 
              className="flex items-center justify-start relative transition-all duration-200 ease-out w-full h-full" 
              style={{ 
                transform: `translateX(${swipeDistance}px)`,
                gap: '0.5vw'
              }}
            >
              {/* Pink rounded box for swiping */}
              <div 
                className="rounded-full flex items-start justify-center shrink-0 "
                style={{ 
                  backgroundColor: swipeDistance >= deleteThreshold ? '#e91e63' : '#fac2d9',
                  height: '90%',
                  width: '30%',
                  minWidth: '1.5rem',
                  aspectRatio: '1'
                }}
              />
              
              {/* Swipe text */}
              <span 
                className="font-['Pretendard'] font-medium text-[14px] text-white whitespace-nowrap"
              >
                {swipeDistance >= deleteThreshold ? 'Release!' : 'Swipe'}
              </span>
            </div>
          ) : (
            // Default state - just 'Delete' text
            <div 
              className="FontStyleButtonItemText bg-clip-text flex flex-col justify-center leading-[1] not-italic relative shrink-0 text-center"
              style={{ color: 'var(--light)' }}
            >
              <span>Delete</span>
            </div>
          )}
        </div>
      ) : (
        // Default ButtonItem for non-delete buttons
        <div 
          className={`box-border content-stretch flex items-center justify-center overflow-hidden relative shrink-0 h-full`}
          style={{ 
            padding: 'clamp(0.2rem, 0.6vw, 0.4rem) clamp(0.8rem, 2.4vw, 2rem)' 
          }}
          data-name="ButtonItem"
        >
          <div 
            className="FontStyleButtonItemText bg-clip-text flex flex-col justify-center leading-[1] not-italic relative shrink-0 text-center"
            style={{ color: 'var(--light)' }}
            data-name="ButtonItemInner"
          >
            <span>{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}