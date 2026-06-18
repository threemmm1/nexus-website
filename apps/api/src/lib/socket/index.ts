import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { corsOrigins } from '../../config/env';
import { logger } from '../logger';
import { verifyAccessToken } from '../../services/token.service';

let io: SocketServer;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    const payload = verifyAccessToken(token);
    if (!payload) return next(new Error('Invalid token'));
    socket.data['userId'] = payload.userId;
    socket.data['role'] = payload.role;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    void socket.join(`user:${userId}`);
    logger.debug(`Socket connected: ${userId}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export async function closeSocket(): Promise<void> {
  if (!io) return;
  await io.close();
}
