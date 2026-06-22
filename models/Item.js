const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
      type: String,
      enum: ['Note', 'Task', 'Reminder', 'CalendarEvent'],
      required: [true, 'Please specify itemType'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    content: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    dueDate: {
      type: Date, // For Tasks and Reminders
    },
    startTime: {
      type: Date, // For Calendar Events
    },
    endTime: {
      type: Date, // For Calendar Events
    },
    location: {
      type: String, // For Calendar Events
    },
    isSynced: {
      type: Boolean,
      default: true, // If created on server, it's synced. Client overrides this if offline
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
