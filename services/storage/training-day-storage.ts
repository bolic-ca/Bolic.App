/**
 * Training Day Storage
 * Storage service for training day entities
 */

import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS } from './config';
import { TrainingDay } from '@/types/training';

/**
 * Training day storage instance
 * Handles CRUD operations for training days
 */
export const trainingDayStorage = new BaseStorage<TrainingDay>(USER_DATA_KEYS.PROGRAMS_PREFIX);
