/**
 * Training Exercises API Service
 * Functions for managing training exercises
 */

import { apiRequest } from './client';
import { MOCK_USER_ID } from './config';
import type { TrainingExercise } from '@/types/training';

export interface GetExerciseRequest {
  id: string;
  userId?: string;
}

export interface CreateExerciseRequest extends Omit<TrainingExercise, 'id'> {
  userId?: string;
}

export interface UpdateExerciseRequest extends TrainingExercise {
  userId?: string;
}

/**
 * Get a training exercise by ID
 */
export async function getExercise(
  request: GetExerciseRequest
): Promise<TrainingExercise> {
  return apiRequest<TrainingExercise>({
    method: 'GET',
    endpoint: '/exercises',
    params: {
      id: request.id,
      userId: request.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Create a new training exercise
 */
export async function createExercise(
  data: CreateExerciseRequest
): Promise<TrainingExercise> {
  return apiRequest<TrainingExercise>({
    method: 'POST',
    endpoint: '/exercises',
    body: {
      ...data,
      userId: data.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Update an existing training exercise
 */
export async function updateExercise(
  data: UpdateExerciseRequest
): Promise<TrainingExercise> {
  return apiRequest<TrainingExercise>({
    method: 'PUT',
    endpoint: '/exercises',
    body: {
      ...data,
      userId: data.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Partially update a training exercise
 */
export async function patchExercise(
  data: Partial<TrainingExercise> & { id: string }
): Promise<TrainingExercise> {
  return apiRequest<TrainingExercise>({
    method: 'PATCH',
    endpoint: '/exercises',
    body: {
      ...data,
      userId: MOCK_USER_ID,
    },
  });
}
