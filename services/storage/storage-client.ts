/**
 * Storage Client
 * Wrapper around AsyncStorage with error handling and utility methods
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get a value from storage
 * @param key - Storage key
 * @returns Parsed value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Storage error getting key "${key}":`, error);
    return null;
  }
}

/**
 * Set a value in storage
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 */
export async function set<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Storage error setting key "${key}":`, error);

    // Check if quota exceeded
    if (error instanceof Error && error.message.includes('QuotaExceededError')) {
      throw new Error('Storage quota exceeded. Please free up space.');
    }

    throw error;
  }
}

/**
 * Remove a value from storage
 * @param key - Storage key
 */
export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage error removing key "${key}":`, error);
    throw error;
  }
}

/**
 * Clear all storage (use with caution!)
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Storage error clearing all data:', error);
    throw error;
  }
}

/**
 * Get multiple values at once (more efficient than multiple gets)
 * @param keys - Array of storage keys
 * @returns Record of key-value pairs
 */
export async function multiGet(keys: readonly string[]): Promise<Record<string, any>> {
  try {
    const results = await AsyncStorage.multiGet(keys);
    const parsed: Record<string, any> = {};

    for (const [key, value] of results) {
      if (value !== null) {
        try {
          parsed[key] = JSON.parse(value);
        } catch (parseError) {
          console.error(`Storage error parsing key "${key}":`, parseError);
          parsed[key] = null;
        }
      }
    }

    return parsed;
  } catch (error) {
    console.error('Storage error in multiGet:', error);
    return {};
  }
}

/**
 * Set multiple values at once (more efficient than multiple sets)
 * @param keyValuePairs - Array of [key, value] tuples
 */
export async function multiSet(keyValuePairs: [string, any][]): Promise<void> {
  try {
    const jsonPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(jsonPairs);
  } catch (error) {
    console.error('Storage error in multiSet:', error);
    throw error;
  }
}

/**
 * Get all keys in storage
 * @returns Array of all storage keys
 */
export async function getAllKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Storage error getting all keys:', error);
    return [];
  }
}

/**
 * Get keys matching a prefix (useful for queries)
 * @param prefix - Key prefix to match
 * @returns Array of matching keys
 */
export async function getKeysWithPrefix(prefix: string): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith(prefix));
  } catch (error) {
    console.error(`Storage error getting keys with prefix "${prefix}":`, error);
    return [];
  }
}

/**
 * Remove multiple keys at once
 * @param keys - Array of storage keys to remove
 */
export async function multiRemove(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Storage error in multiRemove:', error);
    throw error;
  }
}
