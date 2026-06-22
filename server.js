require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const runSeed = require('./scripts/seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/sync', require('./routes/syncRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));

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
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
