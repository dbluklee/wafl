import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import signOutIcon from '../assets/HomePage/sign-out.svg';

interface BlockSignOutProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockSignOut({ onClick, enableFlip, backContent }: BlockSignOutProps) {
  return (
    <BlockSmallComp
      icon={signOutIcon}
      alt="Sign Out"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}