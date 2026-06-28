import express from 'express';
// Assumes authMiddleware exists to set req.user (protect route)
import { protect } from '../middleware/authMiddleware.js';
import {
  processInput,
  confirmItem,
  getDailyBriefing,
  getCalendarAgenda,
  updateItemStatus,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
} from '../controllers/itemController.js';

const router = express.Router();

// Route: POST /api/process-input
router.post('/process-input', protect, processInput);

// Route: POST /api/items/confirm
router.post('/items/confirm', protect, confirmItem);

// Route: GET /api/dashboard/daily-briefing
router.get('/dashboard/daily-briefing', protect, getDailyBriefing);

// Route: GET /api/calendar/agenda
router.get('/calendar/agenda', protect, getCalendarAgenda);

// Route: PATCH /api/items/:id/status
router.patch('/items/:id/status', protect, updateItemStatus);

// Note specific endpoints
router.get('/notes', protect, getNotes);
router.get('/notes/:id', protect, getNoteById);
router.put('/notes/:id', protect, updateNote);
router.delete('/notes/:id', protect, deleteNote);

export default router;
