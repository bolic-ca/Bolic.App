/**
 * Exercise Storage
 * Storage service for exercise entities
 */

import { BaseStorage } from './base-storage';
import { TrainingExercise } from '@/types/training';

/**
 * Exercise storage instance
 * Handles CRUD operations for exercises
 */
export const exerciseStorage = new BaseStorage<TrainingExercise>('exercises');
