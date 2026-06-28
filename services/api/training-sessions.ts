/**
 * Training Sessions API Service
 * Functions for managing training sessions
 */

import { apiRequest } from './client';
import { MOCK_USER_ID } from './config';
import type { TrainingDay } from '@/types/training';

export interface GetTrainingSessionRequest {
  id: string;
  userId?: string;
}

export interface CreateTrainingSessionRequest extends Omit<TrainingDay, 'id' | 'userId'> {
  userId?: string;
}

/**
 * Get a training session by ID
 */
export async function getTrainingSession(
  request: GetTrainingSessionRequest
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'GET',
    endpoint: '/training-session',
    body: {
      id: request.id,
      userId: request.userId || MOCK_USER_ID,
    },
  });
}

/**
 * Create a new training session
 */
export async function createTrainingSession(
  data: CreateTrainingSessionRequest
): Promise<TrainingDay> {
  return apiRequest<TrainingDay>({
    method: 'POST',
    endpoint: '/training-session',
    body: {
      ...data,
      userId: data.userId || MOCK_USER_ID,
    },
  });
}
