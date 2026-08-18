import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { supabase } from './config/database';
import jwt from 'jsonwebtoken';
import { config } from './config';

interface ChatMessage {
  role: string;
  content: string;
  language?: string;
  room?: string;
}

interface AuthPayload {
  userId: string;
  email: string;
  role?: string;
}

export function createWebSocketServer(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/ws',
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token as string, config.jwtSecret) as any;
      (socket as any).user = { userId: decoded.id || decoded.userId, email: decoded.email, role: decoded.role };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as AuthPayload;
    console.log(`[WS] User connected: ${user.email} (${user.role || 'unknown'})`);

    socket.join(`user:${user.userId}`);

    socket.on('prerana:chat', async (data: ChatMessage) => {
      const message = data.content || data;
      if (!message || typeof message !== 'string') return;

      try {
        const { data: chatResponse, error } = await supabase.rpc('prerana_chat', {
          p_message: message,
          p_role: data.role || user.role || 'student',
          p_language: data.language || 'en',
          p_user_id: user.userId,
        });

        if (error) {
          socket.emit('prerana:response', {
            reply: "I'm having trouble processing your request. Please try again.",
            suggestions: [],
          });
          return;
        }

        socket.emit('prerana:response', {
          reply: chatResponse?.reply || `You said: "${message}". I'm processing your request as a ${data.role || user.role || 'student'} assistant.`,
          suggestions: chatResponse?.suggestions || [],
        });
      } catch {
        socket.emit('prerana:response', {
          reply: `You said: "${message}". I'll help you with that right away.`,
          suggestions: [],
        });
      }
    });

    socket.on('prerana:join-room', (room: string) => {
      socket.join(room);
    });

    socket.on('prerana:typing', (data: { room?: string; isTyping: boolean }) => {
      const room = data.room || `user:${user.userId}`;
      socket.to(room).emit('prerana:typing', { userId: user.userId, isTyping: data.isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`[WS] User disconnected: ${user.email}`);
    });
  });

  return io;
}
