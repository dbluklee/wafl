import { loggingService, EventType } from './loggingService';
import { placeService, type PlaceData } from './placeService';
import { tableService, type TableData } from './tableService';
import { categoryService, type CategoryData } from './categoryService';
import { menuService, type MenuData } from './menuService';

// Base interface for entities
interface BaseEntity {
  id?: number;
  name: string;
  [key: string]: any;
}

// Generic CRUD wrapper that handles logging automatically
export class CrudServiceWrapper<T extends BaseEntity> {
  constructor(
    private service: any,
    private entityType: 'place' | 'table' | 'category' | 'menu',
    private logEvents: {
      created: EventType;
      updated: EventType;
      deleted: EventType;
    }
  ) {}

  private async logCreate(entity: T, extraData?: any): Promise<void> {
    switch (this.entityType) {
      case 'place':
        const place = entity as unknown as PlaceData;
        await loggingService.logPlaceCreated(place.name, place.color, { 
          placeId: place.id, 
          ...extraData 
        });
        break;
      case 'table':
        const table = entity as unknown as TableData;
        const placeName = extraData?.placeName || 'Unknown Place';
        await loggingService.logTableCreated(table.name, placeName, { 
          tableId: table.id,
          place_id: table.place_id,
          store_id: table.store_id,
          color: table.color,
          dining_capacity: table.dining_capacity,
          ...extraData 
        });
        break;
      case 'category':
        const category = entity as unknown as CategoryData;
        await loggingService.logCategoryCreated(category.name, category.color, { 
          categoryId: category.id,
          menu_count: category.menu_count,
          ...extraData 
        });
        break;
      case 'menu':
        const menu = entity as unknown as MenuData;
        const categoryName = extraData?.categoryName || 'Unknown Category';
        await loggingService.logMenuCreated(menu.name, categoryName, { 
          menuId: menu.id,
          price: menu.price,
          description: menu.description,
          ...extraData 
        });
        break;
    }
  }

  private async logUpdate(oldEntity: T, newEntity: T, extraData?: any): Promise<void> {
    switch (this.entityType) {
      case 'place':
        const oldPlace = oldEntity as unknown as PlaceData;
        const newPlace = newEntity as unknown as PlaceData;
        await loggingService.logPlaceUpdated(
          oldPlace.name, oldPlace.color,
          newPlace.name, newPlace.color,
          {
            placeId: newPlace.id,
            preData: { placeName: oldPlace.name, color: oldPlace.color },
            postData: { placeName: newPlace.name, color: newPlace.color },
            ...extraData
          }
        );
        break;
      case 'table':
        const oldTable = oldEntity as unknown as TableData;
        const newTable = newEntity as unknown as TableData;
        const oldPlaceName = extraData?.oldPlaceName || 'Unknown Place';
        const newPlaceName = extraData?.newPlaceName || 'Unknown Place';
        await loggingService.logTableUpdated(
          oldTable.name, oldPlaceName,
          newTable.name, newPlaceName,
          {
            tableId: newTable.id,
            preData: { 
              tableName: oldTable.name, 
              placeName: oldPlaceName,
              color: oldTable.color,
              place_id: oldTable.place_id,
              store_id: oldTable.store_id,
              dining_capacity: oldTable.dining_capacity
            },
            postData: { 
              tableName: newTable.name, 
              placeName: newPlaceName,
              color: newTable.color,
              place_id: newTable.place_id,
              store_id: newTable.store_id,
              dining_capacity: newTable.dining_capacity
            },
            ...extraData
          }
        );
        break;
      case 'category':
        const oldCategory = oldEntity as unknown as CategoryData;
        const newCategory = newEntity as unknown as CategoryData;
        await loggingService.logCategoryUpdated(
          oldCategory.name, oldCategory.color,
          newCategory.name, newCategory.color,
          { categoryName: oldCategory.name, color: oldCategory.color, menu_count: oldCategory.menu_count },
          { categoryName: newCategory.name, color: newCategory.color, menu_count: newCategory.menu_count }
        );
        break;
      case 'menu':
        const oldMenu = oldEntity as unknown as MenuData;
        const newMenu = newEntity as unknown as MenuData;
        const oldCategoryName = extraData?.oldCategoryName || 'Unknown Category';
        const newCategoryName = extraData?.newCategoryName || 'Unknown Category';
        await loggingService.logMenuUpdated(
          oldMenu.name, oldCategoryName,
          newMenu.name, newCategoryName,
          { 
            menuName: oldMenu.name, 
            categoryName: oldCategoryName, 
            price: oldMenu.price,
            description: oldMenu.description,
            category_id: oldMenu.category_id
          },
          { 
            menuName: newMenu.name, 
            categoryName: newCategoryName, 
            price: newMenu.price,
            description: newMenu.description,
            category_id: newMenu.category_id,
            menuId: newMenu.id
          }
        );
        break;
    }
  }

  private async logDelete(entity: T, extraData?: any): Promise<void> {
    switch (this.entityType) {
      case 'place':
        const place = entity as unknown as PlaceData;
        await loggingService.logPlaceDeleted(place.name, place.color, { 
          placeId: place.id,
          preData: { placeName: place.name, color: place.color, table_count: place.table_count },
          ...extraData 
        });
        break;
      case 'table':
        const table = entity as unknown as TableData;
        const placeName = extraData?.placeName || 'Unknown Place';
        await loggingService.logTableDeleted(table.name, placeName, { 
          tableId: table.id,
          preData: { 
            tableName: table.name, 
            placeName: placeName,
            color: table.color,
            place_id: table.place_id,
            store_id: table.store_id,
            dining_capacity: table.dining_capacity
          },
          ...extraData 
        });
        break;
      case 'category':
        const category = entity as unknown as CategoryData;
        await loggingService.logCategoryDeleted(category.name, category.color, { 
          categoryId: category.id,
          menu_count: category.menu_count,
          ...extraData 
        });
        break;
      case 'menu':
        const menu = entity as unknown as MenuData;
        const categoryName = extraData?.categoryName || 'Unknown Category';
        await loggingService.logMenuDeleted(menu.name, categoryName, { 
          menuId: menu.id,
          price: menu.price,
          description: menu.description,
          category_id: menu.category_id,
          ...extraData 
        });
        break;
    }
  }

  async create(data: Omit<T, 'id'>, logData?: any): Promise<T> {
    try {
      // First create the entity
      const created = await this.service[`create${this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1)}`](data);
      
      // Then log the creation (with the new ID)
      try {
        await this.logCreate(created, logData);
      } catch (logError) {
        console.error(`Failed to log ${this.entityType} creation:`, logError);
        // Don't fail the operation if logging fails
      }
      
      return created;
    } catch (error) {
      console.error(`Failed to create ${this.entityType}:`, error);
      throw error;
    }
  }

  async update(id: number, updates: Partial<T>, oldEntity: T, logData?: any): Promise<T> {
    try {
      // First update the entity
      const updated = await this.service[`update${this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1)}`](id, updates);
      
      // Then log the update
      try {
        await this.logUpdate(oldEntity, updated, logData);
      } catch (logError) {
        console.error(`Failed to log ${this.entityType} update:`, logError);
        // Don't fail the operation if logging fails
      }
      
      return updated;
    } catch (error) {
      console.error(`Failed to update ${this.entityType}:`, error);
      throw error;
    }
  }

  async delete(id: number, entity: T, logData?: any): Promise<void> {
    try {
      // First delete the entity
      await this.service[`delete${this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1)}`](id);
      
      // Then log the deletion
      try {
        await this.logDelete(entity, logData);
      } catch (logError) {
        console.error(`Failed to log ${this.entityType} deletion:`, logError);
        // Don't fail the operation if logging fails
      }
    } catch (error) {
      console.error(`Failed to delete ${this.entityType}:`, error);
      throw error;
    }
  }

  // Direct service access for non-CRUD operations
  get rawService() {
    return this.service;
  }
}

// Export wrapped services with integrated logging
export const placeServiceWithLogging = new CrudServiceWrapper<PlaceData>(
  placeService,
  'place',
  {
    created: EventType.PLACE_CREATED,
    updated: EventType.PLACE_UPDATED,
    deleted: EventType.PLACE_DELETED
  }
);

export const tableServiceWithLogging = new CrudServiceWrapper<TableData>(
  tableService,
  'table',
  {
    created: EventType.TABLE_CREATED,
    updated: EventType.TABLE_UPDATED,
    deleted: EventType.TABLE_DELETED
  }
);

export const categoryServiceWithLogging = new CrudServiceWrapper<CategoryData>(
  categoryService,
  'category',
  {
    created: EventType.CATEGORY_CREATED,
    updated: EventType.CATEGORY_UPDATED,
    deleted: EventType.CATEGORY_DELETED
  }
);

export const menuServiceWithLogging = new CrudServiceWrapper<MenuData>(
  menuService,
  'menu',
  {
    created: EventType.MENU_CREATED,
    updated: EventType.MENU_UPDATED,
    deleted: EventType.MENU_DELETED
  }
);

// Re-export the raw services for non-CRUD operations
export { placeService, tableService, categoryService, menuService };