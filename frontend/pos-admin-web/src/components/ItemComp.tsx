import React from 'react';

interface ItemCompProps {
  label: string;
}

function ItemComp({ label }: ItemCompProps) {
  return (
    <div className="box-border flex items-center justify-center overflow-clip relative rounded-[0.3rem] shrink-0" data-name="Item" style={{ height: 'auto', width: 'auto', minWidth: 'fit-content', padding: '0.1rem 0.4rem', backgroundColor: 'var(--table-color-8)' }}>
      <div className="flex flex-col font-['Pretendard'] justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontSize: '0.6rem', color: 'var(--dark)' }}>
        <span className="leading-[normal] whitespace-pre">{label}</span>
      </div>
    </div>
  );
}

export default ItemComp;