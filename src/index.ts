import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
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

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/friends', friendsRoutes);
app.use('/chat', chatRoutes);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('No MONGODB_URI provided, skipping database connection');
    }

    const io = initSocket(httpServer);
    registerChatHandlers();

    // rastreia conexões HTTP abertas para destruí-las no shutdown
    const connections = new Set<any>();
    httpServer.on('connection', (conn) => {
      connections.add(conn);
      conn.on('close', () => connections.delete(conn));
    });

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
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
