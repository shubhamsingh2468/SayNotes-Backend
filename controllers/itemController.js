import Item from '../models/Item.js';
import { aiParsingService } from '../services/mockAiService.js';
import { syncWithGoogleCalendar } from '../services/mockCalendarService.js';
import { generateBriefingTextService } from '../services/mockBriefingService.js';

/**
 * @desc    Accept raw text, pass it to mock AI service, and save a temp entry
 * @route   POST /api/process-input
 */
export const processInput = async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    // Call mock AI service
    const parsedData = await aiParsingService(transcript);
    
    // Create new Item with status 'pending_confirmation'
    const newItem = await Item.create({
      userId: req.user._id,
      type: parsedData.type,
      title: parsedData.title,
      content: parsedData.content,
      startTime: parsedData.startTime,
      endTime: parsedData.endTime,
      status: 'pending_confirmation'
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error in processInput:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Finalize or reject the AI-parsed item
 * @route   POST /api/items/confirm
 */
export const confirmItem = async (req, res) => {
  try {
    const { itemId, action, editedData } = req.body;

    if (!itemId || !action) {
      return res.status(400).json({ message: 'Item ID and action are required' });
    }

    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user owns the item
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (action === 'cancel') {
      item.status = 'cancelled';
      await item.save();
      return res.status(200).json({ message: 'Item cancelled', item });
    }

    if (action === 'save') {
      // Apply modifications
      if (editedData) {
        Object.assign(item, editedData);
      }
      item.status = 'active';
      
      if (item.type === 'Event') {
        // TODO: Call Google Calendar API service stub
        const gcalResponse = await syncWithGoogleCalendar(item);
        item.googleEventId = gcalResponse.googleEventId;
      }
      
      const updatedItem = await item.save();
      return res.status(200).json(updatedItem);
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error('Error in confirmItem:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Retrieve aggregated data for a specific date to build the summary
 * @route   GET /api/dashboard/daily-briefing
 */
export const getDailyBriefing = async (req, res) => {
  try {
    const { date } = req.query; // Expected format: YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Query for items on this date (startTime or createdAt)
    const items = await Item.find({
      userId: req.user._id,
      $or: [
        { startTime: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay }, startTime: null }
      ]
    });

    const summaryText = await generateBriefingTextService(items);

    res.status(200).json({
      summary: summaryText,
      rawItems: items
    });
  } catch (error) {
    console.error('Error in getDailyBriefing:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Pull local events for a date range
 * @route   GET /api/calendar/agenda
 */
export const getCalendarAgenda = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'start_date and end_date are required' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setUTCHours(23, 59, 59, 999);

    const events = await Item.find({
      userId: req.user._id,
      type: 'Event',
      status: 'active',
      startTime: { $gte: startDate, $lte: endDate }
    }).sort({ startTime: 1 });

    // TODO: Fetch external Google Calendar events and merge them here
    // const externalEvents = await fetchGoogleCalendarEvents(req.user, startDate, endDate);
    // const mergedEvents = [...events, ...externalEvents].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getCalendarAgenda:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update item completion state from check-in notifications
 * @route   PATCH /api/items/:id/status
 */
export const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reschedule, new_startTime } = req.body;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user owns the item
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (reschedule && new_startTime) {
      item.startTime = new Date(new_startTime);
      item.status = 'active'; 
    } else if (status) {
      item.status = status;
    }

    const updatedItem = await item.save();

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error in updateItemStatus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all items (notes) for the authenticated user, optionally filtered by category
 * @route   GET /api/notes
 */
export const getNotes = async (req, res) => {
  try {
    const query = { userId: req.user._id };
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    const notes = await Item.find(query).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get a specific item (note) by ID
 * @route   GET /api/notes/:id
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Item.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership verification
    if (note.userId.toString() !== req.user.id && note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this note' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('Error in getNoteById:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Update a specific item (note) by ID
 * @route   PUT /api/notes/:id
 */
export const updateNote = async (req, res) => {
  try {
    const note = await Item.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership verification
    if (note.userId.toString() !== req.user.id && note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this note' });
    }

    const updatedNote = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Delete a specific item (note) by ID
 * @route   DELETE /api/notes/:id
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Item.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership verification
    if (note.userId.toString() !== req.user.id && note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this note' });
    }

    await note.deleteOne();

    res.status(200).json({ message: 'Note removed' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
