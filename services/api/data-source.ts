/**
 * Data Source Manager
 *
 * ⚠️ DEPRECATED for Phase A - This file is kept for Phase B API integration.
 *
 * Phase A uses local storage system via:
 * - Storage services: services/storage/*
 * - React hooks: hooks/usePrograms.ts, useActiveProgram.ts, useWorkoutSession.ts, useStats.ts, etc.
 * - Storage context: contexts/StorageContext.tsx
 *
 * This file will be integrated in Phase B for cloud sync functionality.
 *
 * @deprecated Use storage hooks instead for Phase A (see hooks/ directory)
 */

import { USE_MOCK_DATA } from './config';
import * as mockData from '@/data/mock-data';
import * as trainingDaysApi from './training-days';
import * as exercisesApi from './exercises';
import * as trainingSessionsApi from './training-sessions';
import type { TrainingDay, TrainingExercise } from '@/types/training';

/**
 * Get training day - uses mock or API based on config
 */
export async function getTrainingDay(id: string): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    // Return mock data
    return mockData.mockTrainingDay;
  }

  try {
    return await trainingDaysApi.getTrainingDay({ id });
  } catch (error) {
    console.error('Failed to fetch training day:', error);
    return null;
  }
}

/**
 * Get next training day - mock implementation
 */
export async function getNextTrainingDay(): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    return mockData.mockTrainingDay;
  }

  // TODO: Implement API endpoint for getting next training day
  console.warn('getNextTrainingDay: API not implemented yet, using mock data');
  return mockData.mockTrainingDay;
}

/**
 * Get last session - mock implementation
 */
export async function getLastSession(): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    return mockData.mockLastSession;
  }

  // TODO: Implement API endpoint for getting last session
  console.warn('getLastSession: API not implemented yet, using mock data');
  return mockData.mockLastSession;
}

/**
 * Get previous instance of current training day - mock implementation
 */
export async function getPreviousInstanceOfToday(): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    return mockData.mockPreviousInstanceOfToday;
  }

  // TODO: Implement API endpoint
  console.warn('getPreviousInstanceOfToday: API not implemented yet, using mock data');
  return mockData.mockPreviousInstanceOfToday;
}

/**
 * Create a new training day
 */
export async function createTrainingDay(
  data: Omit<TrainingDay, 'id'>
): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Creating training day', data);
    return { ...data, id: 'mock-id' } as TrainingDay;
  }

  try {
    return await trainingDaysApi.createTrainingDay(data);
  } catch (error) {
    console.error('Failed to create training day:', error);
    return null;
  }
}

/**
 * Update a training day
 */
export async function updateTrainingDay(
  data: TrainingDay
): Promise<TrainingDay | null> {
  if (USE_MOCK_DATA) {
    console.log('Mock: Updating training day', data);
    return data;
  }

  try {
    return await trainingDaysApi.updateTrainingDay(data);
  } catch (error) {
    console.error('Failed to update training day:', error);
    return null;
  }
}
