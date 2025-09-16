import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { IWebSocketMessage, IWebSocketSubscription, IJWTPayload } from '../types';
import { verifyJWT, extractBearerToken } from '../utils';
import config from '../config';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, {
    ws: WebSocket;
    user: IJWTPayload;
    subscriptions: IWebSocketSubscription;
  }> = new Map();

  private upstreamConnections: Map<string, WebSocket> = new Map();

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public initialize(server: any): void {
    console.log(`[WebSocket] Initializing WebSocket server on path: ${config.websocket.path}`);

    this.wss = new WebSocket.Server({
      server,
      path: config.websocket.path,
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleServerError.bind(this));

    // Initialize upstream connections to notification service
    this.initializeUpstreamConnections();

    console.log('[WebSocket] WebSocket server initialized successfully');
  }

  private verifyClient(info: {
    origin: string;
    secure: boolean;
    req: IncomingMessage;
  }): boolean {
    try {
      const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        console.warn('[WebSocket] Connection rejected: No token provided');
        return false;
      }

      const payload = verifyJWT(token);
      if (!payload) {
        console.warn('[WebSocket] Connection rejected: Invalid token');
        return false;
      }

      // Store user info for later use
      (info.req as any).user = payload;
      return true;
    } catch (error) {
      console.error('[WebSocket] Client verification error:', error);
      return false;
    }
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const user = (req as any).user as IJWTPayload;
    const clientId = `${user.userId}-${user.storeId}-${Date.now()}`;

    console.log(`[WebSocket] Client connected: ${clientId} (${user.role})`);

    // Store client connection
    this.clients.set(clientId, {
      ws,
      user,
      subscriptions: {
        storeId: user.storeId,
        userId: user.userId,
        events: [],
        topics: [],
      },
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection.established',
      storeId: user.storeId,
      timestamp: new Date().toISOString(),
      payload: {
        clientId,
        message: 'WebSocket connection established',
        supportedEvents: this.getSupportedEvents(),
      },
    });

    // Handle incoming messages
    ws.on('message', (data: WebSocket.Data) => {
      this.handleClientMessage(clientId, data);
    });

    // Handle client disconnect
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`[WebSocket] Client disconnected: ${clientId} (${code}: ${reason.toString()})`);
      this.clients.delete(clientId);
    });

    // Handle client error
    ws.on('error', (error: Error) => {
      console.error(`[WebSocket] Client error: ${clientId}:`, error.message);
      this.clients.delete(clientId);
    });

    // Send heartbeat
    this.startHeartbeat(clientId);
  }

  private handleClientMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        console.warn(`[WebSocket] Message from unknown client: ${clientId}`);
        return;
      }

      console.log(`[WebSocket] Message from ${clientId}:`, message.action);

      switch (message.action) {
        case 'subscribe':
          this.handleSubscription(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        default:
          this.sendError(clientId, 'Unknown action', { action: message.action });
          break;
      }
    } catch (error: any) {
      console.error(`[WebSocket] Error parsing message from ${clientId}:`, error.message);
      this.sendError(clientId, 'Invalid message format');
    }
  }

  private handleSubscription(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { events, topics } = message;

    if (events) {
      client.subscriptions.events = [...new Set([...client.subscriptions.events, ...events])];
    }

    if (topics) {
      client.subscriptions.topics = [...new Set([...client.subscriptions.topics, ...topics])];
    }

    this.sendToClient(clientId, {
      type: 'subscription.confirmed',
      storeId: client.user.storeId,
      timestamp: new Date().toISOString(),
      payload: {
        events: client.subscriptions.events,
        topics: client.subscriptions.topics,
      },
    });

    console.log(`[WebSocket] Client ${clientId} subscribed to:`, {
      events: client.subscriptions.events,
      topics: client.subscriptions.topics,
    });
  }

  private handleUnsubscription(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { events, topics } = message;

    if (events) {
      client.subscriptions.events = client.subscriptions.events.filter(e => !events.includes(e));
    }

    if (topics) {
      client.subscriptions.topics = client.subscriptions.topics.filter(t => !topics.includes(t));
    }

    this.sendToClient(clientId, {
      type: 'unsubscription.confirmed',
      storeId: client.user.storeId,
      timestamp: new Date().toISOString(),
      payload: {
        events: client.subscriptions.events,
        topics: client.subscriptions.topics,
      },
    });
  }

  private handlePing(clientId: string): void {
    this.sendToClient(clientId, {
      type: 'pong',
      storeId: this.clients.get(clientId)?.user.storeId || '',
      timestamp: new Date().toISOString(),
      payload: { message: 'pong' },
    });
  }

  private startHeartbeat(clientId: string): void {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      } else {
        clearInterval(interval);
        this.clients.delete(clientId);
      }
    }, 30000); // 30 seconds heartbeat
  }

  private initializeUpstreamConnections(): void {
    const notificationServiceUrl = config.services['notification-service']?.url;

    if (notificationServiceUrl) {
      this.connectToUpstreamService('notification-service', notificationServiceUrl);
    }
  }

  private connectToUpstreamService(serviceName: string, serviceUrl: string): void {
    try {
      const wsUrl = serviceUrl.replace('http', 'ws') + '/ws';
      console.log(`[WebSocket] Connecting to upstream service: ${serviceName} at ${wsUrl}`);

      const upstreamWs = new WebSocket(wsUrl);

      upstreamWs.on('open', () => {
        console.log(`[WebSocket] Connected to upstream service: ${serviceName}`);
        this.upstreamConnections.set(serviceName, upstreamWs);
      });

      upstreamWs.on('message', (data: WebSocket.Data) => {
        this.handleUpstreamMessage(serviceName, data);
      });

      upstreamWs.on('error', (error: Error) => {
        console.error(`[WebSocket] Upstream service error (${serviceName}):`, error.message);
      });

      upstreamWs.on('close', () => {
        console.warn(`[WebSocket] Upstream service disconnected: ${serviceName}`);
        this.upstreamConnections.delete(serviceName);

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.connectToUpstreamService(serviceName, serviceUrl);
        }, 5000);
      });

    } catch (error: any) {
      console.error(`[WebSocket] Error connecting to upstream service ${serviceName}:`, error.message);
    }
  }

  private handleUpstreamMessage(serviceName: string, data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString()) as IWebSocketMessage;
      console.log(`[WebSocket] Message from ${serviceName}:`, message.type);

      // Broadcast to relevant clients
      this.broadcastToClients(message);
    } catch (error: any) {
      console.error(`[WebSocket] Error parsing upstream message from ${serviceName}:`, error.message);
    }
  }

  public broadcastToClients(message: IWebSocketMessage): void {
    let sentCount = 0;

    for (const [clientId, client] of this.clients.entries()) {
      if (this.shouldSendToClient(client, message)) {
        this.sendToClient(clientId, message);
        sentCount++;
      }
    }

    console.log(`[WebSocket] Broadcast message ${message.type} sent to ${sentCount} clients`);
  }

  private shouldSendToClient(
    client: { user: IJWTPayload; subscriptions: IWebSocketSubscription },
    message: IWebSocketMessage
  ): boolean {
    // Check store ID match
    if (message.storeId && client.user.storeId !== message.storeId) {
      return false;
    }

    // Check user ID match for user-specific messages
    if (message.userId && client.user.userId !== message.userId) {
      return false;
    }

    // Check event subscription
    if (client.subscriptions.events.length > 0) {
      if (!client.subscriptions.events.includes(message.type) && !client.subscriptions.events.includes('*')) {
        return false;
      }
    }

    // Check topic subscription
    if (client.subscriptions.topics.length > 0 && message.payload?.topic) {
      if (!client.subscriptions.topics.includes(message.payload.topic) && !client.subscriptions.topics.includes('*')) {
        return false;
      }
    }

    return true;
  }

  private sendToClient(clientId: string, message: IWebSocketMessage): void {
    const client = this.clients.get(clientId);

    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error: any) {
        console.error(`[WebSocket] Error sending to client ${clientId}:`, error.message);
        this.clients.delete(clientId);
      }
    }
  }

  private sendError(clientId: string, message: string, details?: any): void {
    this.sendToClient(clientId, {
      type: 'error',
      storeId: this.clients.get(clientId)?.user.storeId || '',
      timestamp: new Date().toISOString(),
      payload: { message, details },
    });
  }

  private handleServerError(error: Error): void {
    console.error('[WebSocket] Server error:', error);
  }

  private getSupportedEvents(): string[] {
    return [
      'order.created',
      'order.status.changed',
      'table.status.changed',
      'payment.completed',
      'menu.soldout',
      'kitchen.order.ready',
      'ai.suggestion',
    ];
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getClientsByStore(storeId: string): number {
    return Array.from(this.clients.values()).filter(client => client.user.storeId === storeId).length;
  }

  public close(): void {
    if (this.wss) {
      console.log('[WebSocket] Closing WebSocket server');

      // Close all client connections
      for (const [clientId, client] of this.clients.entries()) {
        client.ws.close(1000, 'Server shutdown');
      }

      // Close upstream connections
      for (const [serviceName, ws] of this.upstreamConnections.entries()) {
        ws.close();
      }

      this.wss.close();
      this.clients.clear();
      this.upstreamConnections.clear();
    }
  }
}