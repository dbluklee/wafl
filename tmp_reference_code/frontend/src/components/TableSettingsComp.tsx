import React from 'react';
import SettingComp from './SettingComp';
import { placeService, type PlaceData } from '../services/placeService';

interface Place {
  id: string;
  name: string;
  color: string;
}

interface TableSettingsCompProps {
  places: Place[];
  onSave?: (tableName: string, selectedPlaceId: string, diningCapacity: number) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
  initialName?: string;
  initialPlaceId?: string;
  initialDiningCapacity?: number;
}

export default function TableSettingsComp({ 
  places = [],
  onSave, 
  onCancel, 
  onDelete, 
  isEditMode = false, 
  initialName = '', 
  initialPlaceId = '',
  initialDiningCapacity = 4
}: TableSettingsCompProps) {
  const [dynamicPlaces, setDynamicPlaces] = React.useState<Place[]>(places);
  const [loading, setLoading] = React.useState(false);

  // Fetch places dynamically when component mounts
  React.useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const placesData = await placeService.getAllPlaces();
        const mappedPlaces = placesData.map((p: PlaceData) => ({
          id: p.id!.toString(),
          name: p.name,
          color: p.color
        }));
        setDynamicPlaces(mappedPlaces);
      } catch (error) {
        console.error('Failed to fetch places for table settings:', error);
        // Fallback to props places if API fails
        setDynamicPlaces(places);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []); // Only run once when component mounts

  // Convert places to dropdown options
  const placeOptions = dynamicPlaces.map(place => ({
    value: place.id,
    label: place.name
  }));

  const fields = [
    {
      key: 'name',
      type: 'text' as const,
      name: 'Name',
      placeholder: 'eg. Table 1',
      description: 'Please write the name of the table.',
      initialValue: initialName,
      required: true
    },
    {
      key: 'diningCapacity',
      type: 'text' as const,
      name: 'Dining Capacity',
      placeholder: 'eg. 4',
      description: 'Number of people this table can accommodate.',
      initialValue: initialDiningCapacity.toString(),
      required: true
    },
    {
      key: 'placeId',
      type: 'dropdown' as const,
      name: 'Place',
      placeholder: loading ? 'Loading places...' : 'Select a place',
      description: 'Select the place where this table will be located.',
      options: placeOptions,
      initialValue: initialPlaceId,
      required: true
    }
  ];

  const handleSave = (values: Record<string, any>) => {
    const diningCapacity = parseInt(values.diningCapacity) || 4;
    onSave?.(values.name, values.placeId, diningCapacity);
  };

  return (
    <SettingComp
      fields={fields}
      onSave={handleSave}
      onCancel={onCancel}
      onDelete={onDelete}
      isEditMode={isEditMode}
      settingsName="Table"
    />
  );
}