import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import router from './routes/users/users.router';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript world!');
});

async function start() {
  try {
    // Example MongoDB connection, adjust URI as needed
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
