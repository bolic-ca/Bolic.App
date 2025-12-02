/**
 * Stats Storage
 * Storage service for user workout statistics
 */

import { USER_DATA_KEYS, getUserKey } from './config';
import * as storageClient from './storage-client';

/**
 * User workout statistics interface
 */
export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number; // Total weight lifted (kg or lbs)
  activeTime: number; // Total active time in hours
  lastWorkoutDate: string | null;
  weeklyWorkouts: number[];
}

/**
 * Get user stats
 * @param userId - User ID
 * @returns User stats or default stats if not found
 */
export async function getStats(userId: string): Promise<UserStats> {
  const key = getUserKey(userId, USER_DATA_KEYS.STATS);
  const stats = await storageClient.get<UserStats>(key);

  if (!stats) {
    // Return default stats
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalVolume: 0,
      activeTime: 0,
      lastWorkoutDate: null,
      weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  return stats;
}

/**
 * Update user stats
 * @param userId - User ID
 * @param stats - Stats to save
 */
export async function updateStats(userId: string, stats: UserStats): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.STATS);
  await storageClient.set(key, stats);
}

/**
 * Clear user stats
 * @param userId - User ID
 */
export async function clearStats(userId: string): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.STATS);
  await storageClient.remove(key);
}
