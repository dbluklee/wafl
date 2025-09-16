import { prisma } from '@shared/database';
import {
  IPlaceOverview,
  IDashboardSummary,
  ITableOverview,
  ITodayStats,
  ETableStatus,
  ELogAction,
  IPOSLog,
  ICreateLogParams
} from '../types';
import { cache, CacheKeys, CacheInvalidator } from '../utils/cache';
import { ApiError, NotFoundError, DatabaseError } from '../middlewares/error';


export class DashboardService {
  // Get complete dashboard overview with places and tables
  async getOverview(storeId: string): Promise<{
    places: IPlaceOverview[];
    summary: IDashboardSummary;
  }> {
    try {
      // Try to get from cache first
      const cacheKey = CacheKeys.overview(storeId);
      const cached = cache.get<{
        places: IPlaceOverview[];
        summary: IDashboardSummary;
      }>(cacheKey);

      if (cached) {
        return cached;
      }

      // Fetch places with tables from database
      const places = await prisma.place.findMany({
        where: { storeId: storeId },
        include: {
          tables: {
            orderBy: { name: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      });

      if (!places.length) {
        throw new NotFoundError('Places', storeId);
      }

      // Build places overview with table details
      const placesOverview: IPlaceOverview[] = [];

      for (const place of places) {
        const tablesOverview: ITableOverview[] = [];

        for (const table of place.tables) {
          const tableOverview: ITableOverview = {
            id: table.id,
            name: table.name,
            status: table.status as ETableStatus,
            numberOfPeople: table.numberOfPeople || 0,
            currentOrderAmount: 0,
            stayingTime: 0,
            lastActivity: table.updatedAt,
            placeId: place.id,
            placeName: place.name,
            qrCode: table.qrCode || undefined
          };

          // Get active order for this table if status is not empty
          if (table.status !== 'empty') {
            const activeOrder = await this.getActiveOrderForTable(table.id);
            if (activeOrder) {
              tableOverview.currentOrderAmount = parseFloat(activeOrder.totalAmount.toString());
              tableOverview.activeOrderId = activeOrder.id;
            }

            // Calculate staying time (minutes since last activity)
            tableOverview.stayingTime = Math.floor(
              (Date.now() - table.updatedAt.getTime()) / (1000 * 60)
            );
          }

          tablesOverview.push(tableOverview);
        }

        // Calculate place statistics
        const emptyTables = tablesOverview.filter(t => t.status === ETableStatus.EMPTY).length;
        const seatedTables = tablesOverview.filter(t => t.status === ETableStatus.SEATED).length;
        const orderedTables = tablesOverview.filter(t => t.status === ETableStatus.ORDERED).length;

        placesOverview.push({
          id: place.id,
          name: place.name,
          color: place.color || '#6B7280',
          tables: tablesOverview,
          totalTables: tablesOverview.length,
          emptyTables,
          seatedTables,
          orderedTables
        });
      }

      // Calculate overall summary
      const summary = await this.calculateDashboardSummary(storeId, placesOverview);

      const result = {
        places: placesOverview,
        summary
      };

      // Cache for 30 seconds
      cache.set(cacheKey, result, 30);

      return result;
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw new DatabaseError('Failed to get dashboard overview', error);
    }
  }

  // Update table status
  async updateTableStatus(
    tableId: string,
    newStatus: ETableStatus,
    userId: string,
    userName: string,
    numberOfPeople?: number
  ): Promise<ITableOverview> {
    try {
      // Get current table data
      const currentTable = await prisma.tables.findUnique({
        where: { id: tableId },
        include: { places: true }
      });

      if (!currentTable) {
        throw new NotFoundError('Table', tableId);
      }

      const oldStatus = currentTable.status as ETableStatus;

      // Update table
      const updatedTable = await prisma.tables.update({
        where: { id: tableId },
        data: {
          status: newStatus,
          number_of_people: numberOfPeople || (newStatus === ETableStatus.EMPTY ? 0 : currentTable.number_of_people),
          updated_at: new Date()
        }
      });

      // Create log entry
      await this.createLog({
        action: ELogAction.TABLE_STATUS_CHANGED,
        userId,
        userName,
        storeId: currentTable.store_id,
        tableId: tableId,
        tableName: currentTable.name,
        details: `테이블 ${currentTable.name} 상태 변경: ${oldStatus} → ${newStatus}`,
        oldData: { status: oldStatus, numberOfPeople: currentTable.number_of_people },
        newData: { status: newStatus, numberOfPeople: numberOfPeople },
        isUndoable: true
      });

      // Invalidate cache
      CacheInvalidator.invalidateTable(currentTable.store_id, tableId);
      CacheInvalidator.invalidateDashboard(currentTable.store_id);

      // Build table overview response
      const tableOverview: ITableOverview = {
        id: updatedTable.id,
        name: updatedTable.name,
        status: updatedTable.status as ETableStatus,
        numberOfPeople: updatedTable.number_of_people || 0,
        currentOrderAmount: 0,
        stayingTime: 0,
        lastActivity: updatedTable.updated_at,
        placeId: currentTable.place_id,
        placeName: currentTable.places.name,
        qrCode: updatedTable.qr_code || undefined
      };

      // Get active order amount if not empty
      if (newStatus !== ETableStatus.EMPTY) {
        const activeOrder = await this.getActiveOrderForTable(tableId);
        if (activeOrder) {
          tableOverview.currentOrderAmount = parseFloat(activeOrder.total_amount.toString());
          tableOverview.activeOrderId = activeOrder.id;
        }
      }

      return tableOverview;
    } catch (error) {
      console.error('Error updating table status:', error);
      if (error instanceof ApiError) throw error;
      throw new DatabaseError('Failed to update table status', error);
    }
  }

  // Get today's statistics
  async getTodayStats(storeId: string): Promise<ITodayStats> {
    try {
      const cacheKey = CacheKeys.todayStats(storeId);
      const cached = cache.get<ITodayStats>(cacheKey);

      if (cached) {
        return cached;
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      // Get today's orders
      const todayOrders = await prisma.orders.findMany({
        where: {
          store_id: storeId,
          created_at: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          order_items: {
            include: {
              menus: true
            }
          }
        }
      });

      // Calculate basic stats
      const totalOrders = todayOrders.length;
      const totalRevenue = todayOrders.reduce(
        (sum, order) => sum + parseFloat(order.total_amount.toString()),
        0
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate hourly sales
      const hourlySales: { [hour: string]: number } = {};
      const hourlyOrders: { [hour: string]: number } = {};

      for (let hour = 0; hour < 24; hour++) {
        hourlySales[hour.toString()] = 0;
        hourlyOrders[hour.toString()] = 0;
      }

      todayOrders.forEach(order => {
        const hour = order.created_at.getHours();
        hourlySales[hour.toString()] += parseFloat(order.total_amount.toString());
        hourlyOrders[hour.toString()]++;
      });

      // Find peak hour
      let peakHour = '0';
      let peakHourRevenue = 0;

      Object.entries(hourlySales).forEach(([hour, revenue]) => {
        if (revenue > peakHourRevenue) {
          peakHourRevenue = revenue;
          peakHour = hour;
        }
      });

      // Calculate popular items
      const itemStats: { [menuId: string]: { name: string; quantity: number; revenue: number } } = {};

      todayOrders.forEach(order => {
        order.order_items.forEach(item => {
          const menuId = item.menu_id;
          const menuName = item.menus.name;
          const quantity = item.quantity;
          const revenue = parseFloat(item.price.toString()) * quantity;

          if (!itemStats[menuId]) {
            itemStats[menuId] = {
              name: menuName,
              quantity: 0,
              revenue: 0
            };
          }

          itemStats[menuId].quantity += quantity;
          itemStats[menuId].revenue += revenue;
        });
      });

      const popularItems = Object.entries(itemStats)
        .map(([menuId, stats]) => ({
          menuId,
          menuName: stats.name,
          quantity: stats.quantity,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Get table utilization stats
      const totalTables = await prisma.tables.count({
        where: { store_id: storeId }
      });

      const totalCustomers = todayOrders.reduce(
        (sum, order) => sum + (order.number_of_people || 0),
        0
      );

      const stats: ITodayStats = {
        revenue: totalRevenue,
        orders: totalOrders,
        avgOrderValue,
        totalCustomers,
        peakHour,
        peakHourRevenue,
        hourlySales,
        hourlyOrders,
        popularItems,
        tableUtilization: {
          totalTables,
          avgOccupancyTime: 0, // TODO: Calculate based on table logs
          turnoverRate: totalTables > 0 ? totalOrders / totalTables : 0
        }
      };

      // Cache for 5 minutes
      cache.set(cacheKey, stats, 300);

      return stats;
    } catch (error) {
      console.error('Error getting today stats:', error);
      throw new DatabaseError('Failed to get today statistics', error);
    }
  }

  // Get active order for a table
  private async getActiveOrderForTable(tableId: string) {
    return await prisma.order.findFirst({
      where: {
        tableId: tableId,
        status: {
          in: ['pending', 'confirmed', 'cooking', 'ready']
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Calculate dashboard summary
  private async calculateDashboardSummary(
    storeId: string,
    places: IPlaceOverview[]
  ): Promise<IDashboardSummary> {
    const totalTables = places.reduce((sum, place) => sum + place.totalTables, 0);
    const emptyTables = places.reduce((sum, place) => sum + place.emptyTables, 0);
    const seatedTables = places.reduce((sum, place) => sum + place.seatedTables, 0);
    const orderedTables = places.reduce((sum, place) => sum + place.orderedTables, 0);

    // Get today's stats
    const todayStats = await this.getTodayStats(storeId);

    return {
      totalTables,
      emptyTables,
      seatedTables,
      orderedTables,
      todayRevenue: todayStats.revenue,
      todayOrders: todayStats.orders,
      avgOrderValue: todayStats.avgOrderValue,
      peakHour: todayStats.peakHour,
      totalCustomers: todayStats.totalCustomers
    };
  }

  // Create log entry
  private async createLog(params: ICreateLogParams): Promise<IPOSLog> {
    try {
      const log = await prisma.history_logs.create({
        data: {
          action: params.action,
          user_id: params.userId,
          store_id: params.storeId,
          entity_type: 'table',
          entity_id: params.tableId || '',
          old_data: params.oldData || {},
          new_data: params.newData || {},
          details: params.details,
          amount: params.amount,
          is_undoable: params.isUndoable || false
        }
      });

      // Invalidate logs cache
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
      throw new DatabaseError('Failed to create log entry', error);
    }
  }
}