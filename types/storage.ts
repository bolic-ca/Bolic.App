/**
 * Storage Types
 * Core interfaces for local storage implementation
 */

/**
 * Wrapper for all stored items with metadata
 */
export interface StorageItem<T> {
  id: string;
  userId: string;
  data: T;
  createdAt: string;
  updatedAt: string;
}

/**
 * App-level storage configuration
 */
export interface StorageConfig {
  version: number;
  userId: string;
  onboardingCompleted: boolean;
}
