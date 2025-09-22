// Simple logger for initial testing
export class HistoryLogger {
  static logHistoryCreated(actionType: string, entityType: string, entityId: string, userId: string) {
    console.log(`[HISTORY] Created: ${actionType} on ${entityType}:${entityId} by ${userId}`);
  }

  static logUndoExecuted(historyId: string, userId: string, entityType: string) {
    console.log(`[UNDO] Executed: ${historyId} by ${userId} on ${entityType}`);
  }

  static logRedoExecuted(undoStackId: string, userId: string, entityType: string) {
    console.log(`[REDO] Executed: ${undoStackId} by ${userId} on ${entityType}`);
  }

  static logCacheHit(key: string) {
    console.log(`[CACHE] Hit: ${key}`);
  }

  static logCacheMiss(key: string) {
    console.log(`[CACHE] Miss: ${key}`);
  }

  static logServiceCall(serviceName: string, endpoint: string, statusCode: number, duration: number) {
    console.log(`[SERVICE] ${serviceName} ${endpoint} - ${statusCode} (${duration}ms)`);
  }

  static logError(error: Error, context?: any) {
    console.error(`[ERROR] ${error.message}`, { context, stack: error.stack });
  }

  static logValidationError(field: string, value: any, rule: string) {
    console.warn(`[VALIDATION] ${field}=${value} failed ${rule}`);
  }

  static logUnauthorizedAccess(userId?: string, action?: string, resource?: string) {
    console.warn(`[SECURITY] Unauthorized: ${userId} attempted ${action} on ${resource}`);
  }
}

export default console;