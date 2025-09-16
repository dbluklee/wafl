import { Place } from '../models/Place';
import { Table } from '../models/Table';
import { Category } from '../models/Category';
import { Menu } from '../models/Menu';
import { Log } from '../models/Log';

interface UndoResult {
  success: boolean;
  message: string;
  result?: any;
}

interface PreData {
  id?: number;
  store_id?: number;
  place_id?: number;
  category_id?: number;
  name?: string;
  placeName?: string;
  tableName?: string;
  categoryName?: string;
  menuName?: string;
  color?: string;
  table_count?: number;
  menu_count?: number;
  dining_capacity?: number;
  price?: number;
  description?: string;
  sort_order?: number;
}

/**
 * Unified undo service for all entity types
 */
export class UndoService {
  /**
   * Main undo handler that processes any log type
   */
  static async undoLog(logId: number): Promise<UndoResult> {
    // Get the log to undo
    const log = await Log.findById(logId);
    
    // Check if already undone
    const alreadyUndone = await this.isLogAlreadyUndone(logId, log.store_id);
    if (alreadyUndone) {
      return {
        success: false,
        message: 'This action has already been undone'
      };
    }
    
    // Prevent undoing UNDO_PERFORMED logs
    if (log.type === 'UNDO_PERFORMED') {
      return {
        success: false,
        message: 'Undo operations cannot be undone'
      };
    }
    
    // Parse metadata
    const metadata = log.metadata ? JSON.parse(log.metadata) : {};
    
    // Debug logging
    console.log('🔄 Undo operation:', {
      logId,
      type: log.type,
      message: log.message,
      metadata
    });
    
    // Route to appropriate undo handler
    let result: UndoResult;
    
    if (log.type.startsWith('place_')) {
      result = await this.undoPlaceAction(log.type, log.message, metadata);
    } else if (log.type.startsWith('table_')) {
      result = await this.undoTableAction(log.type, log.message, metadata);
    } else if (log.type.startsWith('category_')) {
      result = await this.undoCategoryAction(log.type, log.message, metadata);
    } else if (log.type.startsWith('menu_')) {
      result = await this.undoMenuAction(log.type, log.message, metadata);
    } else {
      result = {
        success: false,
        message: `Undo not supported for log type: ${log.type}`
      };
    }
    
    // Create undo log if successful
    if (result.success) {
      await Log.create({
        store_id: log.store_id,
        type: 'UNDO_PERFORMED',
        message: result.message,
        metadata: JSON.stringify({
          originalLogId: logId,
          originalType: log.type,
          undoResult: result.result
        })
      });
    }
    
    return result;
  }
  
  /**
   * Check if a log has already been undone
   */
  private static async isLogAlreadyUndone(logId: number, storeId: number): Promise<boolean> {
    const undoLogs = await Log.findByStoreId(storeId);
    return undoLogs.some(undoLog => {
      if (undoLog.type !== 'UNDO_PERFORMED') return false;
      try {
        const metadata = undoLog.metadata ? JSON.parse(undoLog.metadata) : {};
        return metadata.originalLogId === logId;
      } catch {
        return false;
      }
    });
  }
  
  /**
   * Undo place-related actions
   */
  private static async undoPlaceAction(type: string, message: string, metadata: any): Promise<UndoResult> {
    switch (type) {
      case 'place_created': {
        // Delete the created place
        if (metadata.placeId) {
          const deleted = await Place.delete(metadata.placeId);
          if (deleted) {
            const placeName = this.extractName(message);
            return {
              success: true,
              message: `Place "${placeName}" has been removed`,
              result: { type: 'place_deleted', placeId: metadata.placeId }
            };
          }
        }
        break;
      }
      
      case 'place_deleted': {
        // Restore the deleted place
        const preData = this.normalizePreData(metadata.preData);
        if (preData.name) {
          const restored = await Place.create({
            store_id: preData.store_id || 1,
            name: preData.name,
            color: preData.color || '#FF6B6B',
            table_count: preData.table_count || 0,
            sort_order: preData.sort_order || 0
          });
          return {
            success: true,
            message: `Place "${preData.name}" has been restored`,
            result: { type: 'place_restored', place: restored }
          };
        }
        break;
      }
      
      case 'place_updated':
      case 'place_modified': {
        // Revert to previous values
        const preData = this.normalizePreData(metadata.preData);
        if (preData.name && metadata.placeId) {
          const updated = await Place.update(metadata.placeId, {
            name: preData.name,
            color: preData.color
          });
          return {
            success: true,
            message: `Place has been reverted to "${preData.name}"`,
            result: { type: 'place_reverted', place: updated }
          };
        }
        break;
      }
    }
    
    return {
      success: false,
      message: `Failed to undo ${type}`
    };
  }
  
  /**
   * Undo table-related actions
   */
  private static async undoTableAction(type: string, message: string, metadata: any): Promise<UndoResult> {
    switch (type) {
      case 'table_created': {
        // Delete the created table
        if (metadata.tableId) {
          const deleted = await Table.delete(metadata.tableId);
          if (deleted) {
            const tableName = this.extractSecondName(message);
            return {
              success: true,
              message: `Table "${tableName}" has been removed`,
              result: { type: 'table_deleted', tableId: metadata.tableId }
            };
          }
        }
        break;
      }
      
      case 'table_deleted': {
        // Restore the deleted table
        const preData = metadata.preData;
        const tableName = preData.tableName || preData.name;
        
        // Get place_id if only placeName is provided
        let place_id = preData.place_id;
        if (!place_id && preData.placeName) {
          const place = await Place.findByName(preData.placeName);
          if (place) {
            place_id = place.id;
          }
        }
        
        if (tableName && place_id) {
          const restored = await Table.create({
            store_id: preData.store_id || 1,
            place_id: place_id,
            name: tableName,
            color: preData.color || '#808080',
            dining_capacity: preData.dining_capacity || 4
          });
          return {
            success: true,
            message: `Table "${tableName}" has been restored`,
            result: { type: 'table_restored', table: restored }
          };
        }
        break;
      }
      
      case 'table_updated':
      case 'table_modified': {
        // Revert to previous values
        const preData = metadata.preData;
        // For tables, explicitly use tableName field
        const tableName = preData.tableName || preData.name;
        
        console.log('🔧 Reverting table update:', {
          tableId: metadata.tableId,
          tableName,
          preData
        });
        
        if (tableName && metadata.tableId) {
          // Get place_id if needed
          let place_id = preData.place_id;
          if (!place_id && preData.placeName) {
            const place = await Place.findByName(preData.placeName);
            if (place) {
              place_id = place.id;
            }
          }
          
          // Build update data including all fields that might have changed
          const updateData: any = {
            name: tableName
          };
          
          // Only include fields that are actually present in preData
          if (preData.color !== undefined) {
            updateData.color = preData.color;
          }
          if (place_id !== undefined) {
            updateData.place_id = place_id;
          }
          if (preData.dining_capacity !== undefined) {
            updateData.dining_capacity = preData.dining_capacity;
          }
          
          console.log('🔧 Calling Table.update with:', updateData);
          
          const updated = await Table.update(metadata.tableId, updateData);
          
          console.log('🔧 Table.update returned:', updated);
          
          return {
            success: true,
            message: `Table "${tableName}" has been reverted to previous values`,
            result: { type: 'table_reverted', table: updated }
          };
        }
        break;
      }
    }
    
    return {
      success: false,
      message: `Failed to undo ${type}`
    };
  }
  
  /**
   * Undo category-related actions
   */
  private static async undoCategoryAction(type: string, message: string, metadata: any): Promise<UndoResult> {
    switch (type) {
      case 'category_created': {
        // Delete the created category
        const categoryId = metadata.categoryId || metadata.postData?.id;
        if (categoryId) {
          const deleted = await Category.delete(categoryId);
          if (deleted) {
            const categoryName = this.extractName(message);
            return {
              success: true,
              message: `Category "${categoryName}" has been removed`,
              result: { type: 'category_deleted', categoryId }
            };
          }
        }
        break;
      }
      
      case 'category_deleted': {
        // Restore the deleted category
        const preData = this.normalizePreData(metadata.preData);
        if (preData.name) {
          const restored = await Category.create({
            store_id: preData.store_id || 1,
            name: preData.name,
            color: preData.color || '#FF6B6B',
            menu_count: preData.menu_count || 0,
            sort_order: preData.sort_order || 0
          });
          return {
            success: true,
            message: `Category "${preData.name}" has been restored`,
            result: { type: 'category_restored', category: restored }
          };
        }
        break;
      }
      
      case 'category_updated':
      case 'category_modified': {
        // Revert to previous values
        const preData = this.normalizePreData(metadata.preData);
        const categoryId = metadata.categoryId || metadata.id;
        if (preData.name && categoryId) {
          const updated = await Category.update(categoryId, {
            name: preData.name,
            color: preData.color
          });
          return {
            success: true,
            message: `Category has been reverted to "${preData.name}"`,
            result: { type: 'category_reverted', category: updated }
          };
        }
        break;
      }
    }
    
    return {
      success: false,
      message: `Failed to undo ${type}`
    };
  }
  
  /**
   * Undo menu-related actions
   */
  private static async undoMenuAction(type: string, message: string, metadata: any): Promise<UndoResult> {
    switch (type) {
      case 'menu_created': {
        // Delete the created menu
        const menuId = metadata.menuId || metadata.postData?.id;
        if (menuId) {
          const deleted = await Menu.delete(menuId);
          if (deleted) {
            const menuName = this.extractSecondName(message);
            return {
              success: true,
              message: `Menu "${menuName}" has been removed`,
              result: { type: 'menu_deleted', menuId }
            };
          }
        }
        break;
      }
      
      case 'menu_deleted': {
        // Restore the deleted menu
        const preData = this.normalizePreData(metadata.preData);
        if (preData.name && preData.category_id) {
          const restored = await Menu.create({
            store_id: preData.store_id || 1,
            category_id: preData.category_id,
            name: preData.name,
            price: preData.price || 0,
            description: preData.description || '',
            sort_order: preData.sort_order || 0
          });
          return {
            success: true,
            message: `Menu "${preData.name}" has been restored`,
            result: { type: 'menu_restored', menu: restored }
          };
        }
        break;
      }
      
      case 'menu_updated':
      case 'menu_modified': {
        // Revert to previous values
        const preData = this.normalizePreData(metadata.preData);
        const menuId = metadata.menuId || metadata.id;
        if (preData.name && menuId) {
          const updated = await Menu.update(menuId, {
            name: preData.name,
            category_id: preData.category_id,
            price: preData.price,
            description: preData.description
          });
          return {
            success: true,
            message: `Menu "${preData.name}" has been reverted to previous values`,
            result: { type: 'menu_reverted', menu: updated }
          };
        }
        break;
      }
    }
    
    return {
      success: false,
      message: `Failed to undo ${type}`
    };
  }
  
  /**
   * Normalize preData to handle different formats
   */
  private static normalizePreData(preData: any): PreData {
    if (!preData) return {};
    
    // Determine the correct name based on which specific name field exists
    let name = preData.name;
    if (!name) {
      if (preData.tableName !== undefined) name = preData.tableName;
      else if (preData.placeName !== undefined) name = preData.placeName;
      else if (preData.categoryName !== undefined) name = preData.categoryName;
      else if (preData.menuName !== undefined) name = preData.menuName;
    }
    
    return {
      id: preData.id,
      store_id: preData.store_id,
      place_id: preData.place_id,
      category_id: preData.category_id,
      name: name,
      placeName: preData.placeName,
      tableName: preData.tableName,
      categoryName: preData.categoryName,
      menuName: preData.menuName,
      color: preData.color,
      table_count: preData.table_count,
      menu_count: preData.menu_count,
      dining_capacity: preData.dining_capacity,
      price: preData.price,
      description: preData.description,
      sort_order: preData.sort_order
    };
  }
  
  /**
   * Extract name from log message (first {{name}})
   */
  private static extractName(message: string): string {
    const match = message.match(/{{([^}]+)}}/);
    return match ? match[1] : 'Unknown';
  }
  
  /**
   * Extract second name from log message (second {{name}})
   */
  private static extractSecondName(message: string): string {
    const matches = message.match(/{{[^}]+}}\s*{{([^}]+)}}/);
    return matches ? matches[1] : this.extractName(message);
  }
}