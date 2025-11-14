/**
 * Training Days API Service
 * Functions for managing training days
 */

import { apiRequest } from './client';
import { MOCK_USER_ID } from './config';
import type { TrainingDay } from '@/types/training';

export interface GetTrainingDayRequest {
  id: string;
  userId?: string;
}

export interface CreateTrainingDayRequest extends Omit<TrainingDay, 'id'> {
  userId?: string;
}

export interface UpdateTrainingDayRequest extends TrainingDay {
  userId?: string;
}

/**
 * Get a training day by ID
 */
export async function getTrainingDay(
  request: GetTrainingDayRequest
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'GET',
    endpoint: '/training-days',
    body: {
      id: request.id,
      userId: request.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Create a new training day
 */
export async function createTrainingDay(
  data: CreateTrainingDayRequest
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'POST',
    endpoint: '/training-days',
    body: {
      ...data,
      userId: data.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Update an existing training day
 */
export async function updateTrainingDay(
  data: UpdateTrainingDayRequest
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'PUT',
    endpoint: '/training-days',
    body: {
      ...data,
      userId: data.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Partially update a training day
 */
export async function patchTrainingDay(
  data: Partial<TrainingDay> & { id: string }
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'PATCH',
    endpoint: '/training-days',
    body: {
      ...data,
      userId: MOCK_USER_ID,
    },
  });
}
