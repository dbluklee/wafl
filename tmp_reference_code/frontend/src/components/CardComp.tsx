import React from 'react';

export type CardType = "Category" | "Menu" | "Place" | "Table";

export interface CardCompProps {
  type?: CardType;
  title: string;
  subtitle?: string;
  subtitle2?: string;
  subtitle3?: string;
  color: string;
  property?: "Default" | "Empty" | "Selected";
  onClick?: () => void;
  dataName?: string;
}

export default function CardComp({ 
  type,
  title, 
  subtitle,
  subtitle2,
  subtitle3,
  color,
  property = "Default",
  onClick,
  dataName = "Card"
}: CardCompProps) {
  
  // Format subtitle based on card type
  const getFormattedSubtitle = () => {
    if (!subtitle) return null;
    
    switch (type) {
      case "Category":
        return `${subtitle}`;
      case "Place":
        return `${subtitle}`;
      default:
        return subtitle;
    }
  };
  
  const formattedSubtitle = getFormattedSubtitle();
  const formattedSubtitle2 = subtitle2;
  
  // Empty state - dashed border
  if (property === "Empty") {
    return (
      <div 
        className="relative rounded-[2.25rem] w-full h-full cursor-pointer"
        onClick={onClick}
        data-name={`${dataName}-Empty`}
      >
        <div 
          aria-hidden="true" 
          className="absolute border-2 border-[#2d2d2d] border-dashed inset-0 pointer-events-none rounded-[2.25rem] opacity-30" 
        />
      </div>
    );
  }

  // Selected state - with inner shadow
  if (property === "Selected") {
    return (
      <div 
        className="box-border flex flex-col items-start justify-end relative w-full h-full cursor-pointer transition-all duration-200"
        style={{ 
          backgroundColor: color,
          boxShadow: 'inset 4px 10px 10px 0px rgba(45, 45, 45, 0.3)',
          padding: '15%',
          gap: '8%',
          borderRadius: '15%'
        }}
        onClick={onClick}
        data-name={`${dataName}-Selected`}
      >
        <div className="flex flex-col items-start justify-start relative w-full" style={{ gap: '8%' }}>
          <div className="flex flex-col items-start justify-end relative w-full">
            <div className="FontStyleTitle overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--dark, #2d2d2d)', fontSize: '1.5em' }}>
              {title}
            </div>
          </div>
          {formattedSubtitle && (
            <div className="box-border flex flex-col items-start justify-end relative w-full">
              <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
                {formattedSubtitle}
              </div>
            </div>
          )}
          {formattedSubtitle2 && (
            <div className="box-border flex flex-col items-start justify-end relative w-full">
              <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
                {formattedSubtitle2}
              </div>
            </div>
          )}
          {subtitle3 && (
            <div className="box-border flex flex-col items-start justify-end relative w-full">
              <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
                {subtitle3}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default state
  return (
    <div 
      className="box-border flex flex-col items-start justify-end relative w-full h-full cursor-pointer"
      style={{ 
        backgroundColor: color,
        padding: '15%',
        gap: '8%',
        borderRadius: '15%'
      }}
      onClick={onClick}
      data-name={`${dataName}-Default`}
    >
      <div className="flex flex-col items-start justify-start relative w-full" style={{ gap: '8%' }}>
        <div className="flex flex-col items-start justify-end relative w-full">
          <div className="FontStyleTitle overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--dark, #2d2d2d)', fontSize: '1.5em' }}>
            {title}
          </div>
        </div>
        {formattedSubtitle && (
          <div className="box-border flex flex-col items-start justify-end relative w-full">
            <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
              {formattedSubtitle}
            </div>
          </div>
        )}
        {formattedSubtitle2 && (
          <div className="box-border flex flex-col items-start justify-end relative w-full">
            <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
              {formattedSubtitle2}
            </div>
          </div>
        )}
        {subtitle3 && (
          <div className="box-border flex flex-col items-start justify-end relative w-full">
            <div className="FontStyleDisclaimer overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#555555', fontSize: '0.75em' }}>
              {subtitle3}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}