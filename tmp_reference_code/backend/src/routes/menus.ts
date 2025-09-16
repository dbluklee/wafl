import express from 'express';
import { Menu } from '../models/Menu';

const router = express.Router();

// Get all menus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// Get menus by store ID
router.get('/store/:storeId', async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID' });
    }
    
    const menus = await Menu.findByStoreId(storeId);
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus by store:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// Get menus by category ID
router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const menus = await Menu.findByCategory(categoryId);
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus by category:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// Get menu by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu ID' });
    }
    
    const menu = await Menu.findById(id);
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    if (error instanceof Error && error.message === 'Menu not found') {
      res.status(404).json({ error: 'Menu not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  }
});

// Create new menu
router.post('/', async (req, res) => {
  try {
    const { category_id, store_id, name, price, description } = req.body;
    
    // Validation
    if (!category_id || !store_id || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: category_id, store_id, name' 
      });
    }
    
    const newMenu = await Menu.create({
      store_id: parseInt(store_id),
      category_id: parseInt(category_id),
      name,
      price: parseFloat(price) || 0.00,
      description
    });
    
    res.status(201).json(newMenu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

// Update menu
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu ID' });
    }
    
    const updates = req.body;
    
    // Convert numeric fields if they exist
    if (updates.category_id) {
      updates.category_id = parseInt(updates.category_id);
    }
    if (updates.price !== undefined) {
      updates.price = parseFloat(updates.price);
    }
    
    const updatedMenu = await Menu.update(id, updates);
    
    res.json(updatedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    if (error instanceof Error && error.message === 'Menu not found') {
      res.status(404).json({ error: 'Menu not found' });
    } else {
      res.status(500).json({ error: 'Failed to update menu' });
    }
  }
});

// Update order of menus
router.put('/order', async (req, res) => {
  try {
    const { menuOrders } = req.body;
    
    if (!Array.isArray(menuOrders)) {
      return res.status(400).json({ error: 'menuOrders must be an array' });
    }
    
    // Validate that each item has id and sort_order
    for (const item of menuOrders) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and sort_order' });
      }
    }
    
    await Menu.updateOrder(menuOrders);
    res.json({ message: 'Menu order updated successfully' });
  } catch (error) {
    console.error('Error updating menu order:', error);
    res.status(500).json({ error: 'Failed to update menu order' });
  }
});

// Delete menu
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu ID' });
    }
    
    const deleted = await Menu.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    if (error instanceof Error && error.message === 'Menu not found') {
      res.status(404).json({ error: 'Menu not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete menu' });
    }
  }
});

export default router;