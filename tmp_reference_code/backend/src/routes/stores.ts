import { Router, Request, Response } from 'express';
import { pool, StoreRecord } from '../models/database';

const router = Router();

// Get stores for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM stores WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stores' });
  }
});

// Get specific store
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM stores WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch store' });
  }
});

// Create new store
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      business_registration_number,
      store_name,
      owner_name,
      store_address,
      naver_store_link,
      store_number,
      user_pin,
      pre_work = false
    }: StoreRecord = req.body;

    const result = await pool.query(
      `INSERT INTO stores 
       (user_id, business_registration_number, store_name, owner_name, 
        store_address, naver_store_link, store_number, user_pin, pre_work)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, business_registration_number, store_name, owner_name, 
       store_address, naver_store_link, store_number, user_pin, pre_work]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating store:', error);
    if (error instanceof Error && 'constraint' in error) {
      res.status(400).json({ success: false, error: 'Store number already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create store' });
    }
  }
});

// Update store
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE stores SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ success: false, error: 'Failed to update store' });
  }
});

// Delete store
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }

    res.json({ success: true, message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ success: false, error: 'Failed to delete store' });
  }
});

export default router;