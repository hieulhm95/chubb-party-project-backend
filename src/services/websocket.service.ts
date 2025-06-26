import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export function initWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Configure this based on your frontend domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle client disconnection
    socket.on('disconnect', reason => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle custom events
    socket.on('userLeft', data => {
      logger.info(`User left: ${data.username}`);
      socket.broadcast.emit('userLeft', {
        username: data.username,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle user status updates
    socket.on('userStatusUpdate', data => {
      logger.info(`User status update: ${data.username} - ${data.status}`);
      socket.broadcast.emit('userStatusUpdate', {
        username: data.username,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    });

    // Send welcome message to connected client
    socket.emit('connected', {
      message: 'Successfully connected to WebSocket server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initWebSocket first.');
  }
  return io;
}
