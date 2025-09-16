import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import settingsIcon from '../assets/HomePage/settings.svg';

interface BlockSettingProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockSetting({ onClick, enableFlip, backContent }: BlockSettingProps) {
  return (
    <BlockSmallComp
      icon={settingsIcon}
      alt="Settings"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}