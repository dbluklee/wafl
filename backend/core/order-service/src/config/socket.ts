import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './index';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from '../types';

let io: SocketServer | null = null;

export function initializeSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true
    },
    path: config.websocket.path
  });

  // Socket 인증 미들웨어
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as IJwtPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // 연결 처리
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}, User: ${socket.data.user.userId}`);

    // Store별 룸 조인
    socket.on('join:store', (storeId: string) => {
      if (socket.data.user.storeId === storeId) {
        socket.join(`store:${storeId}`);
        console.log(`Socket ${socket.id} joined store:${storeId}`);
      }
    });

    // Table별 룸 조인
    socket.on('join:table', (tableId: string) => {
      socket.join(`table:${tableId}`);
      console.log(`Socket ${socket.id} joined table:${tableId}`);
    });

    // Kitchen 룸 조인
    socket.on('join:kitchen', (storeId: string) => {
      if (socket.data.user.storeId === storeId) {
        socket.join(`kitchen:${storeId}`);
        console.log(`Socket ${socket.id} joined kitchen:${storeId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

// 이벤트 발송 헬퍼
export function emitToStore(storeId: string, event: string, data: any) {
  try {
    const io = getIO();
    io.to(`store:${storeId}`).emit(event, data);
  } catch (error) {
    console.error('Failed to emit to store:', error);
  }
}

export function emitToTable(tableId: string, event: string, data: any) {
  try {
    const io = getIO();
    io.to(`table:${tableId}`).emit(event, data);
  } catch (error) {
    console.error('Failed to emit to table:', error);
  }
}

export function emitToKitchen(storeId: string, event: string, data: any) {
  try {
    const io = getIO();
    io.to(`kitchen:${storeId}`).emit(event, data);
  } catch (error) {
    console.error('Failed to emit to kitchen:', error);
  }
}