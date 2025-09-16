import React from 'react';
import ButtonComp from './ButtonComp';
import ButtonSaveCancelComp from './ButtonSaveCancelComp';

interface ButtonsSetCompProps {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  disabled?: boolean;
}

export default function ButtonsSetComp({ 
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  disabled = false 
}: ButtonsSetCompProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full" data-name="SetButtons">
      {/* Save/Cancel Buttons */}
      <ButtonSaveCancelComp 
        onSave={onSave}
        onCancel={onCancel}
        saveLabel="SAVE"
        cancelLabel="CANCEL"
        disabled={disabled}
      />
      
      {/* Delete Button - Only show in edit mode with 2vh gap */}
      {isEditMode && (
        <>
          <div className="shrink-0 w-full" style={{ height: '2vh' }} data-name="gap" />
          <div className="box-border flex flex-col items-center justify-center overflow-clip p-[10px] shrink-0 w-full" data-name="DeleteArea">
            <ButtonComp 
              label="Delete"
              type="delete"
              onDelete={onDelete}
              disabled={disabled}
              isSelected={true}
              className="h-[clamp(2.5rem,4vh,3.5rem)] min-w-[5rem]"
            />
          </div>
        </>
      )}
    </div>
  );
}