/**
 * Base Storage
 * Generic CRUD operations for any entity type
 */

import { StorageItem } from '@/types/storage';
import { getUserKey } from './config';
import { generateId, getCurrentTimestamp } from '@/utils/storage-helpers';
import * as storageClient from './storage-client';

/**
 * Generic storage class for any entity type
 * Provides CRUD operations with automatic metadata management
 */
export class BaseStorage<T> {
  constructor(private readonly storageKey: string) {}

  /**
   * Get all items for a user
   * @param userId - User ID for namespacing
   * @returns Array of storage items
   */
  async getAll(userId: string): Promise<StorageItem<T>[]> {
    const key = getUserKey(userId, this.storageKey);
    return await storageClient.get<StorageItem<T>[]>(key) || [];
  }

  /**
   * Get a single item by ID
   * @param userId - User ID for namespacing
   * @param id - Item ID
   * @returns Storage item or null if not found
   */
  async getById(userId: string, id: string): Promise<StorageItem<T> | null> {
    const items = await this.getAll(userId);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Save an item (create or update)
   * @param userId - User ID for namespacing
   * @param data - Item data to save
   * @param existingId - Optional ID for updates
   * @returns Saved storage item
   */
  async save(userId: string, data: T, existingId?: string): Promise<StorageItem<T>> {
    const items = await this.getAll(userId);
    const timestamp = getCurrentTimestamp();

    const storageItem: StorageItem<T> = {
      id: existingId || generateId(),
      userId,
      data,
      createdAt: existingId ? (items.find(i => i.id === existingId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
    };

    if (existingId) {
      // Update existing item
      const index = items.findIndex(i => i.id === existingId);
      if (index >= 0) {
        items[index] = storageItem;
      } else {
        // ID not found, add as new
        items.push(storageItem);
      }
    } else {
      // Create new item
      items.push(storageItem);
    }

    await this.saveAll(userId, items);
    return storageItem;
  }

  /**
   * Delete an item
   * @param userId - User ID for namespacing
   * @param id - Item ID to delete
   */
  async delete(userId: string, id: string): Promise<void> {
    const items = await this.getAll(userId);
    const filtered = items.filter(item => item.id !== id);
    await this.saveAll(userId, filtered);
  }

  /**
   * Clear all items for a user
   * @param userId - User ID for namespacing
   */
  async clear(userId: string): Promise<void> {
    const key = getUserKey(userId, this.storageKey);
    await storageClient.remove(key);
  }

  /**
   * Save all items at once
   * @param userId - User ID for namespacing
   * @param items - Array of storage items
   */
  private async saveAll(userId: string, items: StorageItem<T>[]): Promise<void> {
    const key = getUserKey(userId, this.storageKey);
    await storageClient.set(key, items);
  }
}
