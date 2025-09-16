import React, { useState } from 'react';
import InputColor, { tableColors } from './InputColorComp';
import InputText from './InputTextComp';
import InputDropdown from './InputDropdownComp';
import ButtonsSetComp from './ButtonsSetComp';

// Define input field types
type InputFieldType = 'text' | 'color' | 'dropdown' | 'formatted-number';

interface DropdownOption {
  value: string;
  label: string;
}

interface InputField {
  key: string;
  type: InputFieldType;
  name: string;
  placeholder?: string;
  description?: string;
  options?: DropdownOption[]; // Only for dropdown type
  initialValue?: string | number;
  required?: boolean;
}

interface SettingCompProps {
  fields: InputField[];
  onSave?: (values: Record<string, any>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  settingsName?: string; // e.g., "Place", "Category", "Table", "Menu"
}

export default function SettingComp({
  fields,
  onSave,
  onCancel,
  onDelete,
  isEditMode = false,
  settingsName = "Item"
}: SettingCompProps) {
  // Initialize state with initial values
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach(field => {
      if (field.type === 'color') {
        initialValues[field.key] = field.initialValue || 0;
      } else {
        initialValues[field.key] = field.initialValue || '';
      }
    });
    return initialValues;
  });

  const handleSave = () => {
    // Convert color index to color value for color fields
    const processedValues = { ...fieldValues };
    fields.forEach(field => {
      if (field.type === 'color') {
        processedValues[field.key] = tableColors[fieldValues[field.key] || 0];
      }
    });
    onSave?.(processedValues);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const updateFieldValue = (key: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  // Check if form is valid (all required fields have values)
  const isFormValid = () => {
    return fields.every(field => {
      if (!field.required) return true;
      const value = fieldValues[field.key];
      if (field.type === 'text' || field.type === 'formatted-number') {
        return typeof value === 'string' && value.trim().length > 0;
      }
      if (field.type === 'dropdown') {
        return value && value !== '';
      }
      return true; // Color selector always has a value
    });
  };

  const renderField = (field: InputField) => {
    switch (field.type) {
      case 'text':
        return (
          <InputText
            key={field.key}
            name={field.name}
            value={fieldValues[field.key] || ''}
            onChange={(value) => updateFieldValue(field.key, value)}
            placeholder={field.placeholder}
            description={field.description}
            className="w-full"
          />
        );

      case 'formatted-number':
        return (
          <InputText
            key={field.key}
            name={field.name}
            value={fieldValues[field.key] || ''}
            onChange={(value) => updateFieldValue(field.key, value)}
            placeholder={field.placeholder}
            description={field.description}
            className="w-full"
            type="formatted-number"
          />
        );

      case 'color':
        return (
          <InputColor
            key={field.key}
            selectedColorIndex={fieldValues[field.key] || 0}
            onColorSelect={(index) => updateFieldValue(field.key, index)}
            title={field.name}
            description={field.description}
          />
        );

      case 'dropdown':
        return (
          <InputDropdown
            key={field.key}
            name={field.name}
            value={fieldValues[field.key] || ''}
            options={field.options || []}
            placeholder={field.placeholder}
            description={field.description}
            onChange={(value) => updateFieldValue(field.key, value)}
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2.5 items-start justify-between w-full h-full px-[0.25rem]" data-name={`${settingsName}Settings`}>
      <div className="flex flex-col items-start justify-start w-full" style={{ gap: '3vh' }} data-name="InspectorArea">
        {fields.map(renderField)}
      </div>

      <div className="h-10 shrink-0 w-full" data-name="gap" />
      
      {/* Button Set - Save/Cancel and Delete */}
      <div className="flex justify-center w-full">
        <ButtonsSetComp
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          isEditMode={isEditMode}
          disabled={!isFormValid()}
        />
      </div>
    </div>
  );
}