// Mock logging service for WAFL project
// This is a simplified version without IndexedDB dependency

export enum EventType {
  // Navigation events
  NAVIGATION_WELCOME = 'nav_welcome',
  NAVIGATION_SIGNUP = 'nav_signup',
  NAVIGATION_SIGNIN = 'nav_signin',
  NAVIGATION_HOME = 'nav_home',
  NAVIGATION_MANAGEMENT = 'nav_management',
  NAVIGATION_BACK = 'nav_back',

  // Authentication events
  USER_SIGNUP = 'auth_signup',
  USER_SIGNIN = 'auth_signin',
  USER_SIGNOUT = 'auth_signout',

  // Management events
  PLACE_CREATED = 'place_created',
  PLACE_UPDATED = 'place_updated',
  PLACE_DELETED = 'place_deleted',
  TABLE_CREATED = 'table_created',
  TABLE_UPDATED = 'table_updated',
  TABLE_DELETED = 'table_deleted',
  MENU_CREATED = 'menu_created',
  MENU_UPDATED = 'menu_updated',
  MENU_DELETED = 'menu_deleted',
  CATEGORY_CREATED = 'category_created',
  CATEGORY_UPDATED = 'category_updated',
  CATEGORY_DELETED = 'category_deleted',

  // System events
  SYSTEM_STARTUP = 'system_startup',
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',

  // Customer events (for future use)
  CUSTOMER_ARRIVED = 'customer_arrived',
  ORDER_PLACED = 'order_placed',
  ORDER_COMPLETED = 'order_completed',

  // Error events
  ERROR_OCCURRED = 'error_occurred',
}

export interface LogEntry {
  id?: number;
  serverId?: number;
  eventId: string;
  storeNumber: string;
  userId: string;
  timestamp: number;
  timeFormatted: string;
  text: string;
  additionalData?: any;
  synced: boolean;
  createdAt: number;
}

class MockLoggingService {
  private logs: LogEntry[] = [];
  private subscribers: ((logs: LogEntry[]) => void)[] = [];
  private lastLogId = 0;

  async initialize(): Promise<void> {
    console.log('🔧 Mock logging service initialized');
    return Promise.resolve();
  }

  async log(eventType: EventType, message: string, context?: any): Promise<void> {
    const logEntry: LogEntry = {
      id: ++this.lastLogId,
      eventId: eventType,
      storeNumber: '1001', // Mock store number
      userId: 'user1', // Mock user ID
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      text: message,
      additionalData: context,
      synced: true, // Mock as always synced
      createdAt: Date.now()
    };

    this.logs.unshift(logEntry); // Add to beginning
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100); // Keep only last 100 logs
    }

    // Notify subscribers
    this.notifySubscribers();

    console.log(`📝 [${logEntry.timeFormatted}] ${eventType}: ${message}`, context);
  }

  async getRecentLogs(limit = 50): Promise<LogEntry[]> {
    return this.logs.slice(0, limit);
  }

  async getSyncStatus() {
    return {
      online: true,
      lastSyncTime: Date.now(),
      pendingCount: 0
    };
  }

  subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.logs));
  }

  async undoLog(logId: number): Promise<boolean> {
    console.log(`🔄 Mock undo for log ID: ${logId}`);
    return true;
  }

  async forceSyncNow(): Promise<void> {
    console.log('🔄 Mock force sync');
  }

  async clearAllLocalDataAndNotify(): Promise<void> {
    this.logs = [];
    this.notifySubscribers();
    console.log('🗑️ Mock clear all data');
  }

  async refreshPlacesData(): Promise<void> {
    console.log('🔄 Mock refresh places data');
  }

  // Convenience methods for specific events
  async logNavigation(from: string, to: string): Promise<void> {
    await this.log(EventType.NAVIGATION_HOME, `Navigated from ${from} to ${to}`);
  }

  async logPlaceCreated(placeName: string, color: string, data?: any): Promise<void> {
    await this.log(EventType.PLACE_CREATED, `Created place: ${placeName}`, { placeName, color, ...data });
  }

  async logPlaceDeleted(placeName: string, color: string, data?: any): Promise<void> {
    await this.log(EventType.PLACE_DELETED, `Deleted place: ${placeName}`, { placeName, color, ...data });
  }

  async logPlaceUpdated(oldName: string, oldColor: string, newName: string, newColor: string, data?: any): Promise<void> {
    await this.log(EventType.PLACE_UPDATED, `Updated place: ${oldName} → ${newName}`, { oldName, oldColor, newName, newColor, ...data });
  }

  async logTableCreated(tableName: string, placeName: string, data?: any): Promise<void> {
    await this.log(EventType.TABLE_CREATED, `Created table: ${tableName} in ${placeName}`, { tableName, placeName, ...data });
  }

  async logTableDeleted(tableName: string, placeName: string, data?: any): Promise<void> {
    await this.log(EventType.TABLE_DELETED, `Deleted table: ${tableName} from ${placeName}`, { tableName, placeName, ...data });
  }

  async logTableUpdated(oldTableName: string, oldPlaceName: string, newTableName: string, newPlaceName: string, data?: any): Promise<void> {
    await this.log(EventType.TABLE_UPDATED, `Updated table: ${oldTableName} → ${newTableName}`, { oldTableName, oldPlaceName, newTableName, newPlaceName, ...data });
  }

  async logMenuCreated(menuName: string, categoryName: string, data?: any): Promise<void> {
    await this.log(EventType.MENU_CREATED, `Created menu: ${menuName} in ${categoryName}`, { menuName, categoryName, ...data });
  }

  async logMenuDeleted(menuName: string, categoryName: string, data?: any): Promise<void> {
    await this.log(EventType.MENU_DELETED, `Deleted menu: ${menuName} from ${categoryName}`, { menuName, categoryName, ...data });
  }

  async logMenuUpdated(oldMenuName: string, oldCategoryName: string, newMenuName: string, newCategoryName: string, oldData?: any, newData?: any): Promise<void> {
    await this.log(EventType.MENU_UPDATED, `Updated menu: ${oldMenuName} → ${newMenuName}`, { oldMenuName, oldCategoryName, newMenuName, newCategoryName, oldData, newData });
  }

  async logCategoryCreated(categoryName: string, color: string, data?: any): Promise<void> {
    await this.log(EventType.CATEGORY_CREATED, `Created category: ${categoryName}`, { categoryName, color, ...data });
  }

  async logCategoryDeleted(categoryName: string, color: string, data?: any): Promise<void> {
    await this.log(EventType.CATEGORY_DELETED, `Deleted category: ${categoryName}`, { categoryName, color, ...data });
  }

  async logCategoryUpdated(oldName: string, oldColor: string, newName: string, newColor: string, oldData?: any, newData?: any): Promise<void> {
    await this.log(EventType.CATEGORY_UPDATED, `Updated category: ${oldName} → ${newName}`, { oldName, oldColor, newName, newColor, oldData, newData });
  }

  async logCustomerArrival(placeName: string, tableName: string, customerCount?: number): Promise<void> {
    await this.log(EventType.CUSTOMER_ARRIVED, `Customer arrived at ${placeName} - ${tableName}`, { placeName, tableName, customerCount });
  }

  async logError(errorMessage: string, additionalData?: Record<string, any>): Promise<void> {
    await this.log(EventType.ERROR_OCCURRED, `Error: ${errorMessage}`, additionalData);
  }

  async logUserSignIn(userId: string): Promise<void> {
    await this.log(EventType.USER_SIGNIN, `User signed in: ${userId}`, { userId });
  }

  async logUserSignUp(userId: string): Promise<void> {
    await this.log(EventType.USER_SIGNUP, `User signed up: ${userId}`, { userId });
  }

  async logUserSignOut(): Promise<void> {
    await this.log(EventType.USER_SIGNOUT, 'User signed out');
  }
}

export const loggingService = new MockLoggingService();