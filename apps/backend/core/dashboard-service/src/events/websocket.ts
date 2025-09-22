import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import {
  ISocketEvents,
  ITableOverview,
  IDashboardSummary,
  IPlaceOverview,
  IPOSLog,
  ITodayStats,
  ETableStatus
} from '../types';
import { config } from '../config';

interface IAuthenticatedSocket extends Socket {
  userId?: string;
  storeId?: string;
  userRole?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedClients = new Map<string, IAuthenticatedSocket>();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: config.websocket.cors,
      path: config.websocket.path,
      transports: config.websocket.transports,
      pingTimeout: config.websocket.pingTimeout,
      pingInterval: config.websocket.pingInterval
    });

    this.setupMiddlewares();
    this.setupEventHandlers();

    console.log('WebSocket Manager initialized');
  }

  private setupMiddlewares(): void {
    // Authentication middleware
    this.io.use(async (socket: IAuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Remove Bearer prefix if present
        const cleanToken = token.replace('Bearer ', '');

        // Verify JWT token
        const decoded = jwt.verify(cleanToken, config.jwt.secret) as any;

        if (!decoded || !decoded.id || !decoded.storeId) {
          return next(new Error('Invalid token payload'));
        }

        // Attach user info to socket
        socket.userId = decoded.id;
        socket.storeId = decoded.storeId;
        socket.userRole = decoded.role || 'staff';

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Logging middleware
    this.io.use((socket: IAuthenticatedSocket, next) => {
      console.log(`WebSocket connection attempt from user ${socket.userId} (store: ${socket.storeId})`);
      next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: IAuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: IAuthenticatedSocket): void {
    console.log(`Client connected: ${socket.id} (user: ${socket.userId}, store: ${socket.storeId})`);

    // Store client reference
    this.connectedClients.set(socket.id, socket);

    // Auto-join store room
    if (socket.storeId) {
      socket.join(`store:${socket.storeId}`);
      socket.join(`dashboard:${socket.storeId}`);
    }

    // Handle room join/leave events
    this.handleRoomManagement(socket);

    // Handle dashboard specific events
    this.handleDashboardEvents(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Send initial connection confirmation
    socket.emit('connection:confirmed', {
      socketId: socket.id,
      userId: socket.userId,
      storeId: socket.storeId,
      timestamp: new Date().toISOString()
    });
  }

  private handleRoomManagement(socket: IAuthenticatedSocket): void {
    // Join store room
    socket.on('join:store', (storeId: string) => {
      if (socket.storeId === storeId) {
        socket.join(`store:${storeId}`);
        socket.emit('room:joined', { room: `store:${storeId}`, timestamp: new Date().toISOString() });
      } else {
        socket.emit('error', { message: 'Access denied to store', code: 'STORE_ACCESS_DENIED' });
      }
    });

    // Join table room
    socket.on('join:table', (tableId: string) => {
      socket.join(`table:${tableId}`);
      socket.emit('room:joined', { room: `table:${tableId}`, timestamp: new Date().toISOString() });
    });

    // Join dashboard room
    socket.on('join:dashboard', (storeId: string) => {
      if (socket.storeId === storeId) {
        socket.join(`dashboard:${storeId}`);
        socket.emit('room:joined', { room: `dashboard:${storeId}`, timestamp: new Date().toISOString() });
      }
    });

    // Join logs room
    socket.on('join:logs', (storeId: string) => {
      if (socket.storeId === storeId) {
        socket.join(`logs:${storeId}`);
        socket.emit('room:joined', { room: `logs:${storeId}`, timestamp: new Date().toISOString() });
      }
    });

    // Leave table room
    socket.on('leave:table', (tableId: string) => {
      socket.leave(`table:${tableId}`);
      socket.emit('room:left', { room: `table:${tableId}`, timestamp: new Date().toISOString() });
    });

    // Leave store room
    socket.on('leave:store', (storeId: string) => {
      socket.leave(`store:${storeId}`);
      socket.emit('room:left', { room: `store:${storeId}`, timestamp: new Date().toISOString() });
    });
  }

  private handleDashboardEvents(socket: IAuthenticatedSocket): void {
    // Request dashboard overview
    socket.on('dashboard:request:overview', () => {
      // This would trigger a service call and emit back the overview
      socket.emit('dashboard:request:received', {
        type: 'overview',
        timestamp: new Date().toISOString()
      });
    });

    // Request table status
    socket.on('table:request:status', (tableId: string) => {
      socket.emit('table:request:received', {
        tableId,
        timestamp: new Date().toISOString()
      });
    });

    // Request logs
    socket.on('logs:request', (params: { limit?: number; offset?: number }) => {
      socket.emit('logs:request:received', {
        params,
        timestamp: new Date().toISOString()
      });
    });

    // Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  private handleDisconnection(socket: IAuthenticatedSocket): void {
    console.log(`Client disconnected: ${socket.id} (user: ${socket.userId})`);
    this.connectedClients.delete(socket.id);
  }

  // Public methods to emit events

  // Dashboard overview updated
  public emitDashboardOverviewUpdated(storeId: string, data: {
    places: IPlaceOverview[];
    summary: IDashboardSummary;
  }): void {
    this.io.to(`dashboard:${storeId}`).emit('dashboard:overview:updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Table status changed
  public emitTableStatusChanged(
    storeId: string,
    tableId: string,
    data: {
      oldStatus: ETableStatus;
      newStatus: ETableStatus;
      table: ITableOverview;
    }
  ): void {
    // Emit to store and table rooms
    this.io.to(`store:${storeId}`).emit('table:status:changed', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });

    this.io.to(`table:${tableId}`).emit('table:status:changed', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });

    // Also emit to dashboard room
    this.io.to(`dashboard:${storeId}`).emit('dashboard:table:updated', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Order created
  public emitOrderCreated(
    storeId: string,
    tableId: string,
    data: {
      orderId: string;
      amount: number;
      orderNumber: string;
    }
  ): void {
    this.io.to(`store:${storeId}`).emit('order:created', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });

    this.io.to(`table:${tableId}`).emit('order:created', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Order status updated
  public emitOrderStatusUpdated(
    storeId: string,
    tableId: string,
    data: {
      orderId: string;
      status: string;
      amount: number;
    }
  ): void {
    this.io.to(`store:${storeId}`).emit('order:status:updated', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });

    this.io.to(`table:${tableId}`).emit('order:status:updated', {
      tableId,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // New log created
  public emitLogCreated(storeId: string, log: IPOSLog): void {
    this.io.to(`logs:${storeId}`).emit('log:created', {
      ...log,
      timestamp: new Date().toISOString()
    });

    // Also emit to dashboard for recent activity
    this.io.to(`dashboard:${storeId}`).emit('dashboard:activity:updated', {
      log,
      timestamp: new Date().toISOString()
    });
  }

  // Stats updated
  public emitStatsUpdated(storeId: string, stats: ITodayStats): void {
    this.io.to(`dashboard:${storeId}`).emit('stats:updated', {
      ...stats,
      timestamp: new Date().toISOString()
    });
  }

  // System notification
  public emitSystemNotification(storeId: string, notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    data?: any;
  }): void {
    this.io.to(`store:${storeId}`).emit('system:notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all clients in store
  public broadcastToStore(storeId: string, event: string, data: any): void {
    this.io.to(`store:${storeId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection statistics
  public getConnectionStats(): {
    totalConnections: number;
    connectionsByStore: { [storeId: string]: number };
  } {
    const connectionsByStore: { [storeId: string]: number } = {};

    for (const socket of this.connectedClients.values()) {
      if (socket.storeId) {
        connectionsByStore[socket.storeId] = (connectionsByStore[socket.storeId] || 0) + 1;
      }
    }

    return {
      totalConnections: this.connectedClients.size,
      connectionsByStore
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('Shutting down WebSocket manager...');

    // Notify all clients about shutdown
    this.io.emit('system:shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });

    // Give clients time to receive the message
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close all connections
    this.io.close();
    this.connectedClients.clear();

    console.log('WebSocket manager shutdown complete');
  }

  // Get Socket.IO instance for external use
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance
let webSocketManager: WebSocketManager | null = null;

export const createWebSocketManager = (httpServer: HTTPServer): WebSocketManager => {
  if (!webSocketManager) {
    webSocketManager = new WebSocketManager(httpServer);
  }
  return webSocketManager;
};

export const getWebSocketManager = (): WebSocketManager => {
  if (!webSocketManager) {
    throw new Error('WebSocket manager not initialized. Call createWebSocketManager first.');
  }
  return webSocketManager;
};