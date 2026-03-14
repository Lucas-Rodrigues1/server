import 'dotenv/config';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import passport from './middlewares/passport';
import authRoutes from './routes/auth/auth.routes';
import usersRoutes from './routes/users/users.router';
import friendsRoutes from './routes/friends/friends.routes';
import chatRoutes from './routes/chat/chat.routes';
import { initSocket } from './socket';
import { registerChatHandlers } from './sockets/chat.socket';

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});
app.use(express.json({ limit: '5mb' }));

app.use(passport.initialize());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/friends', friendsRoutes);
app.use('/chat', chatRoutes);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
    } else {
    }

    const io = initSocket(httpServer);
    registerChatHandlers();

    const connections = new Set<any>();
    httpServer.on('connection', (conn) => {
      connections.add(conn);
      conn.on('close', () => connections.delete(conn));
    });

    httpServer.listen(port, () => {
      // Ping próprio a cada 5 minutos para manter o serviço ativo no Render
      const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
      setInterval(async () => {
        try {
          await fetch(`${selfUrl}/health`);
        } catch (err) {
          console.error('Health check failed:', err);
        }
      }, 5 * 60 * 1000);
    });

    const shutdown = () => {
      io.close();
      connections.forEach((conn) => conn.destroy());
      httpServer.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
