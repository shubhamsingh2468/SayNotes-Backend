import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import runSeed from './scripts/seed.js';

import authRoutes from './routes/authRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

import { startCheckInWorker } from './workers/checkInWorker.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api', itemRoutes); // Exposing at /api as per instructions

// Basic route
app.get('/', (req, res) => {
  res.send('SayNote API is running...');
});

const PORT = process.env.PORT || 5000;

connectDB().then(async (isMemory) => {
  if (isMemory) {
    console.log('Detected Memory Server. Auto-seeding database...');
    await runSeed();
  }
  
  // Start the background worker
  startCheckInWorker();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
