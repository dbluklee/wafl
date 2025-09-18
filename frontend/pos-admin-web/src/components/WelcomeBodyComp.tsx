import React from 'react';
import ButtonComp from './ButtonComp';
import { enterFullscreen } from '../utils/helpers';

interface WelcomeBodyCompProps {
  intro: string;
  title: string;
  description: string;
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function WelcomeBodyComp({ intro, title, description, onSignUp, onSignIn }: WelcomeBodyCompProps) {
  const handleSignUpClick = async () => {
    try {
      await enterFullscreen();
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
    }
    onSignUp?.();
  };

  const handleSignInClick = async () => {
    try {
      await enterFullscreen();
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
    }
    onSignIn?.();
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-start p-4"
      data-name="WelcomeBody"
    >
      <div
        className="mb-[0.3vh] text-[clamp(1.5rem,4vw,3rem)] font-bold text-gray-400 leading-[0.9]"
        data-name="WelcomeBodyTitle"
      >
        <span>{intro}</span>
      </div>
      <div
        className="mb-[5vh] text-[clamp(2rem,6vw,4rem)] font-bold text-white leading-[0.9]"
        data-name="WelcomeBodySubtitle"
      >
        <span>{title}</span>
      </div>
      <div
        className="mb-[10vh] text-[clamp(0.8rem,1.5vw,1.2rem)] text-gray-400 max-w-[50vw]"
        data-name="WelcomeBodyDesc"
      >
        <span>{description}</span>
      </div>
      <div
        className="flex gap-[2vw] flex-wrap"
        data-name="WelcomeBodyButtons"
      >
        <ButtonComp
          label="Sign Up"
          onClick={handleSignUpClick}
          isSelected={true}
          className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[8rem]"
        />
        <ButtonComp
          label="Sign In"
          onClick={handleSignInClick}
          isSelected={true}
          className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[8rem]"
        />
      </div>
    </div>
  );
}