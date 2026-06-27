import Item from '../models/Item.js';

// @desc    Sync offline items
// @route   POST /api/v1/sync
// @access  Private
export const syncItems = async (req, res) => {
  try {
    const { items } = req.body; // Array of offline items

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Please provide an array of items' });
    }

    // Prepare bulk write operations
    const bulkOps = items.map((item) => {
      // Ensure the item belongs to the authenticated user
      item.user = req.user._id;
      item.isSynced = true;

      // If it has an _id, we update it. If not, we insert it.
      // But offline items usually come with a local ID or no MongoDB ID.
      // Assuming if they have an _id, it's an update. If not, it's an insert.
      // For upserting based on a custom id, you could use a localId field.
      // Here we assume items might have an existing _id if they were edited offline.

      if (item._id) {
        return {
          updateOne: {
            filter: { _id: item._id, user: req.user._id },
            update: { $set: item },
            upsert: true,
          },
        };
      } else {
        return {
          insertOne: {
            document: item,
          },
        };
      }
    });

    if (bulkOps.length > 0) {
      const result = await Item.bulkWrite(bulkOps);
      res.status(200).json({
        message: 'Sync successful',
        result,
      });
    } else {
      res.status(200).json({ message: 'No items to sync' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during sync', error: error.message });
  }
};
