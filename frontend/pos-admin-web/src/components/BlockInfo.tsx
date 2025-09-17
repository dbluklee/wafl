import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import infoIcon from '../assets/HomePage/Info.svg';

interface BlockInfoProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockInfo({ onClick, enableFlip, backContent }: BlockInfoProps) {
  return (
    <BlockSmallComp
      icon={infoIcon}
      alt="Info"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}