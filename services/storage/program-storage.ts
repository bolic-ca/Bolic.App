/**
 * Program Storage
 * Storage service for program entities with active program management
 */

import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS, getUserKey } from './config';
import * as storageClient from './storage-client';

/**
 * Program storage instance
 * Handles CRUD operations for training programs
 */
export const programStorage = new BaseStorage<any>(USER_DATA_KEYS.PROGRAMS_INDEX);

/**
 * Get the active program ID for a user
 * @param userId - User ID
 * @returns Active program ID or null
 */
export async function getActiveProgramId(userId: string): Promise<string | null> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_PROGRAM_ID);
  return await storageClient.get<string>(key);
}

/**
 * Set the active program for a user
 * @param userId - User ID
 * @param programId - Program ID to set as active
 */
export async function setActiveProgramId(userId: string, programId: string): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_PROGRAM_ID);
  await storageClient.set(key, programId);
}

/**
 * Clear the active program for a user
 * @param userId - User ID
 */
export async function clearActiveProgramId(userId: string): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_PROGRAM_ID);
  await storageClient.remove(key);
}
