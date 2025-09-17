import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { WS_CONFIG } from '@/utils/constants';
import { WebSocketEvent } from '@/types';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  emit: <T = any>(event: string, data?: T) => void;
  on: <T = any>(event: string, handler: (data: T) => void) => () => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();

  const { accessToken, isAuthenticated } = useAuthStore();

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected || !isAuthenticated || !accessToken) {
      return;
    }

    setIsConnecting(true);

    try {
      // Create socket connection
      const socket = io(WS_CONFIG.URL, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket'],
        reconnection: false, // We handle reconnection manually
        timeout: 20000,
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping');
          }
        }, WS_CONFIG.PING_INTERVAL);

        onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = undefined;
        }

        onDisconnect?.();

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
            connect();
          }, WS_CONFIG.RECONNECT_INTERVAL);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnecting(false);

        const errorObj = new Error(`WebSocket connection failed: ${error.message}`);
        onError?.(errorObj);

        // Auto-reconnect on connection error
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect after error (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
            connect();
          }, WS_CONFIG.RECONNECT_INTERVAL);
        }
      });

      // Pong handler
      socket.on('pong', () => {
        // Connection is alive
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      onError?.(error as Error);
    }
  }, [accessToken, isAuthenticated, autoReconnect, maxReconnectAttempts, reconnectAttempts, onConnect, onDisconnect, onError]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = undefined;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, []);

  // Emit event to server
  const emit = useCallback(<T = any>(event: string, data?: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }, []);

  // Listen for events from server
  const on = useCallback(<T = any>(event: string, handler: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);

      // Return cleanup function
      return () => {
        socketRef.current?.off(event, handler);
      };
    }

    return () => {};
  }, []);

  // Remove event listener
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.removeAllListeners(event);
      }
    }
  }, []);

  // Effect for managing connection lifecycle
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    reconnectAttempts,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

// Typed WebSocket event hooks
export function useWebSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  options: UseWebSocketOptions = {}
) {
  const { on } = useWebSocket(options);

  useEffect(() => {
    const cleanup = on<T>(event, handler);
    return cleanup;
  }, [event, handler, on]);
}

// Specific event hooks for common WebSocket events
export function useTableStatusEvent(handler: (data: any) => void) {
  useWebSocketEvent('table.status.changed', handler);
}

export function useOrderEvent(handler: (data: any) => void) {
  useWebSocketEvent('order.created', handler);
  useWebSocketEvent('order.updated', handler);
  useWebSocketEvent('order.completed', handler);
}

export function usePaymentEvent(handler: (data: any) => void) {
  useWebSocketEvent('payment.completed', handler);
  useWebSocketEvent('payment.failed', handler);
}

export function usePOSLogEvent(handler: (data: any) => void) {
  useWebSocketEvent('pos.log.created', handler);
}