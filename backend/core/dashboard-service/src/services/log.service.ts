import { prisma } from '@shared/database';
import {
  IPOSLog,
  ICreateLogParams,
  ELogAction,
  IServiceResponse
} from '../types';
import { cache, CacheKeys, CacheInvalidator } from '../utils/cache';
import { ApiError, NotFoundError, DatabaseError, ConflictError } from '../middlewares/error';
import { config } from '../config';


export class LogService {
  // Get logs with pagination and filtering
  async getLogs(
    storeId: string,
    limit: number = 50,
    offset: number = 0,
    action?: ELogAction
  ): Promise<{
    logs: IPOSLog[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Ensure limit doesn't exceed maximum
      const actualLimit = Math.min(limit, config.dashboard.maxLogsPerRequest);

      // Build cache key
      const cacheKey = CacheKeys.logs(storeId, Math.floor(offset / actualLimit));
      const cached = cache.get<{
        logs: IPOSLog[];
        total: number;
        hasMore: boolean;
      }>(cacheKey);

      if (cached && !action) { // Only use cache if no filter applied
        return cached;
      }

      // Build where clause
      const where: any = {
        store_id: storeId
      };

      if (action) {
        where.action = action;
      }

      // Get logs with user information
      const [logs, total] = await Promise.all([
        prisma.history_logs.findMany({
          where,
          include: {
            users: {
              select: {
                name: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          take: actualLimit,
          skip: offset
        }),
        prisma.history_logs.count({ where })
      ]);

      // Transform to IPOSLog format
      const transformedLogs: IPOSLog[] = await Promise.all(
        logs.map(async (log) => {
          // Get table name if tableId exists
          let tableName: string | undefined;
          let orderNumber: string | undefined;

          if (log.entity_type === 'table' && log.entity_id) {
            const table = await prisma.tables.findUnique({
              where: { id: log.entity_id },
              select: { name: true }
            });
            tableName = table?.name;
          }

          if (log.entity_type === 'order' && log.entity_id) {
            const order = await prisma.orders.findUnique({
              where: { id: log.entity_id },
              select: { order_number: true }
            });
            orderNumber = order?.order_number;
          }

          return {
            id: log.id,
            timestamp: log.created_at,
            action: log.action as ELogAction,
            userId: log.user_id,
            userName: log.users?.name || 'Unknown User',
            storeId: log.store_id,
            tableId: log.entity_type === 'table' ? log.entity_id : undefined,
            tableName,
            orderId: log.entity_type === 'order' ? log.entity_id : undefined,
            orderNumber,
            amount: log.amount ? parseFloat(log.amount.toString()) : undefined,
            details: log.details,
            oldData: log.old_data,
            newData: log.new_data,
            isUndoable: log.is_undoable && !log.undo_at && this.isWithinUndoableTime(log.created_at),
            undoAt: log.undo_at || undefined
          };
        })
      );

      const result = {
        logs: transformedLogs,
        total,
        hasMore: offset + actualLimit < total
      };

      // Cache for 30 seconds if no filter applied
      if (!action) {
        cache.set(cacheKey, result, 30);
      }

      return result;
    } catch (error) {
      console.error('Error getting logs:', error);
      throw new DatabaseError('Failed to get logs', error);
    }
  }

  // Create a new log entry
  async createLog(params: ICreateLogParams): Promise<IPOSLog> {
    try {
      // Validate required fields
      if (!params.action || !params.userId || !params.storeId || !params.details) {
        throw new ApiError('Missing required fields for log creation', 400);
      }

      // Determine entity type and ID based on action
      let entityType = 'unknown';
      let entityId = '';

      if (params.tableId) {
        entityType = 'table';
        entityId = params.tableId;
      } else if (params.orderId) {
        entityType = 'order';
        entityId = params.orderId;
      }

      // Create log entry
      const log = await prisma.history_logs.create({
        data: {
          action: params.action,
          user_id: params.userId,
          store_id: params.storeId,
          entity_type: entityType,
          entity_id: entityId,
          old_data: params.oldData || {},
          new_data: params.newData || {},
          details: params.details,
          amount: params.amount,
          is_undoable: params.isUndoable || false
        }
      });

      // Invalidate cache
      CacheInvalidator.invalidateStore(params.storeId);

      return {
        id: log.id,
        timestamp: log.created_at,
        action: log.action as ELogAction,
        userId: log.user_id,
        userName: params.userName,
        storeId: log.store_id,
        tableId: params.tableId,
        tableName: params.tableName,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        amount: params.amount,
        details: log.details,
        oldData: log.old_data,
        newData: log.new_data,
        isUndoable: log.is_undoable,
        undoAt: log.undo_at || undefined
      };
    } catch (error) {
      console.error('Error creating log:', error);
      throw new DatabaseError('Failed to create log', error);
    }
  }

  // Undo a specific action
  async undoAction(
    logId: string,
    userId: string,
    userName: string
  ): Promise<IServiceResponse<any>> {
    try {
      // Get the log entry
      const log = await prisma.history_logs.findUnique({
        where: { id: logId }
      });

      if (!log) {
        throw new NotFoundError('Log entry', logId);
      }

      // Check if undoable
      if (!log.is_undoable) {
        throw new ConflictError('This action cannot be undone');
      }

      // Check if already undone
      if (log.undo_at) {
        throw new ConflictError('This action has already been undone');
      }

      // Check if within undoable time limit
      if (!this.isWithinUndoableTime(log.created_at)) {
        throw new ConflictError('This action can no longer be undone (time limit exceeded)');
      }

      // Perform undo based on action type
      let undoResult: any = {};

      switch (log.action as ELogAction) {
        case ELogAction.TABLE_STATUS_CHANGED:
          undoResult = await this.undoTableStatusChange(log);
          break;

        case ELogAction.ORDER_CREATED:
          undoResult = await this.undoOrderCreation(log);
          break;

        case ELogAction.PAYMENT_COMPLETED:
          undoResult = await this.undoPayment(log);
          break;

        default:
          throw new ConflictError(`Undo not supported for action: ${log.action}`);
      }

      // Mark as undone
      await prisma.history_logs.update({
        where: { id: logId },
        data: {
          undo_at: new Date(),
          undo_by: userId
        }
      });

      // Create undo log entry
      await this.createLog({
        action: ELogAction.TABLE_STATUS_CHANGED, // Generic for undo
        userId,
        userName,
        storeId: log.store_id,
        details: `Undo action: ${log.details}`,
        oldData: log.new_data,
        newData: log.old_data,
        isUndoable: false
      });

      // Invalidate cache
      CacheInvalidator.invalidateStore(log.store_id);

      return {
        success: true,
        message: 'Action successfully undone',
        data: undoResult
      };
    } catch (error) {
      console.error('Error undoing action:', error);
      if (error instanceof ApiError) throw error;
      throw new DatabaseError('Failed to undo action', error);
    }
  }

  // Get logs by action type
  async getLogsByAction(
    storeId: string,
    action: ELogAction,
    limit: number = 20
  ): Promise<IPOSLog[]> {
    try {
      const logs = await prisma.history_logs.findMany({
        where: {
          store_id: storeId,
          action
        },
        include: {
          users: {
            select: {
              name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      return logs.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        action: log.action as ELogAction,
        userId: log.user_id,
        userName: log.users?.name || 'Unknown User',
        storeId: log.store_id,
        tableId: log.entity_type === 'table' ? log.entity_id : undefined,
        orderId: log.entity_type === 'order' ? log.entity_id : undefined,
        amount: log.amount ? parseFloat(log.amount.toString()) : undefined,
        details: log.details,
        oldData: log.old_data,
        newData: log.new_data,
        isUndoable: log.is_undoable && !log.undo_at && this.isWithinUndoableTime(log.created_at),
        undoAt: log.undo_at || undefined
      }));
    } catch (error) {
      console.error('Error getting logs by action:', error);
      throw new DatabaseError('Failed to get logs by action', error);
    }
  }

  // Get recent undoable actions
  async getUndoableActions(
    storeId: string,
    limit: number = 10
  ): Promise<IPOSLog[]> {
    try {
      const cutoffTime = new Date(Date.now() - config.dashboard.undoableTimeLimit);

      const logs = await prisma.history_logs.findMany({
        where: {
          store_id: storeId,
          is_undoable: true,
          undo_at: null,
          created_at: {
            gte: cutoffTime
          }
        },
        include: {
          users: {
            select: {
              name: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit
      });

      return logs.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        action: log.action as ELogAction,
        userId: log.user_id,
        userName: log.users?.name || 'Unknown User',
        storeId: log.store_id,
        tableId: log.entity_type === 'table' ? log.entity_id : undefined,
        orderId: log.entity_type === 'order' ? log.entity_id : undefined,
        amount: log.amount ? parseFloat(log.amount.toString()) : undefined,
        details: log.details,
        oldData: log.old_data,
        newData: log.new_data,
        isUndoable: true,
        undoAt: undefined
      }));
    } catch (error) {
      console.error('Error getting undoable actions:', error);
      throw new DatabaseError('Failed to get undoable actions', error);
    }
  }

  // Private helper methods
  private isWithinUndoableTime(createdAt: Date): boolean {
    const timeDiff = Date.now() - createdAt.getTime();
    return timeDiff <= config.dashboard.undoableTimeLimit;
  }

  private async undoTableStatusChange(log: any): Promise<any> {
    if (!log.entity_id || !log.old_data) {
      throw new ConflictError('Invalid log data for table status undo');
    }

    // Restore table to previous status
    const updatedTable = await prisma.tables.update({
      where: { id: log.entity_id },
      data: {
        status: log.old_data.status,
        number_of_people: log.old_data.numberOfPeople || 0,
        updated_at: new Date()
      }
    });

    return updatedTable;
  }

  private async undoOrderCreation(log: any): Promise<any> {
    if (!log.entity_id) {
      throw new ConflictError('Invalid log data for order undo');
    }

    // Cancel the order (if it still exists and is cancellable)
    const order = await prisma.orders.findUnique({
      where: { id: log.entity_id }
    });

    if (order && ['pending', 'confirmed'].includes(order.status)) {
      const updatedOrder = await prisma.orders.update({
        where: { id: log.entity_id },
        data: {
          status: 'cancelled',
          updated_at: new Date()
        }
      });

      return updatedOrder;
    }

    throw new ConflictError('Order cannot be undone (no longer in cancellable state)');
  }

  private async undoPayment(log: any): Promise<any> {
    // This would integrate with payment service to reverse payment
    throw new ConflictError('Payment undo is not yet implemented');
  }
}