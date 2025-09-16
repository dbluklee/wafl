import React from 'react';
import ButtonComp from './ButtonComp';

interface WelcomeBodyCompProps {
  intro: string;
  title: string;
  description: string;
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function WelcomeBodyComp({ intro, title, description, onSignUp, onSignIn }: WelcomeBodyCompProps) {
  return (
    <div 
      className="w-[40vw] h-full flex flex-col justify-center items-start p-4"
      data-name="WelcomeBody"
    >
      <div 
        className="mb-2 text-[clamp(1.5rem,4vw,3rem)] font-bold text-gray-400"
        data-name="WelcomeBodyTitle"
      >
        <span>{intro}</span>
      </div>
      <div 
        className="mb-4 text-[clamp(2rem,6vw,4rem)] font-bold text-white"
        data-name="WelcomeBodySubtitle"
      >
        <span>{title}</span>
      </div>
      <div 
        className="mb-10 text-[clamp(0.8rem,1.5vw,1.2rem)] text-gray-400 max-w-[60ch]"
        data-name="WelcomeBodyDesc"
      >
        <span>{description}</span>
      </div>
      <div 
        className="flex gap-8 flex-wrap"
        data-name="WelcomeBodyButtons"
      >
        <ButtonComp 
          label="Sign Up" 
          onClick={onSignUp}
          isSelected={true}
          className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[8rem]"
        />
        <ButtonComp 
          label="Sign In" 
          onClick={onSignIn}
          isSelected={true}
          className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[8rem]"
        />
      </div>
    </div>
  );
}