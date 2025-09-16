import React from 'react';

// Color palette using CSS variables
const tableColors = [
  'var(--table-color-1)',
  'var(--table-color-2)', 
  'var(--table-color-3)',
  'var(--table-color-4)',
  'var(--table-color-5)',
  'var(--table-color-6)',
  'var(--table-color-7)',
  'var(--table-color-8)'
];

// Mapping CSS variables to hex colors for database storage
const tableColorHexMap: Record<string, string> = {
  'var(--table-color-1)': '#FF6B6B',
  'var(--table-color-2)': '#4ECDC4',
  'var(--table-color-3)': '#45B7D1',
  'var(--table-color-4)': '#96CEB4',
  'var(--table-color-5)': '#FECA57',
  'var(--table-color-6)': '#FF9FF3',
  'var(--table-color-7)': '#54A0FF',
  'var(--table-color-8)': '#5F27CD'
};

// Helper function to convert CSS variable to hex color
export const getHexColor = (cssVariable: string): string => {
  return tableColorHexMap[cssVariable] || cssVariable;
};

// Helper function to convert hex color back to CSS variable
export const getCSSVariable = (hexColor: string): string => {
  const entry = Object.entries(tableColorHexMap).find(([_, hex]) => hex === hexColor);
  return entry ? entry[0] : hexColor;
};

interface ColorSelectorCompProps {
  selectedColorIndex: number;
  onColorSelect: (index: number) => void;
  title?: string;
  description?: string;
}

export default function InputColorComp({ 
  selectedColorIndex, 
  onColorSelect,
  title = "Color",
  description = "On the table card, select a card color to easily distinguish places."
}: ColorSelectorCompProps) {
  return (
    <div className="box-border flex flex-col gap-[0.2rem] w-full items-start" data-name="ColorSelector">
      {/* Title */}
      <div className="FontStyleSubTitle text-white not-italic">
        {title}
      </div>
      
      {/* Color Palette - the area with color circles */}
      <div 
        className="flex items-center justify-center bg-transparent overflow-hidden" 
        style={{ 
          minHeight: '100px',
          width: '80%',
          padding: 'clamp(0.5rem, 1vw, 1.5rem)' 
        }} 
        data-name="ColorPalette"
      >
        <div className="flex flex-col w-full" style={{ gap: 'clamp(0.8rem, 3vh, 1.5rem)' }}>
          {/* First Row */}
          <div className="flex items-center justify-around relative w-full" style={{ gap: 'clamp(0.4rem, 0.8vw, 0.6rem)' }} data-name="Colors1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="rounded-full cursor-pointer transition-all flex-shrink-0 relative"
                style={{ 
                  backgroundColor: tableColors[index],
                  width: 'clamp(1.5rem, 4vw, 2.2rem)',
                  aspectRatio: '1',
                  boxShadow: selectedColorIndex === index 
                    ? '0 8px 25px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.9)' 
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: selectedColorIndex === index ? 'scale(1.15) translateZ(0)' : 'scale(1)',
                  zIndex: selectedColorIndex === index ? 10 : 1
                }}
                onClick={() => onColorSelect(index)}
              >
              </div>
            ))}
          </div>
          {/* Second Row */}
          <div className="flex items-center justify-around relative w-full" style={{ gap: 'clamp(0.4rem, 0.8vw, 0.6rem)' }} data-name="Colors2">
            {[4, 5, 6, 7].map((index) => (
              <div
                key={index}
                className="rounded-full cursor-pointer flex-shrink-0 relative"
                style={{ 
                  backgroundColor: tableColors[index],
                  width: 'clamp(1.5rem, 4vw, 2.2rem)',
                  aspectRatio: '1',
                  boxShadow: selectedColorIndex === index 
                    ? '0 8px 25px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.9)' 
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: selectedColorIndex === index ? 'scale(1.15) translateZ(0)' : 'scale(1)',
                  zIndex: selectedColorIndex === index ? 10 : 1
                }}
                onClick={() => onColorSelect(index)}
              >
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Description */}
      {description && (
        <div className="FontStyleDisclaimer text-[#e0e0e0] not-italic">
          {description}
        </div>
      )}
    </div>
  );
}

// Export the table colors for use in parent components
export { tableColors };