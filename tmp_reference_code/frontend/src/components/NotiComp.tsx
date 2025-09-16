import React from 'react';

interface NotiCompProps {
  title: string;
  description: string;
}

export default function NotiComp({ title, description }: NotiCompProps) {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden relative w-full" style={{ gap: 'clamp(0.75rem, 2.5vh, 1.5rem)' }} data-name="Noti">
      <div className="flex flex-col items-center justify-center overflow-hidden relative w-full" data-name="NotiTitle">
        <div className="FontStyleTitle flex flex-col justify-center leading-[1.2] not-italic relative text-center text-white">
          <span>{title}</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center overflow-hidden relative w-full" data-name="NotiDesc">
        <div className="FontStyleText flex flex-col justify-center leading-[1.2] not-italic relative text-center" style={{ color: '#555555' }}>
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}