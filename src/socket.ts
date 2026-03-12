import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyJWT } from './middlewares/jwt';

export interface TriggerPayload<T = unknown> {
  event: string;
  data: T;
}

type TriggerHandler<T = unknown> = (socket: Socket, data: T) => void;

let io: SocketIOServer;

const handlers = new Map<string, TriggerHandler<any>>();

export function onTrigger<T = unknown>(event: string, handler: TriggerHandler<T>): void {
  handlers.set(event, handler as TriggerHandler<any>);
}

export function emitTrigger<T = unknown>(event: string, data: T): void {
  getIO().emit('trigger-event', { event, data } satisfies TriggerPayload<T>);
}

export function emitTriggerTo<T = unknown>(room: string, event: string, data: T): void {
  getIO().to(room).emit('trigger-event', { event, data } satisfies TriggerPayload<T>);
}

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Unauthorized: token não fornecido'));

    const payload = verifyJWT(token);
    if (!payload) return next(new Error('Unauthorized: token inválido ou expirado'));

    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    socket.join(user.id);
    console.log(`[Socket] Connected: ${socket.id} (user: ${user.username})`);

    socket.on('trigger-event', ({ event, data }: TriggerPayload) => {
      const handler = handlers.get(event);
      if (handler) {
        handler(socket, data);
      } else {
        console.warn(`[Socket] Nenhum handler registrado para o evento: "${event}"`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io não foi inicializado. Chame initSocket primeiro.');
  return io;
}
