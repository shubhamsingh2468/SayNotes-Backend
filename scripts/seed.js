require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');

const runSeed = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});

    console.log('Cleared existing database data.');

    // 1. Create a Test User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testUser = await User.create({
      name: 'Test User',
      email: 'test@saynote.com',
      password: hashedPassword,
    });

    console.log('Created test user:', testUser.email);

    // 2. Create Mock Items for the user
    const items = [
      {
        user: testUser._id,
        itemType: 'Note',
        title: 'Project Ideas',
        content: '1. SayNote Mobile App\n2. AI Content Generator',
        isSynced: true,
      },
      {
        user: testUser._id,
        itemType: 'Task',
        title: 'Finish backend API',
        content: 'Complete the Node.js/Express backend for SayNote MVP.',
        isCompleted: false,
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000), // Due in 1 day
        isSynced: true,
      },
      {
        user: testUser._id,
        itemType: 'Reminder',
        title: 'Buy Groceries',
        dueDate: new Date(Date.now() + 3600000), // Due in 1 hour
        isSynced: true,
      },
      {
        user: testUser._id,
        itemType: 'CalendarEvent',
        title: 'Weekly Sync',
        location: 'Google Meet',
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000), // + 1 hour
        isSynced: true,
      },
    ];

    await Item.insertMany(items);
    console.log('Created mock items for testing.');

    console.log('Data Seeding Successful!');
  } catch (error) {
    console.error('Data Seeding Failed:', error);
  }
};

// If run directly via CLI
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await runSeed();
    process.exit();
  });
}

module.exports = runSeed;
