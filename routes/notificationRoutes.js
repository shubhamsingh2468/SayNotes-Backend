const express = require('express');
const router = express.Router();
const { scheduleNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/schedule', protect, scheduleNotification);

module.exports = router;
