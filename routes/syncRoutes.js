const express = require('express');
const router = express.Router();
const { syncItems } = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, syncItems);

module.exports = router;
