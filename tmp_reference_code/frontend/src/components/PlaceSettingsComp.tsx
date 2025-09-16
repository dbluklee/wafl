import React from 'react';
import SettingComp from './SettingComp';

interface PlaceSettingsCompProps {
  onSave?: (placeName: string, selectedColor: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  initialName?: string;
  initialColorIndex?: number;
}

export default function PlaceSettingsComp({ 
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  initialName = '', 
  initialColorIndex = 0
}: PlaceSettingsCompProps) {
  const fields = [
    {
      key: 'name',
      type: 'text' as const,
      name: 'Name',
      placeholder: 'eg. 1st floor',
      description: 'Please write the name of the space where you want to install the tables.',
      initialValue: initialName,
      required: true
    },
    {
      key: 'color',
      type: 'color' as const,
      name: 'Color',
      description: 'On the table card, select a card color to easily distinguish places.',
      initialValue: initialColorIndex,
      required: false
    }
  ];

  const handleSave = (values: Record<string, any>) => {
    onSave?.(values.name, values.color);
  };

  return (
    <SettingComp
      fields={fields}
      onSave={handleSave}
      onCancel={onCancel}
      onDelete={onDelete}
      isEditMode={isEditMode}
      settingsName="Place"
    />
  );
}