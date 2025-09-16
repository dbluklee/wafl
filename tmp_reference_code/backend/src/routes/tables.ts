import express from 'express';
import { Table } from '../models/Table';
import { Place } from '../models/Place';

const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.findAll();
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get tables by store ID
router.get('/store/:storeId', async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const tables = await Table.findByStoreId(storeId);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables by store number:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get tables by place ID
router.get('/place/:placeId', async (req, res) => {
  try {
    const placeId = parseInt(req.params.placeId);
    if (isNaN(placeId)) {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
    
    const tables = await Table.findByPlaceId(placeId);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables by place ID:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }
    
    const table = await Table.findById(id);
    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    if (error instanceof Error && error.message === 'Table not found') {
      res.status(404).json({ error: 'Table not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch table' });
    }
  }
});

// Create a new table
router.post('/', async (req, res) => {
  try {
    const { place_id, name, color, dining_capacity = 4, store_id } = req.body;
    
    if (!place_id || !name || !color || !store_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: place_id, name, color, store_id' 
      });
    }

    // Verify that the place exists
    try {
      await Place.findById(place_id);
    } catch (error) {
      return res.status(400).json({ error: 'Place not found' });
    }

    // Check if table name already exists in this place
    const existingTable = await Table.findByName(name, place_id);
    if (existingTable) {
      return res.status(400).json({ error: 'Table name already exists in this place' });
    }

    const newTable = await Table.create({
      store_id: parseInt(store_id),
      place_id: parseInt(place_id),
      name,
      color,
      dining_capacity: parseInt(dining_capacity) || 4
    });

    res.status(201).json(newTable);
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// Update a table
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const { place_id, name, color, dining_capacity, store_id } = req.body;

    // If place_id is being updated, verify the place exists
    if (place_id) {
      try {
        await Place.findById(place_id);
      } catch (error) {
        return res.status(400).json({ error: 'Place not found' });
      }
    }

    // If name is being updated, check for conflicts within the place
    if (name && place_id) {
      const existingTable = await Table.findByName(name, place_id);
      if (existingTable && existingTable.id !== id) {
        return res.status(400).json({ error: 'Table name already exists in this place' });
      }
    }

    const updates: any = {};
    if (place_id !== undefined) updates.place_id = parseInt(place_id);
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (dining_capacity !== undefined) updates.dining_capacity = parseInt(dining_capacity);
    if (store_id !== undefined) updates.store_id = parseInt(store_id);

    const updatedTable = await Table.update(id, updates);
    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    if (error instanceof Error && error.message === 'Table not found') {
      res.status(404).json({ error: 'Table not found' });
    } else {
      res.status(500).json({ error: 'Failed to update table' });
    }
  }
});

// Delete a table
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid table ID' });
    }

    const success = await Table.delete(id);
    if (success) {
      res.json({ message: 'Table deleted successfully' });
    } else {
      res.status(404).json({ error: 'Table not found' });
    }
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

export default router;