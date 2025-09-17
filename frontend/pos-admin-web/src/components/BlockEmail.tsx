import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import mailIcon from '../assets/HomePage/mail.svg';

interface BlockEmailProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockEmail({ onClick, enableFlip, backContent }: BlockEmailProps) {
  return (
    <BlockSmallComp
      icon={mailIcon}
      alt="Email"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}