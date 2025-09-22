import React from 'react';
import Logs from './LogsComp';
import SettingInspector from './SettingInspectorComp';

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: string;
}

import type { Place, Table, Category, Menu } from '@wafl/api-client';

// Extended types for UI management (adding computed fields)
interface PlaceWithTableCount extends Place {
  tableCount: number;
}

interface PanelContentCompProps {
  isAddMode: boolean;
  selectedTab: string;
  logEntries: LogEntry[];
  onLogUndo: (logId: number) => void;
  onSave?: (name: string, selectedColor: string, storeNumber?: string, userPin?: string, placeId?: string, description?: string, price?: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  editingPlace?: PlaceWithTableCount | null;
  editingTable?: Table | null;
  editingCategory?: Category | null;
  editingMenu?: Menu | null;
  places?: PlaceWithTableCount[];
  categories?: Category[];
  selectedPlace?: PlaceWithTableCount | null;
  selectedCategory?: Category | null;
}

export default function PanelContentComp({
  isAddMode,
  selectedTab,
  logEntries,
  onLogUndo,
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
}: PanelContentCompProps) {
  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-0 overflow-hidden" data-name="PanelContent">
      {isAddMode ? (
        <SettingInspector
          selectedTab={selectedTab}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
          isEditMode={isEditMode}
          editingPlace={editingPlace}
          editingTable={editingTable}
          editingCategory={editingCategory}
          editingMenu={editingMenu}
          places={places}
          categories={categories}
          selectedPlace={selectedPlace}
          selectedCategory={selectedCategory}
        />
      ) : (
        <Logs
          logEntries={logEntries}
          onLogUndo={onLogUndo}
        />
      )}
    </div>
  );
}