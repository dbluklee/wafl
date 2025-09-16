import React from 'react';
import addCardIcon from '../assets/Common/add-card.svg';

interface ButtonAddCompProps {
  onClick?: () => void;
  className?: string;
}

export default function ButtonAddComp({ onClick, className = "" }: ButtonAddCompProps) {
  return (
    <div 
      className={`content-stretch flex flex-col items-center justify-center relative size-full cursor-pointer transition-transform duration-150 ease-out active:scale-90 hover:scale-105 ${className}`} 
      data-name="AddButton" 
      data-node-id="261:1423"
      onClick={onClick}
    >
      <div className="overflow-clip relative shrink-0" style={{ width: '70%', height: '70%' }} data-name="Icon / AddCard" data-node-id="261:1420">
        <div className="absolute inset-[8.333%]" data-name="Vector" id="node-I261_1420-1_1401">
          <div className="absolute inset-[-5%]" style={{ "--stroke-0": "rgba(224, 224, 224, 1)" } as React.CSSProperties}>
            <img alt="" className="block max-w-none size-full" src={addCardIcon} />
          </div>
        </div>
      </div>
    </div>
  );
}