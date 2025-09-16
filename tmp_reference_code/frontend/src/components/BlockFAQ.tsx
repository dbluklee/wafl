import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import helpIcon from '../assets/HomePage/help.svg';

interface BlockFAQProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockFAQ({ onClick, enableFlip, backContent }: BlockFAQProps) {
  return (
    <BlockSmallComp
      icon={helpIcon}
      alt="FAQ"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}