import React, { useState, useEffect, useRef } from 'react';
import CardComp from './CardComp';
import type { CardType } from './CardComp';
import { getCSSVariable } from './InputColorComp';

interface CardItem {
  id: string;
  name: string;
  color: string;
  cardData: Record<string, string>; // Structured data: Category={'menuQty':'3'}, Menu={'price':'30000','description':'good food'}, Place={'tableQty':'2'}, Table={'person':'4'}
  sortOrder?: number;
}

interface CardGridCompProps {
  type?: CardType;
  items: CardItem[]; // Renamed from 'items' to be more generic
  onCardClick: (item: CardItem) => void;
  onCardLongPress?: (item: CardItem) => void;
  onCardReorder?: (reorderedItems: CardItem[]) => void;
  onEditCancel?: () => void;
  editingItemId?: string | null; // Single editing ID instead of multiple editing objects
  isTransitioning?: boolean;
  animatingCardId?: string | null;
  isEditMode?: boolean;
}

export default function CardGridComp({ 
  type = "Place", // Default to Place type
  items, 
  onCardClick, 
  onCardLongPress, 
  onCardReorder,
  onEditCancel,
  editingItemId = null,
  isTransitioning = false, 
  animatingCardId = null, 
  isEditMode = false 
}: CardGridCompProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState(15); // Default 15vw
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  // Long-press detection state
  const longPressRef = useRef<{ timeoutId: number | null; item: CardItem | null }>({ 
    timeoutId: null, 
    item: null 
  });
  
  // Long-press visual feedback state
  const [longPressedCardId, setLongPressedCardId] = useState<string | null>(null);
  const [longPressAnimatingCardId, setLongPressAnimatingCardId] = useState<string | null>(null);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);
  
  // Drag and drop state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedItem: CardItem | null;
    draggedIndex: number;
    targetIndex: number;
    draggedElement: HTMLElement | null;
    startPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
  }>({
    isDragging: false,
    draggedItem: null,
    draggedIndex: -1,
    targetIndex: -1,
    draggedElement: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  });
  
  // Convert vw to pixels for calculations
  const vwToPx = (vw: number) => (vw * window.innerWidth) / 100;
  const pxToVw = (px: number) => (px * 100) / window.innerWidth;
  
  // Calculate optimal card size and layout
  const calculateLayout = () => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    setContainerDimensions({ width: containerWidth, height: containerHeight });
    
    const gapVw = 1; // 1vw gap
    const gapPx = vwToPx(gapVw);
    const totalCards = items.length;
    
    // Try different card sizes from max (20vw) to min (10vw)
    for (let testCardVw = 20; testCardVw >= 10; testCardVw -= 0.5) {
      const cardPx = vwToPx(testCardVw);
      
      // Calculate how many cards fit horizontally
      const cardsPerRow = Math.floor((containerWidth + gapPx) / (cardPx + gapPx));
      
      if (cardsPerRow === 0) continue; // Skip if no cards fit
      
      // Calculate number of rows needed
      const totalRows = Math.ceil(totalCards / cardsPerRow);
      
      // Calculate total height needed
      const totalHeight = (totalRows * cardPx) + ((totalRows - 1) * gapPx);
      
      // If it fits vertically, use this card size
      if (totalHeight <= containerHeight || testCardVw === 10) {
        setCardSize(testCardVw);
        return;
      }
    }
    
    // Fallback to minimum size
    setCardSize(10);
  };
  
  // Update layout on mount and resize
  useEffect(() => {
    calculateLayout();
    
    const handleResize = () => {
      calculateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateLayout();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [items.length]);
  
  // Calculate grid layout
  const gapVw = 1;
  const cardSizeVw = Math.max(10, Math.min(20, cardSize)); // Clamp between 10-20vw
  
  // Drag and drop handlers
  const startDrag = (item: CardItem, index: number, element: HTMLElement, clientX: number, clientY: number) => {
    if (!isEditMode || item.id === 'add') return;
    
    const rect = element.getBoundingClientRect();
    setDragState({
      isDragging: true,
      draggedItem: item,
      draggedIndex: index,
      targetIndex: index,
      draggedElement: element,
      startPosition: { x: clientX, y: clientY },
      currentPosition: { x: clientX, y: clientY }
    });
    
    // Add visual feedback
    element.style.zIndex = '1000';
    element.style.transform = 'scale(1.05)';
    element.style.opacity = '0.9';
  };

  const updateDrag = (clientX: number, clientY: number) => {
    if (!dragState.isDragging || !dragState.draggedElement) return;
    
    const deltaX = clientX - dragState.startPosition.x;
    const deltaY = clientY - dragState.startPosition.y;
    
    // Update dragged element position
    dragState.draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    
    setDragState(prev => ({
      ...prev,
      currentPosition: { x: clientX, y: clientY }
    }));
    
    // Calculate target index based on position
    const gapPx = vwToPx(gapVw);
    const cardPx = vwToPx(cardSizeVw);
    const cardsPerRow = Math.floor((containerDimensions.width + gapPx) / (cardPx + gapPx));
    
    if (cardsPerRow > 0) {
      const row = Math.floor((clientY - containerRef.current!.getBoundingClientRect().top) / (cardPx + gapPx));
      const col = Math.floor((clientX - containerRef.current!.getBoundingClientRect().left) / (cardPx + gapPx));
      const targetIndex = Math.min(Math.max(0, row * cardsPerRow + col), items.length - 1); // Exclude add button
      
      setDragState(prev => ({
        ...prev,
        targetIndex
      }));
    }
  };

  const endDrag = () => {
    if (!dragState.isDragging || !dragState.draggedElement) return;
    
    // Reset visual styles
    dragState.draggedElement.style.zIndex = '';
    dragState.draggedElement.style.transform = '';
    dragState.draggedElement.style.opacity = '';
    
    // Reorder if target index is different
    if (dragState.targetIndex !== dragState.draggedIndex && dragState.targetIndex >= 0) {
      const reorderedItems = [...items.filter(p => p.id !== 'add')]; // Remove add button
      const [draggedItem] = reorderedItems.splice(dragState.draggedIndex, 1);
      reorderedItems.splice(dragState.targetIndex, 0, draggedItem);
      onCardReorder?.(reorderedItems);
    }
    
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedIndex: -1,
      targetIndex: -1,
      draggedElement: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    });
  };
  
  // Long-press handlers
  const startLongPress = (item: CardItem) => {
    if (item.id === 'add') return; // Don't allow long-press on add button
    
    longPressRef.current.item = item;
    setLongPressAnimatingCardId(item.id); // Start the scale animation
    
    longPressRef.current.timeoutId = window.setTimeout(() => {
      // Clear the animation and trigger long press
      setLongPressAnimatingCardId(null);
      setLongPressedCardId(item.id); // This will trigger edit mode visual
      onCardLongPress?.(item);
      
      // Clear the long-pressed state after edit mode is established
      setTimeout(() => {
        setLongPressedCardId(null);
      }, 100);
    }, 1000); // 1000ms long-press duration to match animation
  };

  const cancelLongPress = () => {
    if (longPressRef.current.timeoutId) {
      clearTimeout(longPressRef.current.timeoutId);
      longPressRef.current.timeoutId = null;
      longPressRef.current.item = null;
    }
    // Clear visual feedback when canceling
    setLongPressedCardId(null);
    setLongPressAnimatingCardId(null);
  };

  const handleCardTouchStart = (item: CardItem, index: number) => (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startLongPress(item);
    
    // In edit mode, prepare for potential drag
    if (isEditMode && item.id !== 'add') {
      const element = e.currentTarget as HTMLElement;
      setTimeout(() => {
        // Only start drag if long-press didn't trigger edit mode
        if (longPressRef.current.timeoutId) {
          startDrag(item, index, element, touch.clientX, touch.clientY);
          cancelLongPress();
        }
      }, 1050); // Slightly after long-press timeout
    }
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (dragState.isDragging) {
      e.preventDefault();
      updateDrag(touch.clientX, touch.clientY);
    } else {
      // Cancel long-press if user moves finger before drag starts
      cancelLongPress();
    }
  };

  const handleCardTouchEnd = (item: CardItem) => (e: React.TouchEvent) => {
    if (dragState.isDragging) {
      endDrag();
    } else if (longPressRef.current.timeoutId) {
      // If long-press didn't trigger, treat as normal click
      cancelLongPress();
      
      // If in edit mode and touching a different card (not the one being edited), cancel edit mode
      if (isEditMode && editingItemId && editingItemId !== item.id && item.id !== 'add') {
        onEditCancel?.();
      } else {
        // Trigger click effect
        setClickedCardId(item.id);
        setTimeout(() => setClickedCardId(null), 200);
        onCardClick(item);
      }
    }
  };

  const handleCardMouseDown = (item: CardItem, index: number) => (e: React.MouseEvent) => {
    startLongPress(item);
    
    // In edit mode, prepare for potential drag
    if (isEditMode && item.id !== 'add') {
      const element = e.currentTarget as HTMLElement;
      setTimeout(() => {
        // Only start drag if long-press didn't trigger edit mode
        if (longPressRef.current.timeoutId) {
          startDrag(item, index, element, e.clientX, e.clientY);
          cancelLongPress();
        }
      }, 1050); // Slightly after long-press timeout
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging) {
      e.preventDefault();
      updateDrag(e.clientX, e.clientY);
    }
  };

  const handleCardMouseUp = (item: CardItem) => (e: React.MouseEvent) => {
    if (dragState.isDragging) {
      endDrag();
    } else if (longPressRef.current.timeoutId) {
      cancelLongPress();
      
      // If in edit mode and clicking a different card (not the one being edited), cancel edit mode
      if (isEditMode && editingItemId && editingItemId !== item.id && item.id !== 'add') {
        onEditCancel?.();
      } else {
        // Trigger click effect
        setClickedCardId(item.id);
        setTimeout(() => setClickedCardId(null), 200);
        onCardClick(item);
      }
    }
  };

  const handleCardMouseLeave = () => {
    cancelLongPress();
    if (dragState.isDragging) {
      endDrag();
    }
  };

  // Prevent default touch behaviors while allowing card interactions
  const handleTouchMove = (e: React.TouchEvent) => {
    // Only prevent if not on a card
    const target = e.target as HTMLElement;
    const isCard = target.closest('[data-card]');
    
    if (!isCard) {
      e.preventDefault();
    }
  };

  // Cleanup long-press timeout and drag state on unmount
  useEffect(() => {
    return () => {
      cancelLongPress();
      if (dragState.isDragging) {
        endDrag();
      }
    };
  }, []);
  
  // Global mouse events for drag functionality
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        updateDrag(e.clientX, e.clientY);
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        endDrag();
      }
    };
    
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState.isDragging]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'pan-y' }}
      onTouchMove={handleTouchMove}
    >
      <style>{`
        @keyframes slideInUp {
          0% {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes cardHighlight {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        @keyframes longPressScale {
          0% {
            transform: scale(1);
          }
          80% {
            transform: scale(0.8);
          }
          95% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes editModeGlow {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes clickEffect {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
      <div 
        className={`flex flex-wrap items-start justify-start w-full transition-opacity duration-150 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ gap: `${gapVw}vw` }}
      >
        {items.map((item, index) => {
          const isNewCard = animatingCardId === item.id && !isTransitioning;
          const isDragTarget = isEditMode && dragState.isDragging && dragState.targetIndex === index;
          const isDraggedCard = dragState.isDragging && dragState.draggedItem?.id === item.id;
          const isLongPressed = longPressedCardId === item.id;
          const isLongPressAnimating = longPressAnimatingCardId === item.id;
          const isBeingEdited = editingItemId === item.id;
          const isClicked = clickedCardId === item.id;
          
          return (
            <div
              key={item.id}
              className={`relative flex-shrink-0 transition-all duration-300 ease-out ${
                isNewCard ? 'animate-pulse' : ''
              } ${isEditMode && item.id !== 'add' ? 'cursor-move' : 'cursor-pointer'} ${
                isDragTarget ? 'ring-2 ring-white/50' : ''
              } ${isDraggedCard ? 'pointer-events-none' : ''
              }`}
              style={{
                width: `${cardSizeVw}vw`,
                height: `${cardSizeVw}vw`,
                transform: isNewCard ? 'scale(1.02)' : isDraggedCard ? 'scale(1.05)' : 'scale(1)',
                animation: isNewCard ? 'slideInUp 0.4s ease-out' : isLongPressAnimating ? 'longPressScale 1s ease-in-out' : isClicked ? 'clickEffect 0.2s ease-out' : 'none',
                filter: 'none',
                opacity: isDraggedCard ? '0.9' : (isEditMode && !isBeingEdited && item.id !== 'add') ? '0.5' : '1',
                outline: 'none',
                border: 'none',
                borderRadius: '15%',
                overflow: 'hidden',
              }}
              onTouchStart={handleCardTouchStart(item, index)}
              onTouchEnd={handleCardTouchEnd(item)}
              onTouchMove={handleCardTouchMove}
              onMouseDown={handleCardMouseDown(item, index)}
              onMouseMove={handleCardMouseMove}
              onMouseUp={handleCardMouseUp(item)}
              onMouseLeave={handleCardMouseLeave}
              data-card="true"
            >
              <CardComp
                type={type}
                title={item.name}
                subtitle={
                  type === 'Category'
                    ? `${item.cardData.menuQty || '0'} menus`
                    : type === 'Menu'
                      ? item.cardData.description || ''
                      : type === 'Place'
                        ? `${item.cardData.tableQty || '0'} tables`
                        : type === 'Table'
                          ? `${item.cardData.person || '0'} person`
                          : ''
                }
                subtitle2={type === 'Menu' ? undefined : undefined}
                subtitle3={type === 'Menu' ? `₩${parseInt(item.cardData.price || '0').toLocaleString()}` : undefined}
                color={getCSSVariable(item.color)} // Convert hex color back to CSS variable
                property={item.id === 'add' ? 'Empty' : 'Default'}
                onClick={() => {}} // Disable CardComp's own click handler
                dataName={`${type}Card`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}