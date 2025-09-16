import React from 'react';
import ButtonComp from './ButtonComp';
import ButtonAddComp from './ButtonAddComp';

interface ManagementSubItemsCompProps {
  tabs: string[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  tabTransitioning?: boolean;
}

export default function ManagementSubItemsComp({
  tabs,
  selectedTab,
  onTabChange,
  onAddClick,
  tabTransitioning = false
}: ManagementSubItemsCompProps) {
  return (
    <>
      {/* Items area - 80% width */}
      <div 
        className="content-stretch flex h-full items-center justify-start min-h-0 min-w-0 relative shrink-0" 
        style={{ flex: '8', gap: '2vw', paddingLeft: '2vw' }} 
        data-name="Items" 
        data-node-id="184:4014"
      >
        {tabs.map((tab) => (
          <ButtonComp
            key={tab}
            label={tab}
            isSelected={selectedTab === tab}
            onClick={() => {
              if (selectedTab !== tab) {
                onTabChange(tab);
              }
            }}
          />
        ))}
      </div>
      
      {/* Function area - 20% width */}
      <div 
        className="content-stretch flex h-full items-center justify-end min-h-0 min-w-0 relative shrink-0" 
        style={{ flex: '2', paddingRight: '2vw' }} 
        data-name="Function" 
        data-node-id="184:4026"
      >
        <div 
          className="relative shrink-0" 
          style={{ width: 'clamp(2rem, 4vw, 2.5rem)', height: 'clamp(2rem, 4vw, 2.5rem)' }} 
          data-name="Vector" 
          data-node-id="184:4027"
        >
          <ButtonAddComp onClick={onAddClick} />
        </div>
      </div>
    </>
  );
}