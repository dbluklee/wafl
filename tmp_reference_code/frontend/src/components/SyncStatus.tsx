import React from 'react';

interface SyncStatusProps {
  syncStatus: {
    online: boolean;
    lastSyncTime?: number;
    pendingCount: number;
  } | null;
}

export default function SyncStatus({ syncStatus }: SyncStatusProps) {
  if (!syncStatus) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400">
        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
        <span>Initializing...</span>
      </div>
    );
  }

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs">
      {/* Connection indicator - always online */}
      <div 
        className="w-2 h-2 rounded-full bg-green-500"
        title="Connected"
      ></div>
      
      {/* Status text - always connected */}
      <span className="text-green-400">
        Connected
      </span>
      
      {/* Pending count */}
      {syncStatus.pendingCount > 0 && (
        <span className="text-yellow-400">
          ({syncStatus.pendingCount} syncing)
        </span>
      )}
      
      {/* Last sync time */}
      {syncStatus.lastSyncTime && (
        <span className="text-gray-400">
          • Last sync: {formatLastSync(syncStatus.lastSyncTime)}
        </span>
      )}
    </div>
  );
}