import React from 'react';
import ButtonComp from '../components/ButtonComp';
import ButtonAddComp from '../components/ButtonAddComp'; 
import Noti from '../components/NotiComp';
import PanelContent from '../components/PanelContentComp';
import PanelHeaderComp from '../components/PanelHeaderComp';
import CardGrid from '../components/CardGridComp';
import ManagementItemsComp from '../components/ManagementItemsComp';
import ManagementSubItemsComp from '../components/ManagementSubItemsComp';
import { tableColors, getHexColor, getCSSVariable } from '../components/InputColorComp';
import { useLogging } from '../hooks/useLogging';
import SyncStatus from '../components/SyncStatus';
import { 
  placeServiceWithLogging,
  tableServiceWithLogging,
  categoryServiceWithLogging,
  menuServiceWithLogging,
  placeService,
  tableService,
  categoryService,
  menuService
} from '../services/crudService';
import type { PlaceData } from '../services/placeService';
import type { TableData } from '../services/tableService';
import type { CategoryData } from '../services/categoryService';
import type { MenuData } from '../services/menuService';

// Icon components as SVG strings (from Figma assets)
const homeIconSvg = `data:image/svg+xml,<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 28L40 8L70 28V68C70 69.1046 69.1046 70 68 70H12C10.8954 70 10 69.1046 10 68V28Z" stroke="%23E0E0E0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 70V40H50V70" stroke="%23E0E0E0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const plusIconSvg = `data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10V30M10 20H30" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const undoIconSvg = `data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 14L4 9L9 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 20V13A4 4 0 0 0 16 9H4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

interface ManagementPageProps {
  onBack?: () => void;
  onSignOut?: () => void;
  onHome?: () => void;
}



interface Place {
  id: string;
  storeNumber: string;
  name: string;
  color: string;
  tableCount: number;
  userPin: string;
  sortOrder: number;
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
  sortOrder: number;
  createdAt: Date;
}

export default function ManagementPage({ onBack, onSignOut, onHome }: ManagementPageProps) {
  const [selectedTab, setSelectedTab] = React.useState('Place');
  const [isAddMode, setIsAddMode] = React.useState(false);
  const [cardsTransitioning, setCardsTransitioning] = React.useState(false);
  const [animatingCardId, setAnimatingCardId] = React.useState<string | null>(null);
  const [tabTransitioning, setTabTransitioning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  // Card editing mode state
  const [isCardEditMode, setIsCardEditMode] = React.useState(false);
  const [editingPlace, setEditingPlace] = React.useState<Place | null>(null);
  const [editingTable, setEditingTable] = React.useState<Table | null>(null);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [editingMenu, setEditingMenu] = React.useState<Menu | null>(null);
  
  // Use the logging system
  const { 
    logs, 
    isLoading: logsLoading, 
    undoLog,
    logCustomerArrival,
    logUserSignIn,
    forceSyncNow,
    syncStatus,
    refreshPlacesData
  } = useLogging();
  
  const [savedPlaces, setSavedPlaces] = React.useState<Place[]>([]);
  const [savedTables, setSavedTables] = React.useState<Table[]>([]);
  const [savedCategories, setSavedCategories] = React.useState<Category[]>([]);
  const [savedMenus, setSavedMenus] = React.useState<Menu[]>([]);
  
  // Table management specific states
  const [selectedPlace, setSelectedPlace] = React.useState<Place | null>(null);
  
  // Menu management specific states  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  
  // Load places from the server
  const loadPlaces = React.useCallback(async () => {
    try {
      setLoading(true);
      const placesData = await placeService.getAllPlaces();
      const mappedPlaces = placesData.map((p: PlaceData) => ({
        id: p.id!.toString(),
        storeNumber: p.store_number,
        name: p.name,
        color: p.color,
        tableCount: p.table_count,
        userPin: p.user_pin,
        sortOrder: p.sort_order || 0,
        createdAt: new Date(p.created_at!)
      }));
      setSavedPlaces(mappedPlaces);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load tables from the server
  const loadTables = React.useCallback(async () => {
    try {
      setLoading(true);
      const tablesData = await tableService.getAllTables();
      const mappedTables = tablesData.map((t: TableData) => ({
        id: t.id!.toString(),
        placeId: t.place_id.toString(),
        name: t.name,
        color: t.color,
        storeNumber: t.store_number,
        userPin: t.user_pin,
        createdAt: new Date(t.created_at!)
      }));
      setSavedTables(mappedTables);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load tables for a specific place
  const loadTablesByPlace = React.useCallback(async (placeId: number) => {
    try {
      setLoading(true);
      const tablesData = await tableService.getTablesByPlace(placeId);
      const mappedTables = tablesData.map((t: TableData) => ({
        id: t.id!.toString(),
        placeId: t.place_id.toString(),
        name: t.name,
        color: t.color,
        storeNumber: t.store_number,
        userPin: t.user_pin,
        createdAt: new Date(t.created_at!)
      }));
      setSavedTables(mappedTables);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load categories from the server
  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getAllCategories();
      const mappedCategories = categoriesData.map((c: CategoryData) => ({
        id: c.id!.toString(),
        storeNumber: c.store_number,
        name: c.name,
        color: c.color,
        menuCount: c.menu_count,
        userPin: c.user_pin,
        sortOrder: c.sort_order || 0,
        createdAt: new Date(c.created_at!)
      }));
      setSavedCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load menus for a specific category
  const loadMenusByCategory = React.useCallback(async (categoryId: number) => {
    try {
      setLoading(true);
      const menusData = await menuService.getMenusByCategory(categoryId);
      const mappedMenus = menusData.map((m: MenuData) => ({
        id: m.id!.toString(),
        categoryId: m.category_id.toString(),
        name: m.name,
        description: m.description,
        price: m.price.toString(),
        storeNumber: m.store_number,
        userPin: m.user_pin,
        sortOrder: m.sort_order || 0,
        createdAt: new Date(m.created_at!)
      }));
      setSavedMenus(mappedMenus);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load places and categories from the server on component mount
  React.useEffect(() => {
    loadPlaces();
    loadCategories();
  }, [loadPlaces, loadCategories]);
  
  // Auto-select first place when places are loaded and we're on Table tab
  React.useEffect(() => {
    if (selectedTab === 'Table' && savedPlaces.length > 0 && !selectedPlace) {
      const firstPlace = savedPlaces[0];
      setSelectedPlace(firstPlace);
      loadTablesByPlace(parseInt(firstPlace.id));
    }
  }, [savedPlaces, selectedTab]);
  
  // Auto-select first category when categories are loaded and we're on Menu tab
  React.useEffect(() => {
    if (selectedTab === 'Menu' && savedCategories.length > 0 && !selectedCategory) {
      const firstCategory = savedCategories[0];
      setSelectedCategory(firstCategory);
    }
  }, [savedCategories, selectedTab]);
  
  // Load menus when selectedCategory changes
  React.useEffect(() => {
    if (selectedCategory) {
      loadMenusByCategory(parseInt(selectedCategory.id));
    }
  }, [selectedCategory, loadMenusByCategory]);
  
  // Function to get appropriate notification message based on selected tab
  const getNotiMessage = (tab: string) => {
    switch (tab.toLowerCase()) {
      case 'place':
        return {
          title: 'There are no places at all.',
          description: 'Press the + on the top right to add one!!'
        };
      case 'table':
        return {
          title: 'There are no tables at all.',
          description: 'Press the + on the top right to add one!!'
        };
      case 'category':
        return {
          title: 'There are no categories at all.',
          description: 'Press the + on the top right to add one!!'
        };
      case 'menu':
        return {
          title: 'There are no menus at all.',
          description: 'Press the + on the top right to add one!!'
        };
      default:
        return {
          title: 'There are no items at all.',
          description: 'Press the + on the top right to add one!!'
        };
    }
  };
  
  // Helper function to check if a log has been undone
  const getUndoneLogIds = async () => {
    const undoneIds = new Set<number>();
    
    // First, check local logs (from IndexedDB)
    const localUndoLogs = logs.filter(log => log.eventId === 'UNDO_PERFORMED');
    console.log('🔍 Debug local UNDO_PERFORMED logs:', localUndoLogs);
    
    localUndoLogs.forEach(undoLog => {
      try {
        const metadata = undoLog.additionalData;
        console.log('🔍 Processing local undo log:', { id: undoLog.id, serverId: undoLog.serverId, metadata });
        if (metadata?.originalLogId) {
          undoneIds.add(metadata.originalLogId);
        }
      } catch (error) {
        console.warn('Failed to parse local undo log metadata:', error);
      }
    });
    
    // Also check backend logs (from PostgreSQL)
    try {
      const placeServiceInstance = (await import('../services/placeService')).placeService;
      const backendLogs = await placeServiceInstance.getAllLogs(100); // Get recent backend logs
      
      const backendUndoLogs = backendLogs.filter(log => log.type === 'UNDO_PERFORMED');
      
      backendUndoLogs.forEach(undoLog => {
        try {
          // Backend stores metadata as JSON string
          const metadata = undoLog.metadata ? JSON.parse(undoLog.metadata) : {};
          if (metadata?.originalLogId) {
            undoneIds.add(metadata.originalLogId);
          }
        } catch (error) {
          console.warn('Failed to parse backend undo log metadata:', error);
        }
      });
    } catch (error) {
      console.warn('Failed to fetch backend logs:', error);
    }
    
    return undoneIds;
  };

  const [undoneLogIds, setUndoneLogIds] = React.useState<Set<number>>(new Set());

  // Load undone log IDs on mount only - not when logs change to avoid infinite loops
  React.useEffect(() => {
    getUndoneLogIds().then(setUndoneLogIds);
  }, []); // Empty dependency array - only run once on mount

  // Refresh undone log IDs after undo operations
  const refreshUndoneLogIds = async () => {
    const updatedUndoneLogIds = await getUndoneLogIds();
    setUndoneLogIds(updatedUndoneLogIds);
  };

  // Convert database logs to the format expected by the Log component
  const logEntries = logs.map(log => {
    const isUndone = undoneLogIds.has(log.serverId || log.id!);
    
    return {
      id: log.id!,
      serverId: log.serverId, // Add server ID for undo operations
      time: log.timeFormatted,
      message: log.text,
      type: log.eventId,
      isUndone: isUndone // Mark if this log has been undone
    };
  });

  const handleLogUndo = async (logId: number) => {
    // Find the log entry to get the server ID
    const logEntry = logEntries.find(entry => entry.id === logId);
    const undoId = logEntry?.serverId || logId; // Use serverId if available, otherwise fallback to local ID
    
    const success = await undoLog(undoId);
    
    if (success) {
      // Refresh data to reflect the undo changes
      await loadPlaces();
      await refreshPlacesData();
      await loadCategories();
      // Refresh tables if a place is selected
      if (selectedPlace) {
        await loadTablesByPlace(parseInt(selectedPlace.id));
      }
      // Refresh menus if a category is selected
      if (selectedCategory) {
        await loadMenusByCategory(parseInt(selectedCategory.id));
      }
      // Refresh undone log IDs to update the UI
      await refreshUndoneLogIds();
    }
  };
  
  const handleAddButtonClick = () => {
    setIsAddMode(true);
  };

  const handleSave = async (name: string, selectedColor: string, storeNumber?: string, userPin?: string, placeId?: string, description?: string, price?: string, diningCapacity?: number) => {
    // Get current user from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      alert('Please sign in to create a place.');
      return;
    }
    
    const currentUser = JSON.parse(currentUserStr);
    const currentStoreNumber = storeNumber || currentUser.storeNumber;
    const currentUserPin = userPin || currentUser.userPin;
    
    console.log('Saving:', { name, selectedColor, storeNumber: currentStoreNumber, userPin: currentUserPin });
    
    if (selectedTab === 'Place') {
      try {
        setLoading(true);
        
        // Create place on server with integrated logging
        const newPlaceData = await placeServiceWithLogging.create({
          name,
          color: getHexColor(selectedColor), // Convert CSS variable to hex
          table_count: 0,
        });

        // Convert to local Place interface
        const newPlace: Place = {
          id: newPlaceData.id!.toString(),
          storeNumber: newPlaceData.store_id.toString(),
          name: newPlaceData.name,
          color: getCSSVariable(newPlaceData.color), // Convert hex back to CSS variable
          tableCount: newPlaceData.table_count,
          userPin: currentUserPin,
          sortOrder: newPlaceData.sort_order || 0,
          createdAt: new Date(newPlaceData.created_at!)
        };

        // Start fade animation
        setCardsTransitioning(true);
        setAnimatingCardId(newPlace.id);
        
        // Fade out current cards
        setTimeout(() => {
          // Add the new place
          setSavedPlaces(prev => [...prev, newPlace]);
          setIsAddMode(false);
          
          // Fade in with new card
          setTimeout(() => {
            setCardsTransitioning(false);
            // Keep the animation ID for a bit longer to show the highlight
            setTimeout(() => {
              setAnimatingCardId(null);
            }, 500);
          }, 25);
        }, 150);
        
        // Refresh places data in logging service for ItemComp processing
        await refreshPlacesData();
        
      } catch (error) {
        console.error('❌ Failed to create place:', error);
        alert('Failed to create place. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (selectedTab === 'Table') {
      if (!placeId) {
        alert('Please select a place first to add a table.');
        return;
      }
      
      try {
        setLoading(true);
        
        // Get place name for logging
        const selectedPlace = savedPlaces.find(p => p.id === placeId);
        
        // Create table on server with integrated logging
        const newTableData = await tableServiceWithLogging.create({
          place_id: parseInt(placeId),
          name,
          color: selectedColor, // selectedColor is now the place's color (already hex)
          dining_capacity: diningCapacity || 4, // Default to 4 if not provided
        }, { placeName: selectedPlace?.name });

        // Convert to local Table interface
        const newTable: Table = {
          id: newTableData.id!.toString(),
          placeId: newTableData.place_id.toString(),
          name: newTableData.name,
          color: getCSSVariable(newTableData.color), // Convert hex back to CSS variable
          positionX: 0,
          positionY: 0,
          diningCapacity: newTableData.dining_capacity,
          storeNumber: newTableData.store_id.toString(),
          userPin: currentUserPin,
          createdAt: new Date(newTableData.created_at!)
        };

        // Start fade animation
        setCardsTransitioning(true);
        setAnimatingCardId(newTable.id);
        
        // Fade out current cards
        setTimeout(async () => {
          // Reload tables from server to ensure UI is in sync
          if (selectedPlace) {
            await loadTablesByPlace(parseInt(selectedPlace.id));
          }
          setIsAddMode(false);
          
          // Fade in with new card
          setTimeout(() => {
            setCardsTransitioning(false);
            // Keep the animation ID for a bit longer to show the highlight
            setTimeout(() => {
              setAnimatingCardId(null);
            }, 500);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to create table:', error);
        alert('Failed to create table. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (selectedTab === 'Category') {
      try {
        setLoading(true);
        
        // Create category on server with integrated logging
        const newCategoryData = await categoryServiceWithLogging.create({
          name,
          color: getHexColor(selectedColor), // Convert CSS variable to hex
          menu_count: 0,
        });

        // Convert to local Category interface
        const newCategory: Category = {
          id: newCategoryData.id!.toString(),
          storeNumber: newCategoryData.store_id.toString(),
          name: newCategoryData.name,
          color: getCSSVariable(newCategoryData.color), // Convert hex back to CSS variable
          menuCount: newCategoryData.menu_count,
          userPin: currentUserPin,
          sortOrder: newCategoryData.sort_order || 0,
          createdAt: new Date(newCategoryData.created_at!)
        };

        // Start fade animation
        setCardsTransitioning(true);
        setAnimatingCardId(newCategory.id);
        
        // Fade out current cards
        setTimeout(() => {
          // Add the new category
          setSavedCategories(prev => [...prev, newCategory]);
          setIsAddMode(false);
          
          // Fade in with new card
          setTimeout(() => {
            setCardsTransitioning(false);
            // Keep the animation ID for a bit longer to show the highlight
            setTimeout(() => {
              setAnimatingCardId(null);
            }, 500);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to create category:', error);
        alert('Failed to create category. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (selectedTab === 'Menu') {
      if (!selectedCategory) {
        alert('Please select a category first to add a menu.');
        return;
      }
      
      try {
        setLoading(true);
        
        // Create menu on server with integrated logging
        const newMenuData = await menuServiceWithLogging.create({
          category_id: parseInt(selectedCategory.id),
          store_number: currentStoreNumber,
          name,
          price: parseInt(price || '0'),
          description: description || '',
          user_pin: currentUserPin
        }, { categoryName: selectedCategory.name });
        
        // Convert to local Menu interface
        const newMenu: Menu = {
          id: newMenuData.id!.toString(),
          categoryId: newMenuData.category_id.toString(),
          name: newMenuData.name,
          description: newMenuData.description,
          price: newMenuData.price?.toString(),
          storeNumber: newMenuData.store_number,
          userPin: newMenuData.user_pin,
          sortOrder: newMenuData.sort_order || 0,
          createdAt: new Date(newMenuData.created_at!)
        };
        
        // Add the new menu
        setSavedMenus(prev => [...prev, newMenu]);
        setIsAddMode(false);
        
        // Reload categories to update menu counts
        await loadCategories();
        
      } catch (error) {
        console.error('❌ Failed to create menu:', error);
        alert('Failed to create menu. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMenuDelete = async (menu: Menu) => {
    console.log('🗑️ handleMenuDelete called for menu:', menu);
    try {
      setLoading(true);
      
      // Find category name for logging
      const category = savedCategories.find(c => c.id === menu.categoryId);
      const categoryName = category ? category.name : 'Unknown Category';
      
      // Prepare entity data for logging
      const menuData: MenuData = {
        id: parseInt(menu.id),
        category_id: parseInt(menu.categoryId),
        store_number: menu.storeNumber,
        name: menu.name,
        price: parseInt(menu.price || '0'),
        description: menu.description,
        user_pin: menu.userPin,
        sort_order: menu.sortOrder
      };
      
      // Delete from server with integrated logging
      await menuServiceWithLogging.delete(
        parseInt(menu.id),
        menuData,
        { categoryName }
      );
      
      // Start fade animation
      setCardsTransitioning(true);
      setAnimatingCardId(menu.id);
      
      // Fade out the card
      setTimeout(() => {
        // Remove from local state
        setSavedMenus(prev => prev.filter(m => m.id !== menu.id));
        
        // Fade in remaining cards
        setTimeout(() => {
          setCardsTransitioning(false);
          setAnimatingCardId(null);
        }, 25);
      }, 150);
      
      // Reload categories to update menu counts
      await loadCategories();
      
    } catch (error) {
      console.error('❌ Failed to delete menu:', error);
      alert('Failed to delete menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddMode(false);
  };

  const handleTableDelete = async (table: Table) => {
    console.log('🗑️ handleTableDelete called for table:', table);
    try {
      setLoading(true);
      
      // Get place name for logging
      const place = savedPlaces.find(p => p.id === table.placeId);
      
      // Prepare entity data for logging
      const tableData: TableData = {
        id: parseInt(table.id),
        place_id: parseInt(table.placeId),
        store_id: parseInt(table.storeNumber),
        name: table.name,
        color: getHexColor(table.color),
        dining_capacity: table.diningCapacity || 4
      };
      
      // Delete from server with integrated logging
      await tableServiceWithLogging.delete(
        parseInt(table.id),
        tableData,
        { placeName: place?.name }
      );
      
      // Start fade animation
      setCardsTransitioning(true);
      setAnimatingCardId(table.id);
      
      // Fade out current cards
      setTimeout(async () => {
        // Reload tables from server to ensure UI is in sync
        if (selectedPlace) {
          await loadTablesByPlace(parseInt(selectedPlace.id));
        }
        
        // Fade in remaining cards
        setTimeout(() => {
          setCardsTransitioning(false);
          setAnimatingCardId(null);
        }, 25);
      }, 150);
      
    } catch (error) {
      console.error('❌ Failed to delete table:', error);
      alert('Failed to delete table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceDelete = async (place: Place) => {
    console.log('🗑️ handlePlaceDelete called for place:', place);
    try {
      setLoading(true);
      
      // Prepare entity data for logging
      const placeData: PlaceData = {
        id: parseInt(place.id),
        store_id: parseInt(place.storeNumber),
        name: place.name,
        color: getHexColor(place.color),
        table_count: place.tableCount,
        sort_order: place.sortOrder
      };
      
      // Delete from server with integrated logging
      await placeServiceWithLogging.delete(
        parseInt(place.id),
        placeData
      );
      
      // Start fade animation
      setCardsTransitioning(true);
      setAnimatingCardId(place.id);
      
      // Fade out current cards
      setTimeout(() => {
        // Remove from saved places
        setSavedPlaces(prev => prev.filter(p => p.id !== place.id));
        
        // Fade in remaining cards
        setTimeout(() => {
          setCardsTransitioning(false);
          setAnimatingCardId(null);
        }, 25);
      }, 150);
      
      // Refresh places data in logging service for ItemComp processing
      await refreshPlacesData();
      
    } catch (error) {
      console.error('❌ Failed to delete place:', error);
      alert('Failed to delete place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (category: Category) => {
    console.log('🗑️ handleCategoryDelete called for category:', category);
    try {
      setLoading(true);
      
      // Prepare entity data for logging
      const categoryData: CategoryData = {
        id: parseInt(category.id),
        store_id: parseInt(category.storeNumber),
        name: category.name,
        color: getHexColor(category.color),
        menu_count: category.menuCount,
        sort_order: category.sortOrder
      };
      
      // Delete from server with integrated logging
      await categoryServiceWithLogging.delete(
        parseInt(category.id),
        categoryData
      );
      
      // Start fade animation
      setCardsTransitioning(true);
      setAnimatingCardId(category.id);
      
      // Fade out current cards
      setTimeout(() => {
        // Remove from saved categories
        setSavedCategories(prev => prev.filter(c => c.id !== category.id));
        
        // Fade in remaining cards
        setTimeout(() => {
          setCardsTransitioning(false);
          setAnimatingCardId(null);
        }, 25);
      }, 150);
      
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Long-press handler to enter edit mode
  const handleCardLongPress = (place: Place) => {
    if (place.id === 'add') return;
    
    console.log('Long-press detected on:', place.name);
    setIsCardEditMode(true);
    setEditingPlace(place);
    setIsAddMode(true); // Show the settings panel
  };

  // Category long-press handler to enter edit mode
  const handleCategoryLongPress = (category: Category) => {
    if (category.id === 'add') return;
    
    console.log('Long-press detected on category:', category.name);
    setIsCardEditMode(true);
    setEditingCategory(category);
    setIsAddMode(true); // Show the settings panel
  };

  // Table long-press handler to enter edit mode
  const handleTableLongPress = (place: Place) => {
    if (place.id === 'add') return;
    
    // Find the actual table from the savedTables array
    const actualTable = savedTables.find(table => table.id === place.id);
    if (!actualTable) return;
    
    console.log('Long-press detected on table:', actualTable.name);
    setIsCardEditMode(true);
    setEditingTable(actualTable);
    setIsAddMode(true); // Show the settings panel
  };

  // Menu long-press handler to enter edit mode
  const handleMenuLongPress = (place: Place) => {
    if (place.id === 'add') return;
    
    // Find the actual menu from the savedMenus array
    const actualMenu = savedMenus.find(menu => menu.id === place.id);
    if (!actualMenu) return;
    
    console.log('Long-press detected on menu:', actualMenu.name);
    setIsCardEditMode(true);
    setEditingMenu(actualMenu);
    setIsAddMode(true); // Show the settings panel
  };

  // Handle card reordering
  const handleCardReorder = async (reorderedPlaces: Place[]) => {
    // Update local state immediately for responsive UI
    setSavedPlaces(reorderedPlaces);
    
    try {
      // Create order updates with new sort_order values
      const placeOrders = reorderedPlaces.map((place, index) => ({
        id: parseInt(place.id),
        sort_order: index + 1 // 1-based ordering
      }));
      
      // Save to database
      await placeService.updatePlaceOrder(placeOrders);
      console.log('✅ Place order saved to database');
      
      // Update local places with new sort_order values
      setSavedPlaces(prev => prev.map((place, index) => ({
        ...place,
        sortOrder: index + 1
      })));
      
    } catch (error) {
      console.error('❌ Failed to save place order:', error);
      // Optionally: reload places from server to restore correct order
      loadPlaces();
    }
  };

  // Handle category reordering
  const handleCategoryReorder = async (reorderedCategories: Category[]) => {
    // Update local state immediately for responsive UI
    setSavedCategories(reorderedCategories);
    
    try {
      // Create order updates with new sort_order values
      const categoryOrders = reorderedCategories.map((category, index) => ({
        id: parseInt(category.id),
        sort_order: index + 1 // 1-based ordering
      }));
      
      // Save to database
      await categoryService.updateCategoryOrder(categoryOrders);
      console.log('✅ Category order saved to database');
      
      // Update local categories with new sort_order values
      setSavedCategories(prev => prev.map((category, index) => ({
        ...category,
        sortOrder: index + 1
      })));
      
    } catch (error) {
      console.error('❌ Failed to save category order:', error);
      // Optionally: reload categories from server to restore correct order
      loadCategories();
    }
  };

  // Handle editing completion
  const handleEditSave = async (name: string, selectedColor: string, storeNumber?: string, userPin?: string, placeId?: string, description?: string, price?: string) => {
    if (editingPlace) {
      try {
        setLoading(true);
        
        // Prepare old entity data
        const oldPlaceData: PlaceData = {
          id: parseInt(editingPlace.id),
          store_id: parseInt(editingPlace.storeNumber),
          name: editingPlace.name,
          color: getHexColor(editingPlace.color),
          table_count: editingPlace.tableCount,
          sort_order: editingPlace.sortOrder
        };
        
        // Update place on server with integrated logging
        await placeServiceWithLogging.update(
          parseInt(editingPlace.id),
          {
            name,
            color: getHexColor(selectedColor) // Convert CSS variable to hex
          },
          oldPlaceData
        );
        
        // Refresh places data for ItemComp processing
        await refreshPlacesData();
        
        // Start fade animation
        setCardsTransitioning(true);
        
        // Fade out current cards
        setTimeout(() => {
          // Update the existing place
          setSavedPlaces(prev => prev.map(p => 
            p.id === editingPlace.id 
              ? { ...p, name, color: selectedColor, storeNumber: storeNumber || p.storeNumber, userPin: userPin || p.userPin }
              : p
          ));
          
          // Exit edit mode
          setIsCardEditMode(false);
          setEditingPlace(null);
          setIsAddMode(false);
          
          // Fade in updated cards
          setTimeout(() => {
            setCardsTransitioning(false);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to update place:', error);
        alert('Failed to update place. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (editingTable) {
      try {
        setLoading(true);
        
        // Get place names for logging
        const oldPlace = savedPlaces.find(p => p.id === editingTable.placeId);
        const newPlace = savedPlaces.find(p => p.id === (placeId || editingTable.placeId));
        
        // Prepare old entity data
        const oldTableData: TableData = {
          id: parseInt(editingTable.id),
          place_id: parseInt(editingTable.placeId),
          store_id: parseInt(editingTable.storeNumber),
          name: editingTable.name,
          color: getHexColor(editingTable.color),
          dining_capacity: editingTable.diningCapacity
        };
        
        // Update table on server with integrated logging
        const updatedTable = await tableServiceWithLogging.update(
          parseInt(editingTable.id),
          {
            name,
            color: selectedColor, // selectedColor is now the place's color (already hex)
            place_id: placeId ? parseInt(placeId) : parseInt(editingTable.placeId)
          },
          oldTableData,
          {
            oldPlaceName: oldPlace?.name,
            newPlaceName: newPlace?.name
          }
        );
        
        // Start fade animation
        setCardsTransitioning(true);
        
        // Fade out current cards
        setTimeout(async () => {
          // Reload tables from server to ensure UI is in sync
          if (selectedPlace) {
            await loadTablesByPlace(parseInt(selectedPlace.id));
          }
          
          // Exit edit mode
          setIsCardEditMode(false);
          setEditingTable(null);
          setIsAddMode(false);
          
          // Fade in updated cards
          setTimeout(() => {
            setCardsTransitioning(false);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to update table:', error);
        alert('Failed to update table. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (editingCategory) {
      try {
        setLoading(true);
        
        // Prepare old entity data
        const oldCategoryData: CategoryData = {
          id: parseInt(editingCategory.id),
          store_id: parseInt(editingCategory.storeNumber),
          name: editingCategory.name,
          color: getHexColor(editingCategory.color),
          menu_count: editingCategory.menuCount,
          sort_order: editingCategory.sortOrder
        };
        
        // Update category on server with integrated logging
        await categoryServiceWithLogging.update(
          parseInt(editingCategory.id),
          {
            name,
            color: getHexColor(selectedColor) // Convert CSS variable to hex
          },
          oldCategoryData
        );
        
        // Start fade animation
        setCardsTransitioning(true);
        
        // Fade out current cards
        setTimeout(() => {
          // Update the existing category
          setSavedCategories(prev => prev.map(c => 
            c.id === editingCategory.id 
              ? { 
                  ...c, 
                  name, 
                  color: selectedColor, 
                  storeNumber: storeNumber || c.storeNumber, 
                  userPin: userPin || c.userPin 
                }
              : c
          ));
          
          // Exit edit mode
          setIsCardEditMode(false);
          setEditingCategory(null);
          setIsAddMode(false);
          
          // Fade in updated cards
          setTimeout(() => {
            setCardsTransitioning(false);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to update category:', error);
        alert('Failed to update category. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (editingMenu) {
      try {
        setLoading(true);
        
        // Find old and new category names for logging
        const oldCategory = savedCategories.find(c => c.id === editingMenu.categoryId);
        const newCategoryId = placeId || editingMenu.categoryId;
        const newCategory = savedCategories.find(c => c.id === newCategoryId);
        const oldCategoryName = oldCategory ? oldCategory.name : 'Unknown Category';
        const newCategoryName = newCategory ? newCategory.name : 'Unknown Category';
        
        // Prepare old entity data
        const oldMenuData: MenuData = {
          id: parseInt(editingMenu.id),
          category_id: parseInt(editingMenu.categoryId),
          store_number: editingMenu.storeNumber,
          name: editingMenu.name,
          price: parseInt(editingMenu.price || '0'),
          description: editingMenu.description,
          user_pin: editingMenu.userPin,
          sort_order: editingMenu.sortOrder
        };
        
        // Update menu on server with integrated logging
        const updatedMenuData = await menuServiceWithLogging.update(
          parseInt(editingMenu.id),
          {
            name,
            category_id: parseInt(newCategoryId),
            description,
            price: parseInt(price || '0')
          },
          oldMenuData,
          {
            oldCategoryName,
            newCategoryName
          }
        );
        
        // Convert to local Menu interface
        const updatedMenu: Menu = {
          id: updatedMenuData.id!.toString(),
          categoryId: updatedMenuData.category_id.toString(),
          name: updatedMenuData.name,
          description: updatedMenuData.description,
          price: updatedMenuData.price?.toString(),
          storeNumber: updatedMenuData.store_number,
          userPin: updatedMenuData.user_pin,
          sortOrder: updatedMenuData.sort_order || 0,
          createdAt: new Date(updatedMenuData.created_at!)
        };
        
        // Start fade animation
        setCardsTransitioning(true);
        
        // Fade out current cards
        setTimeout(() => {
          // Update the existing menu
          setSavedMenus(prev => prev.map(m => 
            m.id === editingMenu.id 
              ? updatedMenu
              : m
          ));
          
          // Exit edit mode
          setIsCardEditMode(false);
          setEditingMenu(null);
          setIsAddMode(false);
          
          // Fade in updated cards
          setTimeout(() => {
            setCardsTransitioning(false);
          }, 25);
        }, 150);
        
      } catch (error) {
        console.error('❌ Failed to update menu:', error);
        alert('Failed to update menu. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Regular add mode
      await handleSave(name, selectedColor, storeNumber, userPin, placeId, description, price);
    }
  };

  const handleEditCancel = () => {
    setIsCardEditMode(false);
    setEditingPlace(null);
    setEditingTable(null);
    setEditingCategory(null);
    setEditingMenu(null);
    setIsAddMode(false);
  };

  const handleEditDelete = async () => {
    console.log('🗑️ handleEditDelete called', { editingPlace, editingTable, editingCategory, isCardEditMode });
    if (editingPlace) {
      console.log('🗑️ Deleting place:', editingPlace.name);
      await handlePlaceDelete(editingPlace);
      setIsCardEditMode(false);
      setEditingPlace(null);
      setIsAddMode(false);
    } else if (editingTable) {
      console.log('🗑️ Deleting table:', editingTable.name);
      await handleTableDelete(editingTable);
      setIsCardEditMode(false);
      setEditingTable(null);
      setIsAddMode(false);
    } else if (editingCategory) {
      console.log('🗑️ Deleting category:', editingCategory.name);
      await handleCategoryDelete(editingCategory);
      setIsCardEditMode(false);
      setEditingCategory(null);
      setIsAddMode(false);
    } else if (editingMenu) {
      console.log('🗑️ Deleting menu:', editingMenu.name);
      await handleMenuDelete(editingMenu);
      setIsCardEditMode(false);
      setEditingMenu(null);
      setIsAddMode(false);
    } else {
      console.warn('🗑️ No editing item found - cannot delete');
    }
  };
  
  
  // Get current date/time formatted like in design
  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  const tabs = ['Category', 'Menu', 'Place', 'Table'];

  // Prevent touch scrolling/swiping on tablets
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Allow touch events on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, [role="button"], input, textarea, select, a, [tabindex]');
    
    if (!isInteractive) {
      e.preventDefault();
    }
  };

  return (
    <div 
      className="bg-black box-border flex flex-col items-center justify-between overflow-hidden relative rounded-[2.25rem] w-full h-full max-h-screen" 
      style={{ 
        padding: 'clamp(0.5rem, 1.25vw, 1.25rem)',
        touchAction: 'none',
        userSelect: 'none'
      }} 
      data-name="ManagementPlace" 
      data-node-id="184:4003"
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {/* Header */}
      <div className="box-border content-stretch flex items-center justify-between overflow-hidden px-[2vw] py-0 relative shrink-0 w-full" style={{ height: 'clamp(3rem, 6vh, 4rem)' }} data-name="Header" data-node-id="184:4004">
        <div 
          className="content-stretch flex flex-col gap-2.5 items-center justify-center overflow-hidden relative shrink-0 cursor-pointer" 
          style={{ width: '2rem', height: '2rem' }} 
          data-name="Home" 
          data-node-id="184:4005"
          onClick={onHome}
        >
          <div className="aspect-[80/80] overflow-hidden relative shrink-0 w-full" data-name="Home Icon" data-node-id="184:4006">
            <img alt="" className="block max-w-none size-full" src={homeIconSvg} />
          </div>
        </div>
        <div className="box-border content-stretch flex h-full items-center justify-center px-[1.5vw] py-0 relative shrink-0" data-name="PageName" data-node-id="184:4007">
          <div className="flex flex-col font-['Pretendard'] font-extrabold justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap text-white" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }} data-node-id="184:4008">
            <p className="leading-[normal] whitespace-pre">Management</p>
          </div>
        </div>
        <div className="box-border content-stretch flex h-full items-center justify-end px-[1vw] py-0 relative shrink-0 flex-1 gap-2" data-name="DateTime" data-node-id="184:4009">
          {/* Sync status indicator */}
          <SyncStatus syncStatus={syncStatus} />
          
          <div className="flex flex-col font-['Pretendard'] font-semibold h-full justify-center leading-[0] not-italic relative shrink-0 text-[#e0e0e0] text-right whitespace-nowrap" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)' }} data-node-id="184:4010">
            <p className="leading-[normal]">{getCurrentDateTime()}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 box-border flex items-stretch min-h-0 min-w-0 overflow-hidden relative w-full" style={{ paddingTop: 'clamp(0.25rem, 0.5vh, 0.75rem)', paddingBottom: 'clamp(0.25rem, 0.5vh, 0.75rem)', gap: 'clamp(0.5rem, 1vw, 1rem)' }} data-name="Body" data-node-id="184:4011">
        {/* Content - 70% width */}
        <div className="h-full min-h-0 max-h-full relative rounded-[1.5rem] border border-[#363636]" style={{ flex: '7', minWidth: '0' }} data-name="Content" data-node-id="184:4012">
          <div className="flex flex-col items-center justify-start min-w-0 overflow-hidden relative w-full h-full">
            {/* Content Header */}
            <div className="box-border content-stretch flex items-center justify-between overflow-hidden px-[0.5rem] py-[0.5rem] relative shrink-0 w-full" style={{ height: 'clamp(3rem, 8vh, 4.5rem)' }} data-name="ContentHeader" data-node-id="184:4013">
              <ManagementItemsComp
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={(tab) => {
                  setTabTransitioning(true);
                  
                  // Fade out current content
                  setTimeout(() => {
                    setSelectedTab(tab);
                    setIsAddMode(false); // Reset add mode when switching tabs
                    
                    // Exit edit mode when switching tabs
                    setIsCardEditMode(false);
                    setEditingPlace(null);
                    setEditingTable(null);
                    setEditingCategory(null);
                    
                    // Load appropriate data based on tab
                    if (tab === 'Table') {
                      // Auto-select first place if available
                      if (savedPlaces.length > 0) {
                        const firstPlace = savedPlaces[0];
                        setSelectedPlace(firstPlace);
                        loadTablesByPlace(parseInt(firstPlace.id));
                      } else {
                        setSelectedPlace(null);
                      }
                      setSelectedCategory(null); // Reset selected category for Table tab
                    } else if (tab === 'Menu') {
                      // Auto-select first category if available
                      if (savedCategories.length > 0) {
                        const firstCategory = savedCategories[0];
                        setSelectedCategory(firstCategory);
                        loadMenusByCategory(parseInt(firstCategory.id));
                      } else {
                        setSelectedCategory(null);
                      }
                      setSelectedPlace(null); // Reset selected place for Menu tab
                    } else {
                      setSelectedPlace(null); // Reset selected place for other tabs
                      setSelectedCategory(null); // Reset selected category for other tabs
                    }
                    
                    // Fade in new content
                    setTimeout(() => {
                      setTabTransitioning(false);
                    }, 25);
                  }, 150);
                }}
                onAddClick={handleAddButtonClick}
                tabTransitioning={tabTransitioning}
                hideAddButton={selectedTab === 'Table' || selectedTab === 'Menu'} // Hide add button for Table and Menu tabs
              />
            </div>

            {/* Content Sub Header - Show for Table and Menu tabs */}
            {selectedTab === 'Table' && (
              <div className="box-border content-stretch flex items-center justify-between overflow-hidden px-[0.5rem] py-[0.5rem] relative shrink-0 w-full" style={{ height: 'clamp(3rem, 8vh, 4.5rem)' }} data-name="ContentSubHeader">
                <ManagementSubItemsComp
                  tabs={savedPlaces.map(place => place.name)}
                  selectedTab={selectedPlace?.name || ''}
                  onTabChange={(placeName) => {
                    const place = savedPlaces.find(p => p.name === placeName);
                    if (place) {
                      // Exit edit mode when switching place sub-tabs
                      setIsCardEditMode(false);
                      setEditingPlace(null);
                      setEditingTable(null);
                      setEditingCategory(null);
                      
                      setSelectedPlace(place);
                      loadTablesByPlace(parseInt(place.id));
                    }
                  }}
                  onAddClick={handleAddButtonClick} // Enable add for tables
                  tabTransitioning={tabTransitioning}
                />
              </div>
            )}

            {/* Content Sub Header - Show for Menu tab */}
            {selectedTab === 'Menu' && (
              <div className="box-border content-stretch flex items-center justify-between overflow-hidden px-[0.5rem] py-[0.5rem] relative shrink-0 w-full" style={{ height: 'clamp(3rem, 8vh, 4.5rem)' }} data-name="ContentSubHeader">
                <ManagementSubItemsComp
                  tabs={savedCategories.map(category => category.name)}
                  selectedTab={selectedCategory?.name || ''}
                  onTabChange={(categoryName) => {
                    const category = savedCategories.find(c => c.name === categoryName);
                    if (category) {
                      // Exit edit mode when switching category sub-tabs
                      setIsCardEditMode(false);
                      setEditingPlace(null);
                      setEditingTable(null);
                      setEditingCategory(null);
                      
                      setSelectedCategory(category);
                      loadMenusByCategory(parseInt(category.id));
                    }
                  }}
                  onAddClick={handleAddButtonClick} // Enable add for menus
                  tabTransitioning={tabTransitioning}
                />
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 flex items-start justify-start min-h-0 min-w-0 relative w-full p-[1vw] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} data-name="ContentBody" data-node-id="184:4043">
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div 
                className={`w-full h-full transition-opacity duration-150 ease-in-out ${
                  tabTransitioning || cardsTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {selectedTab === 'Category' && savedCategories.length > 0 ? (
                  <CardGrid 
                    type="Category"
                    items={[...savedCategories.map(c => ({ 
                      id: c.id, 
                      name: c.name, 
                      color: c.color, 
                      cardData: { menuQty: (c.menuCount || 0).toString() },
                      storeNumber: c.storeNumber,
                      userPin: c.userPin,
                      sortOrder: c.sortOrder,
                      createdAt: c.createdAt
                    })), { id: 'add', name: '', color: '', cardData: {} }]}
                    onCardClick={(category) => {
                      if (category.id === 'add') {
                        handleAddButtonClick();
                      } else {
                        console.log('Clicked category:', category.name);
                      }
                    }}
                    onCardLongPress={handleCategoryLongPress}
                    onCardReorder={handleCategoryReorder}
                    onEditCancel={handleEditCancel}
                    editingItemId={editingCategory?.id || null}
                    isTransitioning={cardsTransitioning}
                    animatingCardId={animatingCardId}
                    isEditMode={isCardEditMode}
                  />
                ) : selectedTab === 'Place' && savedPlaces.length > 0 ? (
                  <CardGrid 
                    type="Place"
                    items={[...savedPlaces.map(p => ({ ...p, cardData: { tableQty: (p.tableCount || 0).toString() }, sortOrder: p.sortOrder })), { id: 'add', name: '', color: '', cardData: {} }]}
                    onCardClick={(place) => {
                      if (place.id === 'add') {
                        handleAddButtonClick();
                      } else {
                        console.log('Clicked place:', place.name);
                      }
                    }}
                    onCardLongPress={handleCardLongPress}
                    onCardReorder={handleCardReorder}
                    onEditCancel={handleEditCancel}
                    editingItemId={editingPlace?.id || null}
                    isTransitioning={cardsTransitioning}
                    animatingCardId={animatingCardId}
                    isEditMode={isCardEditMode}
                  />
                ) : selectedTab === 'Table' && selectedPlace && savedTables.length > 0 ? (
                  <CardGrid 
                    type="Table"
                    items={savedTables.map(table => ({
                      id: table.id,
                      name: table.name,
                      color: table.color,
                      cardData: { person: (table.diningCapacity || 4).toString() },
                      storeNumber: table.storeNumber,
                      userPin: table.userPin,
                      createdAt: table.createdAt
                    }))}
                    onCardClick={(table) => {
                      console.log('Clicked table:', table.name);
                    }}
                    onCardLongPress={handleTableLongPress}
                    onCardReorder={(reorderedTables) => {
                      // Handle table reordering
                      console.log('Tables reordered');
                    }}
                    onEditCancel={handleEditCancel}
                    editingItemId={editingTable?.id || null}
                    isTransitioning={cardsTransitioning}
                    animatingCardId={animatingCardId}
                    isEditMode={isCardEditMode}
                  />
                ) : selectedTab === 'Menu' && selectedCategory && savedMenus.length > 0 ? (
                  <CardGrid 
                    type="Menu"
                    items={savedMenus.map(menu => ({
                      id: menu.id,
                      name: menu.name,
                      color: selectedCategory.color, // Use category color for menu cards
                      cardData: { 
                        price: menu.price || '0',
                        description: menu.description || ''
                      },
                      storeNumber: menu.storeNumber,
                      userPin: menu.userPin,
                      createdAt: menu.createdAt
                    }))}
                    onCardClick={(menu) => {
                      console.log('Clicked menu:', menu.name);
                    }}
                    onCardLongPress={handleMenuLongPress}
                    onCardReorder={(reorderedMenus) => {
                      // Handle menu reordering
                      console.log('Menus reordered');
                    }}
                    onEditCancel={handleEditCancel}
                    editingItemId={editingMenu?.id || null}
                    isTransitioning={cardsTransitioning}
                    animatingCardId={animatingCardId}
                    isEditMode={isCardEditMode}
                  />
                ) : (
                  <div 
                    className="content-stretch flex flex-col items-center justify-center overflow-hidden relative shrink-0 w-full h-full" 
                    data-name="Notification" 
                    data-node-id="184:4044"
                  >
                    {isAddMode ? (
                      <Noti 
                        title="Use settings on the right."
                        description=""
                      />
                    ) : (
                      <Noti 
                        title={getNotiMessage(selectedTab).title}
                        description={getNotiMessage(selectedTab).description}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel (POS Log / Settings) - 30% width */}
        <div className="h-full min-h-0 max-h-full relative rounded-[1.5rem] border border-[#363636]" style={{ flex: '3', minWidth: '0' }} data-name="Panel" data-node-id="184:4066">
          <div className="box-border flex flex-col h-full items-center justify-start min-w-0 overflow-hidden px-[0.5rem] py-0 relative w-full">
            <PanelHeaderComp 
              title={isAddMode ? (
                selectedTab === 'Table' ? 'Table Settings' : 
                selectedTab === 'Category' ? 'Category Settings' : 
                selectedTab === 'Menu' ? 'Menu Settings' :
                'Place Settings'
              ) : 'POS Log'} 
            />
            <div className="flex-1 box-border flex flex-col items-center justify-start min-h-0 min-w-0 px-[0.25rem] relative w-full overflow-hidden" style={{ paddingTop: '3vh', paddingBottom: '3vh' }} data-name="PanelBody" data-node-id="184:4071">
              <PanelContent
                isAddMode={isAddMode}
                selectedTab={selectedTab}
                logEntries={logEntries}
                onLogUndo={handleLogUndo}
                onSave={isCardEditMode ? handleEditSave : handleSave}
                onCancel={isCardEditMode ? handleEditCancel : handleCancel}
                onDelete={isCardEditMode ? handleEditDelete : undefined}
                isEditMode={isCardEditMode}
                editingPlace={editingPlace}
                editingTable={editingTable}
                editingCategory={editingCategory}
                editingMenu={editingMenu}
                places={savedPlaces}
                categories={savedCategories}
                selectedPlace={selectedPlace}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}