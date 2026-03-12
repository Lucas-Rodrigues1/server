import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import passport from './middlewares/passport';
import authRoutes from './routes/auth/auth.routes';
import usersRoutes from './routes/users/users.router';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('No MONGODB_URI provided, skipping database connection');
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
