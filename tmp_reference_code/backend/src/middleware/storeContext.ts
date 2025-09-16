import { Request, Response, NextFunction } from 'express';
import { Store } from '../models/User';

export interface StoreRequest extends Request {
  storeId?: number;
  store?: any;
}

export const storeContextMiddleware = async (req: StoreRequest, res: Response, next: NextFunction) => {
  try {
    let storeId: number | undefined;
    
    // Extract store ID from different sources
    // Priority: 1) Header, 2) Query param, 3) Route param, 4) Body
    const storeIdFromHeader = req.headers['x-store-id'] as string;
    const storeIdFromQuery = req.query.store_id as string;
    const storeIdFromParam = req.params.storeId;
    const storeIdFromBody = req.body.store_id;
    
    if (storeIdFromHeader) {
      storeId = parseInt(storeIdFromHeader);
    } else if (storeIdFromQuery) {
      storeId = parseInt(storeIdFromQuery);
    } else if (storeIdFromParam) {
      storeId = parseInt(storeIdFromParam);
    } else if (storeIdFromBody) {
      storeId = parseInt(storeIdFromBody);
    }
    
    // For some endpoints, store_id might not be required (e.g., user registration, health check, stores)
    const exemptPaths = ['/api/health', '/api/users', '/api/stores'];
    const isExemptPath = exemptPaths.some(path => req.path.startsWith(path));
    
    if (!storeId && !isExemptPath) {
      return res.status(400).json({ 
        error: 'Store ID is required. Provide it via header (x-store-id), query parameter (store_id), or request body.' 
      });
    }
    
    if (storeId) {
      if (isNaN(storeId)) {
        return res.status(400).json({ error: 'Invalid store ID format' });
      }
      
      // Validate that the store exists
      try {
        const store = await Store.findById(storeId);
        req.storeId = storeId;
        req.store = store;
      } catch (error) {
        return res.status(404).json({ error: 'Store not found' });
      }
    }
    
    next();
  } catch (error) {
    console.error('Store context middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireStoreContext = (req: StoreRequest, res: Response, next: NextFunction) => {
  if (!req.storeId) {
    return res.status(400).json({ 
      error: 'Store context is required for this operation' 
    });
  }
  next();
};

export const injectStoreId = (req: StoreRequest, res: Response, next: NextFunction) => {
  if (req.storeId && req.method !== 'GET') {
    // Automatically inject store_id into request body for non-GET requests
    if (!req.body.store_id) {
      req.body.store_id = req.storeId;
    }
  }
  next();
};