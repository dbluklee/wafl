// import { loggingService, EventType } from '@wafl/logging-service';

// Mock logging service for now
const mockLoggingService = {
  logPlaceCreated: async (name: string, color: string, data?: any) => console.log('Place created:', name, color, data),
  logPlaceUpdated: async (oldName: string, oldColor: string, newName: string, newColor: string, data?: any) => console.log('Place updated:', { oldName, oldColor, newName, newColor, data }),
  logPlaceDeleted: async (name: string, color: string, data?: any) => console.log('Place deleted:', name, color, data),
  logTableCreated: async (name: string, placeName: string, data?: any) => console.log('Table created:', name, placeName, data),
  logTableUpdated: async (oldName: string, oldPlaceName: string, newName: string, newPlaceName: string, data?: any) => console.log('Table updated:', { oldName, oldPlaceName, newName, newPlaceName, data }),
  logTableDeleted: async (name: string, placeName: string, data?: any) => console.log('Table deleted:', name, placeName, data),
  logCategoryCreated: async (name: string, color: string, data?: any) => console.log('Category created:', name, color, data),
  logCategoryUpdated: async (oldName: string, oldColor: string, newName: string, newColor: string, oldData?: any, newData?: any) => console.log('Category updated:', { oldName, oldColor, newName, newColor, oldData, newData }),
  logCategoryDeleted: async (name: string, color: string, data?: any) => console.log('Category deleted:', name, color, data),
  logMenuCreated: async (name: string, categoryName: string, data?: any) => console.log('Menu created:', name, categoryName, data),
  logMenuUpdated: async (oldName: string, oldCategoryName: string, newName: string, newCategoryName: string, oldData?: any, newData?: any) => console.log('Menu updated:', { oldName, oldCategoryName, newName, newCategoryName, oldData, newData }),
  logMenuDeleted: async (name: string, categoryName: string, data?: any) => console.log('Menu deleted:', name, categoryName, data),
};

const loggingService = mockLoggingService;

// Mock EventType enum
enum EventType {
  PLACE_CREATED = 'PLACE_CREATED',
  PLACE_UPDATED = 'PLACE_UPDATED',
  PLACE_DELETED = 'PLACE_DELETED',
  TABLE_CREATED = 'TABLE_CREATED',
  TABLE_UPDATED = 'TABLE_UPDATED',
  TABLE_DELETED = 'TABLE_DELETED',
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
  MENU_CREATED = 'MENU_CREATED',
  MENU_UPDATED = 'MENU_UPDATED',
  MENU_DELETED = 'MENU_DELETED',
}
import { CategoryService, MenuService, PlaceService, TableService } from '@wafl/api-client';
import type {
  Category, Menu, Place, Table,
  CategoryCreateRequest, MenuCreateRequest, PlaceCreateRequest, TableCreateRequest
} from '@wafl/api-client';
import { StoreContextService } from '@wafl/store-context';

// Service 인스턴스 생성
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://112.148.37.41:4000';
const storeContextService = new StoreContextService(API_BASE_URL);
const categoryService = new CategoryService(storeContextService, API_BASE_URL);
const menuService = new MenuService(storeContextService, API_BASE_URL);
const placeService = new PlaceService(storeContextService, API_BASE_URL);
const tableService = new TableService(storeContextService, API_BASE_URL);

// Base interface for entities
interface BaseEntity {
  id?: string;
  name: string;
  [key: string]: any;
}

// Generic CRUD wrapper that handles logging automatically
export class CrudServiceWrapper<T extends BaseEntity, CreateT = Omit<T, 'id'>> {
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
        const place = entity as unknown as Place;
        await loggingService.logPlaceCreated(place.name, place.color, {
          placeId: place.id,
          ...extraData
        });
        break;
      case 'table':
        const table = entity as unknown as Table;
        const placeName = extraData?.placeName || 'Unknown Place';
        await loggingService.logTableCreated(table.name, placeName, {
          tableId: table.id,
          placeId: table.placeId,
          storeId: table.storeId,
          color: table.color,
          diningCapacity: table.diningCapacity,
          ...extraData
        });
        break;
      case 'category':
        const category = entity as unknown as Category;
        await loggingService.logCategoryCreated(category.name, category.color, {
          categoryId: category.id,
          menuCount: 0, // Will be calculated separately
          ...extraData
        });
        break;
      case 'menu':
        const menu = entity as unknown as Menu;
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
        const oldPlace = oldEntity as unknown as Place;
        const newPlace = newEntity as unknown as Place;
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
        const oldTable = oldEntity as unknown as Table;
        const newTable = newEntity as unknown as Table;
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
              placeId: oldTable.placeId,
              storeId: oldTable.storeId,
              diningCapacity: oldTable.diningCapacity
            },
            postData: {
              tableName: newTable.name,
              placeName: newPlaceName,
              color: newTable.color,
              placeId: newTable.placeId,
              storeId: newTable.storeId,
              diningCapacity: newTable.diningCapacity
            },
            ...extraData
          }
        );
        break;
      case 'category':
        const oldCategory = oldEntity as unknown as Category;
        const newCategory = newEntity as unknown as Category;
        await loggingService.logCategoryUpdated(
          oldCategory.name, oldCategory.color,
          newCategory.name, newCategory.color,
          { categoryName: oldCategory.name, color: oldCategory.color, menuCount: 0 },
          { categoryName: newCategory.name, color: newCategory.color, menuCount: 0 }
        );
        break;
      case 'menu':
        const oldMenu = oldEntity as unknown as Menu;
        const newMenu = newEntity as unknown as Menu;
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
            categoryId: oldMenu.categoryId
          },
          {
            menuName: newMenu.name,
            categoryName: newCategoryName,
            price: newMenu.price,
            description: newMenu.description,
            categoryId: newMenu.categoryId,
            menuId: newMenu.id
          }
        );
        break;
    }
  }

  private async logDelete(entity: T, extraData?: any): Promise<void> {
    switch (this.entityType) {
      case 'place':
        const place = entity as unknown as Place;
        await loggingService.logPlaceDeleted(place.name, place.color, {
          placeId: place.id,
          preData: { placeName: place.name, color: place.color, tableCount: 0 },
          ...extraData
        });
        break;
      case 'table':
        const table = entity as unknown as Table;
        const placeName = extraData?.placeName || 'Unknown Place';
        await loggingService.logTableDeleted(table.name, placeName, {
          tableId: table.id,
          preData: {
            tableName: table.name,
            placeName: placeName,
            color: table.color,
            placeId: table.placeId,
            storeId: table.storeId,
            diningCapacity: table.diningCapacity
          },
          ...extraData
        });
        break;
      case 'category':
        const category = entity as unknown as Category;
        await loggingService.logCategoryDeleted(category.name, category.color, {
          categoryId: category.id,
          menuCount: 0,
          ...extraData
        });
        break;
      case 'menu':
        const menu = entity as unknown as Menu;
        const categoryName = extraData?.categoryName || 'Unknown Category';
        await loggingService.logMenuDeleted(menu.name, categoryName, {
          menuId: menu.id,
          price: menu.price,
          description: menu.description,
          categoryId: menu.categoryId,
          ...extraData
        });
        break;
    }
  }

  async create(data: CreateT, logData?: any): Promise<T> {
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

  async update(id: string, updates: Partial<T>, oldEntity: T, logData?: any): Promise<T> {
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

  async delete(id: string, entity: T, logData?: any): Promise<void> {
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
export const placeServiceWithLogging = new CrudServiceWrapper<Place, PlaceCreateRequest>(
  placeService,
  'place',
  {
    created: EventType.PLACE_CREATED,
    updated: EventType.PLACE_UPDATED,
    deleted: EventType.PLACE_DELETED
  }
);

export const tableServiceWithLogging = new CrudServiceWrapper<Table, TableCreateRequest>(
  tableService,
  'table',
  {
    created: EventType.TABLE_CREATED,
    updated: EventType.TABLE_UPDATED,
    deleted: EventType.TABLE_DELETED
  }
);

export const categoryServiceWithLogging = new CrudServiceWrapper<Category, CategoryCreateRequest>(
  categoryService,
  'category',
  {
    created: EventType.CATEGORY_CREATED,
    updated: EventType.CATEGORY_UPDATED,
    deleted: EventType.CATEGORY_DELETED
  }
);

export const menuServiceWithLogging = new CrudServiceWrapper<Menu, MenuCreateRequest>(
  menuService,
  'menu',
  {
    created: EventType.MENU_CREATED,
    updated: EventType.MENU_UPDATED,
    deleted: EventType.MENU_DELETED
  }
);

// Re-export the raw services for non-CRUD operations
export { placeService, categoryService, menuService, tableService };