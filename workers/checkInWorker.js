import Item from '../models/Item.js';
// import axios from 'axios'; // Example: import axios for making HTTP requests

/**
 * Background worker to check for items that need check-in
 * Can be imported into server.js and initialized, e.g., startCheckInWorker()
 */
export const startCheckInWorker = () => {
  const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  console.log('[WORKER] Check-in worker started...');

  setInterval(async () => {
    try {
      const now = new Date();

      // Find active tasks or events in the past that haven't triggered check-in
      const itemsToCheckIn = await Item.find({
        type: { $in: ['Task', 'Event'] },
        status: 'active',
        checkInTriggered: false,
        $or: [
          { endTime: { $lte: now, $ne: null } },
          { startTime: { $lte: now, $ne: null }, endTime: null }
        ]
      });

      for (const item of itemsToCheckIn) {
        // Mark as triggered
        item.checkInTriggered = true;
        await item.save();

        console.log(`[WORKER] Triggering check-in push notification via /schedule API for item: ${item.title}`);
        
        // TODO: Call your actual push notification /schedule endpoint here
        // await axios.post('http://localhost:5000/api/v1/notifications/schedule', {
        //   userId: item.userId,
        //   message: `How did "${item.title}" go?`,
        //   itemId: item._id
        // });
      }
    } catch (error) {
      console.error('[WORKER] Error during check-in scan:', error);
    }
  }, CHECK_INTERVAL_MS);
};
