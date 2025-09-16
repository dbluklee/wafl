import React from 'react';

interface PanelHeaderCompProps {
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PanelHeaderComp({ title, className = "", style }: PanelHeaderCompProps) {
  return (
    <div 
      className={`box-border content-stretch flex items-center justify-start overflow-hidden px-[0.25rem] pt-[1rem] relative shrink-0 w-full ${className}`} 
      style={{ 
        height: 'clamp(2.5rem, 6vh, 3.5rem)', 
        ...style }} 
      data-name="PanelHeader" 
      data-node-id="184:4067"
    >
      <div 
        className="box-border content-stretch flex items-center justify-start overflow-hidden px-[0.25rem] py-[0.25rem] relative rounded-[1rem] shrink-0 h-full" 
        data-name="PanelLabel" 
        data-node-id="184:4068"
      >
        <div 
          className="FontStyleTitle flex flex-col justify-center leading-[1.2] not-italic relative shrink-0 text-center text-nowrap text-white " 
          data-node-id="184:4069"
        >
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}