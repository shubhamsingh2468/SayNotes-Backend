import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Note', 'Task', 'Reminder', 'Event'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_confirmation', 'active', 'completed', 'cancelled'],
      default: 'pending_confirmation',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    googleEventId: {
      type: String,
    },
    checkInTriggered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Item', itemSchema);
