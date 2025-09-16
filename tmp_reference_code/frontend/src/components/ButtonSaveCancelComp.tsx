import React from 'react';
import ButtonComp from './ButtonComp';

interface ButtonSaveCancelCompProps {
  cancelLabel?: string;
  saveLabel?: string;
  onCancel?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ButtonSaveCancelComp({
  cancelLabel = "Cancel",
  saveLabel = "Save",
  onCancel,
  onSave,
  isLoading = false,
  disabled = false
}: ButtonSaveCancelCompProps) {
  return (
    <div 
      className="flex" 
      style={{ 
        gap: '2vw',
        paddingTop: 'clamp(0.5rem, 1vh, 1rem)' 
      }}
    >
      <ButtonComp 
        label={cancelLabel}
        onClick={onCancel}
        className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[5rem]"
        disabled={isLoading}
      />
      <ButtonComp 
        label={saveLabel}
        onClick={onSave}
        isSelected={true}
        className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[5rem]"
        disabled={disabled || isLoading}
      />
    </div>
  );
}