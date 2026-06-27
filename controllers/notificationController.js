// @desc    Schedule a delayed notification
// @route   POST /api/v1/notifications/schedule
// @access  Private
export const scheduleNotification = async (req, res) => {
  try {
    const { title, message, delayMs } = req.body;

    if (!title || !message || delayMs === undefined) {
      return res.status(400).json({ message: 'Please provide title, message, and delayMs' });
    }

    const delay = parseInt(delayMs, 10);

    // Simulate scheduling a background job
    console.log(`[Notification Scheduler] Scheduled: "${title}" in ${delay}ms`);

    setTimeout(() => {
      console.log('\n----------------------------------------');
      console.log(`[NOTIFICATION TRIGGERED]`);
      console.log(`User: ${req.user.email}`);
      console.log(`Title: ${title}`);
      console.log(`Message: ${message}`);
      console.log('----------------------------------------\n');
    }, delay);

    res.status(200).json({
      message: 'Notification scheduled successfully',
      scheduledFor: new Date(Date.now() + delay),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
