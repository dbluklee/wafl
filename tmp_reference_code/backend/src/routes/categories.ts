import express from 'express';
import { Category } from '../models/Category';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get categories by store ID
router.get('/store/:storeId', async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const categories = await Category.findByStoreId(storeId);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories by store:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const category = await Category.findById(id);
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    if (error instanceof Error && error.message === 'Category not found') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { store_id, name, color, menu_count } = req.body;
    
    // Validation
    if (!store_id || !name || !color) {
      return res.status(400).json({ 
        error: 'Missing required fields: store_id, name, color' 
      });
    }
    
    const newCategory = await Category.create({
      store_id,
      name,
      color,
      menu_count: menu_count || 0
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const updates = req.body;
    const updatedCategory = await Category.update(id, updates);
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error && error.message === 'Category not found') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Update order of categories
router.put('/order', async (req, res) => {
  try {
    const { categoryOrders } = req.body;
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({ error: 'categoryOrders must be an array' });
    }
    
    // Validate that each item has id and sort_order
    for (const item of categoryOrders) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and sort_order' });
      }
    }
    
    await Category.updateOrder(categoryOrders);
    res.json({ message: 'Category order updated successfully' });
  } catch (error) {
    console.error('Error updating category order:', error);
    res.status(500).json({ error: 'Failed to update category order' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error instanceof Error && error.message === 'Category not found') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
});

export default router;