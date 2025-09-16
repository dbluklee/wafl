import express from 'express';
import { Place } from '../models/Place';

const router = express.Router();

// Get all places
router.get('/', async (req, res) => {
  try {
    const places = await Place.findAll();
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Get places by store ID
router.get('/store/:storeId', async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }
    
    const places = await Place.findByStoreId(storeId);
    res.json(places);
  } catch (error) {
    console.error('Error fetching places by store:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Get place by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    const place = await Place.findById(id);
    res.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    if (error instanceof Error && error.message === 'Place not found') {
      res.status(404).json({ error: 'Place not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch place' });
    }
  }
});

// Create new place
router.post('/', async (req, res) => {
  try {
    const { store_id, name, color, table_count } = req.body;
    
    // Validation
    if (!store_id || !name || !color) {
      return res.status(400).json({ 
        error: 'Missing required fields: store_id, name, color' 
      });
    }
    
    const newPlace = await Place.create({
      store_id,
      name,
      color,
      table_count: table_count || 0
    });
    
    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// Update place
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    const updates = req.body;
    const updatedPlace = await Place.update(id, updates);
    
    res.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    if (error instanceof Error && error.message === 'Place not found') {
      res.status(404).json({ error: 'Place not found' });
    } else {
      res.status(500).json({ error: 'Failed to update place' });
    }
  }
});

// Update order of places
router.put('/order', async (req, res) => {
  try {
    const { placeOrders } = req.body;
    
    if (!Array.isArray(placeOrders)) {
      return res.status(400).json({ error: 'placeOrders must be an array' });
    }
    
    // Validate that each item has id and sort_order
    for (const item of placeOrders) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and sort_order' });
      }
    }
    
    await Place.updateOrder(placeOrders);
    res.json({ message: 'Place order updated successfully' });
  } catch (error) {
    console.error('Error updating place order:', error);
    res.status(500).json({ error: 'Failed to update place order' });
  }
});

// Delete place
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    const deleted = await Place.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error deleting place:', error);
    if (error instanceof Error && error.message === 'Place not found') {
      res.status(404).json({ error: 'Place not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete place' });
    }
  }
});

export default router;