import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyJWT } from './middlewares/jwt';
import UsersService from './services/users/users.service';
import FriendshipRepository from './repository/friendship.repository';
import { UserStatus } from './schemas/user.schema';

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
    maxHttpBufferSize: 5e6, // 5MB for image messages
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      console.warn(`[Socket] Conexão recusada: token não fornecido (${socket.id})`);
      return next(new Error('Unauthorized: token não fornecido'));
    }

    const payload = verifyJWT(token);
    if (!payload) {
      console.warn(`[Socket] Conexão recusada: token inválido (${socket.id})`);
      return next(new Error('Unauthorized: token inválido ou expirado'));
    }

    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    socket.join(user.id);

    // Mark user as online and notify friends
    UsersService.updateStatus(user.id, 'online').then(() => {
      broadcastStatusToFriends(user.id, 'online', user.username);
    });

    socket.on('trigger-event', ({ event, data }: TriggerPayload) => {
      const handler = handlers.get(event);
      if (handler) {
        handler(socket, data);
      } else {
        console.warn(`[Socket] Nenhum handler registrado para o evento: "${event}"`);
      }
    });

    socket.on('disconnect', () => {
      UsersService.updateStatus(user.id, 'offline').then(() => {
        broadcastStatusToFriends(user.id, 'offline', user.username);
      });
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io não foi inicializado. Chame initSocket primeiro.');
  return io;
}

async function broadcastStatusToFriends(userId: string, status: UserStatus, username: string) {
  const friendships = await FriendshipRepository.findAccepted(userId);
  const payload = { userId, username, status };
  for (const f of friendships) {
    const friendId = (f.requester as any)._id?.toString() === userId
      ? (f.recipient as any)._id?.toString()
      : (f.requester as any)._id?.toString();
    if (friendId) {
      getIO().to(friendId).emit('trigger-event', { event: 'user:status', data: payload });
    }
  }
}
