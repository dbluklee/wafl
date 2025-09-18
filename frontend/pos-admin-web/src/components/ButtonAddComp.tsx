import React from 'react';

interface ButtonAddCompProps {
  onClick?: () => void;
  className?: string;
}

// SVG as data URL for add card icon
const addCardSvg = `data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10V30M10 20H30" stroke="%23E0E0E0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
            <img alt="" className="block max-w-none size-full" src={addCardSvg} />
          </div>
        </div>
      </div>
    </div>
  );
}