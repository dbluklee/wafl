// React hook for easy integration with the logging system
import { useEffect, useState, useCallback } from 'react';
import { loggingService, EventType } from '../services/loggingService';
import { type LogEntry } from '../services/database';

interface UseLoggingReturn {
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
  syncStatus: {
    online: boolean;
    lastSyncTime?: number;
    pendingCount: number;
  } | null;
  
  // Logging methods
  log: (eventType: EventType, message: string, context?: any) => Promise<void>;
  logNavigation: (from: string, to: string) => Promise<void>;
  logPlaceCreated: (placeName: string, color: string) => Promise<void>;
  logPlaceDeleted: (placeName: string, color: string) => Promise<void>;
  logPlaceUpdated: (oldPlaceName: string, oldColor: string, newPlaceName: string, newColor: string) => Promise<void>;
  logTableCreated: (tableName: string, placeName: string, tableData?: any) => Promise<void>;
  logTableDeleted: (tableName: string, placeName: string, tableData?: any) => Promise<void>;
  logMenuCreated: (menuName: string, categoryName: string, menuData?: any) => Promise<void>;
  logMenuDeleted: (menuName: string, categoryName: string, menuData?: any) => Promise<void>;
  logMenuUpdated: (oldMenuName: string, oldCategoryName: string, newMenuName: string, newCategoryName: string, oldMenuData?: any, newMenuData?: any) => Promise<void>;
  logCategoryCreated: (categoryName: string, color: string, categoryData?: any) => Promise<void>;
  logCategoryDeleted: (categoryName: string, color: string, categoryData?: any) => Promise<void>;
  logCategoryUpdated: (oldCategoryName: string, oldColor: string, newCategoryName: string, newColor: string, oldCategoryData?: any, newCategoryData?: any) => Promise<void>;
  logCustomerArrival: (placeName: string, tableName: string, customerCount?: number) => Promise<void>;
  logError: (errorMessage: string, additionalData?: Record<string, any>) => Promise<void>;
  
  // Authentication logging methods
  logUserSignIn: (userId: string) => Promise<void>;
  logUserSignUp: (userId: string) => Promise<void>;
  logUserSignOut: () => Promise<void>;
  
  // Actions
  undoLog: (logId: number) => Promise<boolean>;
  refreshLogs: () => Promise<void>;
  forceSyncNow: () => Promise<void>;
  clearAllLocalData: () => Promise<void>;
  refreshPlacesData: () => Promise<void>;
}

export function useLogging(autoRefresh: boolean = true): UseLoggingReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    online: boolean;
    lastSyncTime?: number;
    pendingCount: number;
  } | null>(null);

  // Initialize logging service and load initial logs
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize the logging service
        await loggingService.initialize();

        // Load initial logs
        const initialLogs = await loggingService.getRecentLogs();
        setLogs(initialLogs);

        // Get sync status
        const status = await loggingService.getSyncStatus();
        setSyncStatus(status);

        // Subscribe to real-time log updates if autoRefresh is enabled
        if (autoRefresh) {
          unsubscribe = loggingService.subscribe((updatedLogs) => {
            setLogs(updatedLogs);
          });
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize logging';
        setError(errorMessage);
        console.error('❌ useLogging initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [autoRefresh]);

  // Refresh logs manually
  const refreshLogs = useCallback(async () => {
    try {
      setError(null);
      const updatedLogs = await loggingService.getRecentLogs();
      setLogs(updatedLogs);
      
      // Update sync status
      const status = await loggingService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh logs';
      setError(errorMessage);
      console.error('❌ Failed to refresh logs:', err);
    }
  }, []);

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const status = await loggingService.getSyncStatus();
        setSyncStatus(status);
      } catch (err) {
        console.error('❌ Failed to update sync status:', err);
      }
    };

    // Update sync status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Logging methods
  const log = useCallback(async (eventType: EventType, message: string, context?: any) => {
    try {
      await loggingService.log(eventType, message, context);
      // If not auto-refreshing, manually refresh logs
      if (!autoRefresh) {
        await refreshLogs();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create log';
      setError(errorMessage);
      console.error('❌ Failed to create log:', err);
    }
  }, [autoRefresh, refreshLogs]);

  const logNavigation = useCallback(async (from: string, to: string) => {
    await loggingService.logNavigation(from, to);
  }, []);

  const logPlaceCreated = useCallback(async (placeName: string, color: string) => {
    await loggingService.logPlaceCreated(placeName, color);
  }, []);

  const logPlaceDeleted = useCallback(async (placeName: string, color: string) => {
    await loggingService.logPlaceDeleted(placeName, color);
  }, []);

  const logPlaceUpdated = useCallback(async (oldPlaceName: string, oldColor: string, newPlaceName: string, newColor: string) => {
    await loggingService.logPlaceUpdated(oldPlaceName, oldColor, newPlaceName, newColor);
  }, []);

  const logTableCreated = useCallback(async (tableName: string, placeName: string, tableData?: any) => {
    await loggingService.logTableCreated(tableName, placeName, tableData);
  }, []);

  const logTableDeleted = useCallback(async (tableName: string, placeName: string, tableData?: any) => {
    await loggingService.logTableDeleted(tableName, placeName, tableData);
  }, []);

  const logMenuCreated = useCallback(async (menuName: string, categoryName: string, menuData?: any) => {
    await loggingService.logMenuCreated(menuName, categoryName, menuData);
  }, []);

  const logMenuDeleted = useCallback(async (menuName: string, categoryName: string, menuData?: any) => {
    await loggingService.logMenuDeleted(menuName, categoryName, menuData);
  }, []);

  const logMenuUpdated = useCallback(async (oldMenuName: string, oldCategoryName: string, newMenuName: string, newCategoryName: string, oldMenuData?: any, newMenuData?: any) => {
    await loggingService.logMenuUpdated(oldMenuName, oldCategoryName, newMenuName, newCategoryName, oldMenuData, newMenuData);
  }, []);

  const logCategoryCreated = useCallback(async (categoryName: string, color: string, categoryData?: any) => {
    await loggingService.logCategoryCreated(categoryName, color, categoryData);
  }, []);

  const logCategoryDeleted = useCallback(async (categoryName: string, color: string, categoryData?: any) => {
    await loggingService.logCategoryDeleted(categoryName, color, categoryData);
  }, []);

  const logCategoryUpdated = useCallback(async (oldCategoryName: string, oldColor: string, newCategoryName: string, newColor: string, oldCategoryData?: any, newCategoryData?: any) => {
    await loggingService.logCategoryUpdated(oldCategoryName, oldColor, newCategoryName, newColor, oldCategoryData, newCategoryData);
  }, []);

  const logCustomerArrival = useCallback(async (placeName: string, tableName: string, customerCount?: number) => {
    await loggingService.logCustomerArrival(placeName, tableName, customerCount);
  }, []);

  const logError = useCallback(async (errorMessage: string, additionalData?: Record<string, any>) => {
    await loggingService.logError(errorMessage, additionalData);
  }, []);

  // Authentication logging methods
  const logUserSignIn = useCallback(async (userId: string) => {
    await loggingService.logUserSignIn(userId);
    // Refresh logs to show only session logs after sign in
    if (!autoRefresh) {
      await refreshLogs();
    }
  }, [autoRefresh, refreshLogs]);

  const logUserSignUp = useCallback(async (userId: string) => {
    await loggingService.logUserSignUp(userId);
    // Refresh logs to show only session logs after sign up
    if (!autoRefresh) {
      await refreshLogs();
    }
  }, [autoRefresh, refreshLogs]);

  const logUserSignOut = useCallback(async () => {
    await loggingService.logUserSignOut();
  }, []);

  // Action methods
  const undoLog = useCallback(async (logId: number): Promise<boolean> => {
    try {
      const success = await loggingService.undoLog(logId);
      
      // If not auto-refreshing, manually refresh logs after undo
      if (!autoRefresh && success) {
        await refreshLogs();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to undo log';
      setError(errorMessage);
      console.error('❌ Failed to undo log:', err);
      return false;
    }
  }, [autoRefresh, refreshLogs]);

  const forceSyncNow = useCallback(async () => {
    try {
      await loggingService.forceSyncNow();
      // Refresh sync status after forced sync
      const status = await loggingService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync logs';
      setError(errorMessage);
      console.error('❌ Failed to force sync:', err);
    }
  }, []);

  const clearAllLocalData = useCallback(async () => {
    try {
      await loggingService.clearAllLocalDataAndNotify();
      // Refresh logs after clearing
      await refreshLogs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear local data';
      setError(errorMessage);
      console.error('❌ Failed to clear local data:', err);
    }
  }, [refreshLogs]);

  const refreshPlacesData = useCallback(async () => {
    try {
      await loggingService.refreshPlacesData();
    } catch (err) {
      console.error('❌ Failed to refresh places data:', err);
    }
  }, []);

  return {
    logs,
    isLoading,
    error,
    syncStatus,
    
    // Logging methods
    log,
    logNavigation,
    logPlaceCreated,
    logPlaceDeleted,
    logPlaceUpdated,
    logTableCreated,
    logTableDeleted,
    logMenuCreated,
    logMenuDeleted,
    logMenuUpdated,
    logCategoryCreated,
    logCategoryDeleted,
    logCategoryUpdated,
    logCustomerArrival,
    logError,
    
    // Authentication logging methods
    logUserSignIn,
    logUserSignUp,
    logUserSignOut,
    
    // Actions
    undoLog,
    refreshLogs,
    forceSyncNow,
    clearAllLocalData,
    refreshPlacesData,
  };
}

// Specialized hook for components that only need to create logs (no display)
export function useLogger() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loggingService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Failed to initialize logger:', error);
      }
    };

    initialize();
  }, []);

  return {
    isInitialized,
    log: loggingService.log.bind(loggingService),
    logNavigation: loggingService.logNavigation.bind(loggingService),
    logPlaceCreated: loggingService.logPlaceCreated.bind(loggingService),
    logPlaceDeleted: loggingService.logPlaceDeleted.bind(loggingService),
    logPlaceUpdated: loggingService.logPlaceUpdated.bind(loggingService),
    logTableCreated: loggingService.logTableCreated.bind(loggingService),
    logTableDeleted: loggingService.logTableDeleted.bind(loggingService),
    logMenuCreated: loggingService.logMenuCreated.bind(loggingService),
    logMenuDeleted: loggingService.logMenuDeleted.bind(loggingService),
    logMenuUpdated: loggingService.logMenuUpdated.bind(loggingService),
    logCategoryCreated: loggingService.logCategoryCreated.bind(loggingService),
    logCategoryDeleted: loggingService.logCategoryDeleted.bind(loggingService),
    logCategoryUpdated: loggingService.logCategoryUpdated.bind(loggingService),
    logCustomerArrival: loggingService.logCustomerArrival.bind(loggingService),
    logError: loggingService.logError.bind(loggingService),
    logUserSignIn: loggingService.logUserSignIn.bind(loggingService),
    logUserSignUp: loggingService.logUserSignUp.bind(loggingService),
    logUserSignOut: loggingService.logUserSignOut.bind(loggingService),
  };
}