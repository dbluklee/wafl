// Service for synchronizing logs between local database and server
import axios, { type AxiosResponse } from 'axios';
import { databaseService, type LogEntry } from './database';

interface ServerLogEntry {
  id?: string; // Server-generated ID
  eventId: string;
  storeNumber: string;
  userId: string;
  timestamp: number;
  text: string;
  additionalData?: any; // Additional metadata including preData/postData
}

interface SyncResponse {
  success: boolean;
  syncedCount: number;
  errors?: string[];
}

class SyncService {
  private baseUrl: string;
  private syncInterval: number | null = null;
  private syncInProgress: boolean = false;

  constructor() {
    // In development, we'll use a mock API endpoint
    // In production, this would be your actual server endpoint
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';
  }


  async syncPendingLogs(): Promise<SyncResponse> {
    if (this.syncInProgress) {
      return { success: false, syncedCount: 0, errors: ['Sync already in progress'] };
    }

    this.syncInProgress = true;

    try {
      const unsyncedLogs = await databaseService.getUnsyncedLogs();
      
      if (unsyncedLogs.length === 0) {
        return { success: true, syncedCount: 0 };
      }


      // Convert local logs to server format
      const serverLogs: ServerLogEntry[] = unsyncedLogs.map(log => ({
        eventId: log.eventId,
        storeNumber: log.storeNumber,
        userId: log.userId,
        timestamp: log.timestamp,
        text: log.text,
        additionalData: log.additionalData
      }));

      // Send logs to server in batches
      const batchSize = 10;
      let syncedCount = 0;
      const errors: string[] = [];

      // Upload logs one by one to the existing /api/logs endpoint
      for (let i = 0; i < serverLogs.length; i++) {
        const log = serverLogs[i];
        const correspondingLocalLog = unsyncedLogs[i];

        try {
          const response: AxiosResponse = await axios.post(
            `${this.baseUrl}/logs`,
            log,
            { 
              timeout: 10000,
              headers: { 'Content-Type': 'application/json' }
            }
          );

          if (response.data.success || response.data.data || response.data.id) {
            // Mark this log as synced in local database with server ID
            const serverId = response.data.data?.id || response.data.id;
            await databaseService.markLogAsSynced(correspondingLocalLog.id!, serverId);
            syncedCount++;
            
            // Log progress every 10 logs
            if (syncedCount % 10 === 0) {
            }
          } else {
            errors.push(`Server rejected log: ${JSON.stringify(log)}`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Log sync failed: ${errorMsg}`);
          console.error('❌ Log sync error:', error);
          // Continue with next log even if one fails
        }
      }

      // Update sync metadata
      await databaseService.updateSyncMetadata({
        id: 'last_sync',
        lastSyncTime: Date.now(),
        pendingSyncCount: unsyncedLogs.length - syncedCount
      });

      console.log(`🎉 Sync completed: ${syncedCount}/${unsyncedLogs.length} logs synced`);
      
      return {
        success: errors.length === 0,
        syncedCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('❌ Sync service error:', error);
      return {
        success: false,
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error']
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  async sendLogImmediately(log: LogEntry): Promise<boolean> {
    try {
      const serverLog: ServerLogEntry = {
        eventId: log.eventId,
        storeNumber: log.storeNumber,
        userId: log.userId,
        timestamp: log.timestamp,
        text: log.text,
        additionalData: log.additionalData
      };

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/logs`,
        serverLog,
        { 
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if ((response.data.success || response.data.data) && log.id) {
        const serverId = response.data.data?.id;
        await databaseService.markLogAsSynced(log.id, serverId);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log('📱 Failed to send immediately, will sync later:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  startAutoSync(intervalMinutes: number = 2): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      this.syncPendingLogs();
    }, intervalMinutes * 60 * 1000);

  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  async getConnectionStatus(): Promise<{ online: boolean; lastSyncTime?: number; pendingCount: number }> {
    const metadata = await databaseService.getSyncMetadata('last_sync');
    const unsyncedLogs = await databaseService.getUnsyncedLogs();
    
    return {
      online: true, // Always online
      lastSyncTime: metadata?.lastSyncTime,
      pendingCount: unsyncedLogs.length
    };
  }

  // Mock server for development - this would be replaced by actual API calls
  private async mockServerRequest(logs: ServerLogEntry[]): Promise<{ success: boolean; message?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Mock server error for testing');
    }
    
    return { success: true };
  }

  destroy(): void {
    this.stopAutoSync();
  }
}

export const syncService = new SyncService();