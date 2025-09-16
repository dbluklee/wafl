import express from 'express';
import { Log } from '../models/Log';
import { UndoService } from '../services/undoService';

const router = express.Router();

// Get all logs
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await Log.findAll(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs by store ID
router.get('/store/:storeId', async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await Log.findByStoreId(storeId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by store:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await Log.findByType(type, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs by type:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get log by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    
    const log = await Log.findById(id);
    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    if (error instanceof Error && error.message === 'Log not found') {
      res.status(404).json({ error: 'Log not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch log' });
    }
  }
});

// Create new log
router.post('/', async (req, res) => {
  try {
    // Support both frontend format and direct API format
    const { 
      // Frontend format
      eventId, text, userId, storeNumber, timestamp, additionalData,
      // Direct API format
      type, message, store_id, metadata 
    } = req.body;
    
    // Map frontend format to backend format
    const logType = type || eventId || 'general';
    const logMessage = message || text;
    const storeId = store_id || 1; // Default to 1 for now, should come from session
    
    // Validation
    if (!logMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields: message or text' 
      });
    }
    
    // Combine all metadata
    let combinedMetadata = metadata || {};
    
    // Handle additionalData from frontend (contains preData/postData)
    if (additionalData) {
      combinedMetadata = { ...combinedMetadata, ...additionalData };
    }

    const newLog = await Log.create({
      store_id: storeId,
      type: logType,
      message: logMessage,
      metadata: Object.keys(combinedMetadata).length > 0 ? JSON.stringify(combinedMetadata) : undefined
    });
    
    // Return success response in the format frontend expects
    res.status(201).json({ 
      success: true,
      data: newLog,
      message: 'Log created successfully'
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Undo log action - Using unified undo service
router.post('/:id/undo', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    
    // Use the unified undo service
    const result = await UndoService.undoLog(id);
    
    // Return the result
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        data: result.result 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.message 
      });
    }
  } catch (error) {
    console.error('Error performing undo:', error);
    if (error instanceof Error && error.message === 'Log not found') {
      res.status(404).json({ error: 'Log not found' });
    } else {
      res.status(500).json({ error: 'Failed to perform undo' });
    }
  }
});

// Delete log (for undo functionality)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    
    const deleted = await Log.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;