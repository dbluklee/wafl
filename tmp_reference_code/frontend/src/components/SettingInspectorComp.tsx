import React from 'react';
import PlaceSettings from './PlaceSettingsComp';
import TableSettings from './TableSettingsComp';
import CategorySettings from './CategorySettingsComp';
import MenuSettings from './MenuSettingsComp';
import { tableColors, getCSSVariable } from './InputColorComp';

interface Place {
  id: string;
  storeNumber: string;
  name: string;
  color: string;
  tableCount: number;
  userPin: string;
  createdAt: Date;
}

interface Table {
  id: string;
  placeId: string;
  name: string;
  color: string;
  positionX: number;
  positionY: number;
  diningCapacity: number;
  storeNumber: string;
  userPin: string;
  createdAt: Date;
}

interface Category {
  id: string;
  storeNumber: string;
  name: string;
  color: string;
  menuCount: number;
  userPin: string;
  sortOrder: number;
  createdAt: Date;
}

interface Menu {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price?: string;
  storeNumber: string;
  userPin: string;
  createdAt: Date;
}

interface SettingInspectorCompProps {
  selectedTab: string;
  onSave?: (name: string, selectedColor: string, storeNumber?: string, userPin?: string, placeId?: string, description?: string, price?: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  editingPlace?: Place | null;
  editingTable?: Table | null;
  editingCategory?: Category | null;
  editingMenu?: Menu | null;
  places?: Place[];
  categories?: Category[];
  selectedPlace?: Place | null;
  selectedCategory?: Category | null;
}

export default function SettingInspectorComp({ 
  selectedTab, 
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  editingPlace = null,
  editingTable = null,
  editingCategory = null,
  editingMenu = null,
  places = [],
  categories = [],
  selectedPlace = null,
  selectedCategory = null
}: SettingInspectorCompProps) {
  // Based on the selected tab, render the appropriate settings component
  // For now, we only have PlaceSettings, but this can be extended for Table, Category, Menu
  
  const renderSettings = () => {
    switch (selectedTab.toLowerCase()) {
      case 'place':
        return (
          <PlaceSettings
            onSave={(placeName: string, selectedColor: string) => 
              onSave?.(placeName, selectedColor, editingPlace?.storeNumber || '', editingPlace?.userPin || '')
            }
            onCancel={onCancel}
            onDelete={onDelete}
            isEditMode={isEditMode}
            initialName={editingPlace?.name || ''}
            initialColorIndex={editingPlace ? 
              (() => {
                // Convert hex color back to CSS variable, then find its index
                const cssVariable = getCSSVariable(editingPlace.color);
                const colorIndex = tableColors.indexOf(cssVariable);
                return colorIndex >= 0 ? colorIndex : 0;
              })()
              : 0
            }
          />
        );
      case 'table':
        return (
          <TableSettings
            places={places}
            onSave={(tableName: string, selectedPlaceId: string, diningCapacity: number) => {
              // Get the selected place's color to use for the table
              const selectedPlace = places.find(p => p.id === selectedPlaceId);
              const placeColor = selectedPlace?.color || '#FF6B6B'; // fallback color
              onSave?.(tableName, placeColor, editingTable?.storeNumber || '', editingTable?.userPin || '', selectedPlaceId, undefined, undefined, diningCapacity);
            }}
            onCancel={onCancel}
            onDelete={onDelete}
            isEditMode={isEditMode}
            initialName={editingTable?.name || ''}
            initialPlaceId={editingTable?.placeId || selectedPlace?.id || ''}
            initialDiningCapacity={editingTable?.diningCapacity || 4}
          />
        );
      case 'category':
        return (
          <CategorySettings
            onSave={(categoryName: string, selectedColor: string) => 
              onSave?.(categoryName, selectedColor, editingCategory?.storeNumber || '', editingCategory?.userPin || '')
            }
            onCancel={onCancel}
            onDelete={onDelete}
            isEditMode={isEditMode}
            initialName={editingCategory?.name || ''}
            initialColorIndex={editingCategory ? 
              (() => {
                // Convert hex color back to CSS variable, then find its index
                const cssVariable = getCSSVariable(editingCategory.color);
                const colorIndex = tableColors.indexOf(cssVariable);
                return colorIndex >= 0 ? colorIndex : 0;
              })()
              : 0
            }
          />
        );
      case 'menu':
        return (
          <MenuSettings
            categories={categories}
            onSave={(menuName: string, selectedCategoryId: string, menuDescription: string, menuPrice: string) => 
              onSave?.(menuName, '', editingMenu?.storeNumber || '', editingMenu?.userPin || '', selectedCategoryId, menuDescription, menuPrice)
            }
            onCancel={onCancel}
            onDelete={onDelete}
            isEditMode={isEditMode}
            initialName={editingMenu?.name || ''}
            initialCategoryId={editingMenu?.categoryId || selectedCategory?.id || ''}
            initialDescription={editingMenu?.description || ''}
            initialPrice={editingMenu?.price || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden" data-name="SettingInspector">
      {renderSettings()}
    </div>
  );
}