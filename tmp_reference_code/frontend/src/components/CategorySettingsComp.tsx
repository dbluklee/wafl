import React from 'react';
import SettingComp from './SettingComp';

interface CategorySettingsCompProps {
  onSave?: (categoryName: string, selectedColor: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  initialName?: string;
  initialColorIndex?: number;
}

export default function CategorySettingsComp({ 
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  initialName = '', 
  initialColorIndex = 0
}: CategorySettingsCompProps) {
  const fields = [
    {
      key: 'name',
      type: 'text' as const,
      name: 'Name',
      placeholder: 'eg. Main Dishes',
      description: 'Please write the name of the category for menu items.',
      initialValue: initialName,
      required: true
    },
    {
      key: 'color',
      type: 'color' as const,
      name: 'Color',
      description: 'On the category card, select a card color to easily distinguish categories.',
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
      settingsName="Category"
    />
  );
}