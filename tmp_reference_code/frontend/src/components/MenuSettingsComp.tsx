import React from 'react';
import SettingComp from './SettingComp';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface MenuSettingsCompProps {
  categories: Category[];
  onSave?: (menuName: string, selectedCategoryId: string, menuDescription: string, menuPrice: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  initialName?: string;
  initialCategoryId?: string;
  initialDescription?: string;
  initialPrice?: string;
}

export default function MenuSettingsComp({ 
  categories = [],
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  initialName = '', 
  initialCategoryId = '',
  initialDescription = '',
  initialPrice = ''
}: MenuSettingsCompProps) {
  // Convert categories to dropdown options
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const fields = [
    {
      key: 'name',
      type: 'text' as const,
      name: 'Name',
      placeholder: 'eg. Kimchi Fried Rice',
      description: 'Please write the name of the menu item.',
      initialValue: initialName,
      required: true
    },
    {
      key: 'description',
      type: 'text' as const,
      name: 'Menu Description',
      placeholder: 'eg. Spicy fried rice with kimchi and vegetables',
      description: 'Please write a description of the menu item.',
      initialValue: initialDescription,
      required: false
    },
    {
      key: 'price',
      type: 'formatted-number' as const,
      name: 'Menu Price',
      placeholder: 'eg. 15,000',
      description: 'Please enter the price of the menu item (numbers only).',
      initialValue: initialPrice,
      required: false
    },
    {
      key: 'categoryId',
      type: 'dropdown' as const,
      name: 'Category',
      placeholder: 'Select a category',
      description: 'Select the category where this menu item belongs.',
      options: categoryOptions,
      initialValue: initialCategoryId,
      required: true
    }
  ];

  const handleSave = (values: Record<string, any>) => {
    onSave?.(values.name, values.categoryId, values.description, values.price);
  };

  return (
    <SettingComp
      fields={fields}
      onSave={handleSave}
      onCancel={onCancel}
      onDelete={onDelete}
      isEditMode={isEditMode}
      settingsName="Menu"
    />
  );
}