import React from 'react';
import BlockSmallComp from './BlockSmallComp';
import languagesIcon from '../assets/HomePage/languages.svg';

interface BlockLanguageProps {
  onClick?: () => void;
  enableFlip?: boolean;
  backContent?: {
    storeNumber?: string;
    userPin?: string;
  };
}

export default function BlockLanguage({ onClick, enableFlip, backContent }: BlockLanguageProps) {
  return (
    <BlockSmallComp
      icon={languagesIcon}
      alt="Language"
      onClick={onClick}
      enableFlip={enableFlip}
      backContent={backContent}
    />
  );
}