import React from 'react';

interface BlockPromoCompProps {
  imageUrl: string;
  alt: string;
  dataName?: string;
}

export default function BlockPromoComp({ 
  imageUrl,
  alt,
  dataName = "BlockPromotion"
}: BlockPromoCompProps) {
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{ 
        backgroundColor: 'var(--deep-dark)',
        borderRadius: '2.25rem', // 36px converted to rem
        boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' // Inner shadow + subtle border
      }}
      data-name={dataName}
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
      <div 
        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat" 
        data-name={`${dataName.toLowerCase()}-image`}
        style={{ 
          backgroundImage: `url('${imageUrl}')`,
          borderRadius: '2.25rem' // Match container border radius
        }}
      />
    </div>
  );
}