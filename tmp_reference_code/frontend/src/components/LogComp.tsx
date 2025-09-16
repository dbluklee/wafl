import React, { useState, useRef, useEffect } from 'react';
import Item from './ItemComp';
import undoIcon from '../assets/Common/undo.svg';

interface LogCompProps {
  time: string;
  text: string;
  itemLabel?: string;
  property1?: "Default" | "Undo";
  onUndo?: () => void;
  isActiveUndo?: boolean;
  onSlideStateChange?: (isInUndoMode: boolean) => void;
  isUndoable?: boolean;
}

function LogComp({ time, text, itemLabel, property1: externalProperty1, onUndo, isActiveUndo, onSlideStateChange, isUndoable = true }: LogCompProps) {
  // Extract management items from text
  const extractManagementItems = (logText: string | undefined) => {
    const items: string[] = [];
    let cleanedText = logText || '';
    
    // First, extract items in {{label}} format (highest priority)
    const bracketRegex = /\{\{([^}]+)\}\}/g;
    const bracketMatches = cleanedText ? [...cleanedText.matchAll(bracketRegex)] : [];
    if (bracketMatches.length > 0) {
      bracketMatches.forEach(match => {
        items.push(match[1]); // Extract content inside {{}}
        cleanedText = cleanedText.replace(match[0], '').trim();
      });
    }
    
    // Extract specific place names (ending with "floor")
    const placeRegex = /\b(\w+\s+floor)\b/gi;
    const placeMatches = cleanedText.match(placeRegex);
    if (placeMatches) {
      items.push(...placeMatches);
      cleanedText = cleanedText.replace(placeRegex, '').trim();
    }
    
    // Extract table names (starting with "Table" followed by numbers/letters)
    const tableRegex = /\b(Table\w*)\b/gi;
    const tableMatches = cleanedText.match(tableRegex);
    if (tableMatches) {
      items.push(...tableMatches);
      cleanedText = cleanedText.replace(tableRegex, '').trim();
    }
    
    // Extract general management keywords
    const managementKeywords = ['Place', 'Category', 'Menu'];
    managementKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = cleanedText.match(regex);
      if (matches) {
        items.push(...matches);
        cleanedText = cleanedText.replace(regex, '').trim();
      }
    });
    
    // Clean up extra spaces
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    return { items, cleanedText };
  };
  
  const { items: extractedItems, cleanedText } = extractManagementItems(text);
  const displayItems = itemLabel ? [itemLabel, ...extractedItems] : extractedItems;
  const [slideDistance, setSlideDistance] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  
  // Use external control for undo mode
  const isUndoMode = isActiveUndo;
  
  // Reset slide distance when this log is no longer the active undo log
  useEffect(() => {
    if (!isActiveUndo && slideDistance > 0) {
      setSlideDistance(0);
    }
  }, [isActiveUndo, slideDistance]);
  
  // Determine which property1 to use - external control or external prop
  const property1 = isUndoMode ? "Undo" : (externalProperty1 || "Default");
  
  const handleStart = (clientX: number) => {
    if (!isUndoable) return; // Don't start dragging if not undoable
    startX.current = clientX;
    isDragging.current = true;
  };
  
  const handleMove = (clientX: number) => {
    if (!isDragging.current || !isUndoable) return; // Don't move if not undoable
    const distance = clientX - startX.current;
    // Allow sliding right to reveal undo icon, clamp between 0 and the undo icon width (64px)
    const newDistance = Math.max(0, Math.min(distance, 64));
    setSlideDistance(newDistance);
    
    // Notify parent when entering undo mode
    if (newDistance > 0 && !isUndoMode) {
      onSlideStateChange?.(true);
    }
  };
  
  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Snap behavior: if slid more than a small threshold (16px), snap to full reveal
    if (slideDistance > 16) {
      setSlideDistance(64);
      // Already in undo mode, no need to notify again
    } else {
      setSlideDistance(0);
      // Notify parent when exiting undo mode
      if (isUndoMode) {
        onSlideStateChange?.(false);
      }
    }
  };
  
  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    handleEnd();
  };
  
  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
    e.preventDefault(); // Prevent text selection
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };
  
  const handleMouseUp = () => {
    handleEnd();
  };
  
  // Global mouse event listeners for when dragging outside the element
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleMove(e.clientX);
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        handleEnd();
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  
  if (property1 === "Undo") {
    return (
      <div className="relative w-full min-h-[60px] overflow-hidden" data-name="Property 1=Undo" data-node-id="256:2909">
        {/* Bottom layer: Static undo icon with grey background - MUST stay fixed */}
        <div 
          className="absolute left-0 top-0 flex items-center justify-center cursor-pointer shrink-0 min-h-[60px] rounded-l-[0.3rem] z-0" 
          data-name="Undo" 
          data-node-id="256:2910"
          onClick={() => {
            onUndo?.();
            setSlideDistance(0);
            onSlideStateChange?.(false);
          }}
          style={{ 
            width: '4rem', 
            backgroundColor: '#666666', // Grey background
            height: '100%',
            transform: 'translateX(0px)' // Explicitly prevent any transformation
          }}
        >
          <div className="overflow-clip relative shrink-0" data-name="Icon / Undo2" data-node-id="256:2911" style={{ width: '3rem', height: '3rem' }}>
            <div className="absolute" style={{ inset: '16.667%' }} data-name="Vector">
              <div className="absolute" style={{ inset: '-6.25%' }}>
                <img alt="Undo" className="block max-w-none size-full" src={undoIcon} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Top layer: Log content that slides right to reveal undo icon */}
        <div 
          className="box-border flex items-center justify-start absolute top-0 left-0 rounded-[0.3rem] w-full min-h-[60px] py-4 transition-transform duration-300 ease-in-out cursor-grab active:cursor-grabbing z-10" 
          data-name="LogContent" 
          data-node-id="256:2912" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            backgroundColor: 'var(--dark)', 
            gap: '0.6rem', 
            padding: '1rem 1rem', 
            boxShadow: '0px 0.4rem 0.4rem 0px inset rgba(0,0,0,0.25)',
            transform: `translateX(${slideDistance}px)`,
            height: '100%',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div 
            aria-hidden="true" 
            className="absolute inset-0 pointer-events-none rounded-[0.3rem]" 
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0))',
              padding: '0.1rem'
            }}
          >
            <div className="w-full h-full rounded-[0.3rem]" style={{ backgroundColor: 'transparent' }} />
          </div>
          <div className="flex items-center justify-center overflow-clip relative shrink-0 z-10" data-name="Time" data-node-id="256:2913" style={{ gap: '0.6rem', width: '3rem', padding: '0 0.25rem' }}>
            <div className="FontStyleText flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" data-node-id="256:2914" style={{ color: 'var(--light)' }}>
              <p className="leading-[normal] whitespace-pre">{time}</p>
            </div>
          </div>
          <div className="flex-1 relative z-10 w-full FontStyleText" data-name="Text" data-node-id="256:2915" style={{ padding: '0 0.5rem', color: 'var(--light)', lineHeight: '1.2' }}>
            <div className="leading-[1.2] break-words w-full" style={{ margin: 0 }}>
              {displayItems.length > 0 && (
                <>
                  {displayItems.map((item, index) => (
                    <span key={index} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'top' }}>
                      <Item label={item} />
                    </span>
                  ))}
                </>
              )}
              <span style={{ display: 'inline' }}>{cleanedText}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full min-h-[60px] overflow-hidden" data-name="Property 1=Default" data-node-id="256:2907">
      {/* Bottom layer: Static undo icon with grey background - only show when sliding and undoable */}
      {isUndoMode && isUndoable && (
        <div 
          className="absolute left-0 top-0 flex items-center justify-center cursor-pointer shrink-0 min-h-[60px] rounded-l-[0.3rem] z-0" 
          data-name="Undo" 
          data-node-id="256:2910"
          onClick={() => {
            onUndo?.();
            setSlideDistance(0);
            onSlideStateChange?.(false);
          }}
          style={{ 
            width: '4rem', 
            backgroundColor: '#666666', // Grey background
            height: '100%',
            transform: 'translateX(0px)' // Explicitly prevent any transformation
          }}
        >
          <div className="overflow-clip relative shrink-0" data-name="Icon / Undo2" data-node-id="256:2911" style={{ width: '3rem', height: '3rem' }}>
            <div className="absolute" style={{ inset: '16.667%' }} data-name="Vector">
              <div className="absolute" style={{ inset: '-6.25%' }}>
                <img alt="Undo" className="block max-w-none size-full" src={undoIcon} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Top layer: Log content that can slide right */}
      <div 
        className="box-border flex items-center justify-start absolute top-0 left-0 rounded-[0.3rem] w-full min-h-[60px] py-4 transition-transform duration-300 ease-in-out cursor-grab active:cursor-grabbing z-10" 
        data-name="LogContent" 
        data-node-id="256:2677" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          backgroundColor: 'var(--dark)', 
          gap: '0.6rem', 
          padding: '1rem 1rem', 
          boxShadow: '0px 0.4rem 0.4rem 0px inset rgba(0,0,0,0.25)',
          transform: `translateX(${slideDistance}px)`,
          height: '100%',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none rounded-[0.3rem]" 
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0))',
            padding: '0.1rem'
          }}
        >
          <div className="w-full h-full rounded-[0.3rem]" style={{ backgroundColor: 'transparent' }} />
        </div>
        <div className="flex items-center justify-center overflow-clip relative shrink-0 z-10" data-name="Time" data-node-id="256:2678" style={{ gap: '0.6rem', width: '3rem', padding: '0 0.25rem' }}>
          <div className="FontStyleText flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" data-node-id="256:2679" style={{ color: 'var(--light)' }}>
            <p className="leading-[normal] whitespace-pre">{time}</p>
          </div>
        </div>
        <div className="flex-1 relative z-10 w-full FontStyleText" data-name="Text" data-node-id="256:2680" style={{ padding: '0 0.5rem', color: 'var(--light)', lineHeight: '1.2' }}>
          <div className="leading-[1.2] break-words w-full" style={{ margin: 0 }}>
            {displayItems.length > 0 && (
              <>
                {displayItems.map((item, index) => (
                  <span key={index} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'top' }}>
                    <Item label={item} />
                  </span>
                ))}
              </>
            )}
            <span style={{ display: 'inline' }}>{cleanedText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogComp;