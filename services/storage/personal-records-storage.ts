/**
 * Personal Records Storage
 * Storage service for tracking personal records (PRs)
 */

import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS } from './config';

/**
 * Personal record entry
 */
export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: 'kg' | 'lbs';
  achievedAt: string;
  sessionId?: string;
}

/**
 * Personal records storage instance
 * Handles CRUD operations for PRs
 */
export const personalRecordsStorage = new BaseStorage<PersonalRecord>(USER_DATA_KEYS.PERSONAL_RECORDS);
