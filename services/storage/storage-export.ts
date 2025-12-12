/**
 * Storage Export/Import Utilities
 * Provides functions to export and import all AsyncStorage data
 */

import * as storageClient from './storage-client';
import { STORAGE_KEYS } from './config';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

export interface StorageExport {
  exportDate: string;
  appVersion: string;
  platform: string;
  data: Record<string, any>;
}

/**
 * Export all AsyncStorage data to a JSON object
 * @returns Complete storage export with metadata
 */
export async function exportAllData(): Promise<StorageExport> {
  try {
    // Get all keys from storage
    const allKeys = await storageClient.getAllKeys();

    // Get all data using multiGet for efficiency
    const allData = await storageClient.multiGet(allKeys);

    // Create export object with metadata
    const exportData: StorageExport = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0', // TODO: Get from app.json
      platform: Platform.OS,
      data: allData,
    };

    return exportData;
  } catch (error) {
    console.error('Failed to export storage data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

/**
 * Import storage data from a JSON object
 * @param exportData - Previously exported data
 * @param mergeMode - If true, merge with existing data. If false, clear first.
 */
export async function importAllData(
  exportData: StorageExport,
  mergeMode: boolean = false
): Promise<void> {
  try {
    // Validate export data structure
    if (!exportData.data || typeof exportData.data !== 'object') {
      throw new Error('Invalid export data format');
    }

    // If not merging, clear existing data first
    if (!mergeMode) {
      await storageClient.clear();
    }

    // Convert data object to key-value pairs array
    const keyValuePairs: [string, any][] = Object.entries(exportData.data);

    // Import all data using multiSet for efficiency
    await storageClient.multiSet(keyValuePairs);

    console.log(`Successfully imported ${keyValuePairs.length} items from export dated ${exportData.exportDate}`);
  } catch (error) {
    console.error('Failed to import storage data:', error);
    throw new Error('Failed to import data. Please check the file format.');
  }
}

/**
 * Export data to a downloadable JSON file
 * @returns File path where data was saved (or null if sharing instead)
 */
export async function exportToFile(): Promise<string | null> {
  try {
    const exportData = await exportAllData();
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `bolic-backup-${timestamp}.json`;

    if (Platform.OS === 'web') {
      // Web: Download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return null;
    } else {
      // Mobile: Save to device and share using legacy FileSystem API
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Share the file if sharing is available
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Bolic.App Data',
          UTI: 'public.json',
        });
      }

      return fileUri;
    }
  } catch (error) {
    console.error('Failed to export to file:', error);
    throw new Error('Failed to create export file. Please try again.');
  }
}

/**
 * Import data from a JSON file
 * @param fileUri - URI of the file to import
 * @param mergeMode - If true, merge with existing data. If false, replace all.
 */
export async function importFromFile(
  fileUri: string,
  mergeMode: boolean = false
): Promise<void> {
  try {
    let jsonString: string;

    if (Platform.OS === 'web') {
      // Web: Read from File object
      const response = await fetch(fileUri);
      jsonString = await response.text();
    } else {
      // Mobile: Read from file system using legacy API
      jsonString = await FileSystem.readAsStringAsync(fileUri);
    }

    const exportData = JSON.parse(jsonString) as StorageExport;
    await importAllData(exportData, mergeMode);
  } catch (error) {
    console.error('Failed to import from file:', error);
    throw new Error('Failed to read import file. Please check the file is valid.');
  }
}

/**
 * Get a summary of the current storage usage
 * @returns Storage statistics
 */
export async function getStorageStats(): Promise<{
  totalKeys: number;
  totalSize: number;
  keysByPrefix: Record<string, number>;
}> {
  try {
    const allKeys = await storageClient.getAllKeys();
    const allData = await storageClient.multiGet(allKeys);

    // Calculate total size (approximate)
    const totalSize = JSON.stringify(allData).length;

    // Group keys by prefix
    const keysByPrefix: Record<string, number> = {};
    for (const key of allKeys) {
      const prefix = key.split(':')[0] || 'other';
      keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    }

    return {
      totalKeys: allKeys.length,
      totalSize,
      keysByPrefix,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      totalKeys: 0,
      totalSize: 0,
      keysByPrefix: {},
    };
  }
}
