/**
 * Program Storage
 * Storage service for program entities with active program management
 */

import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS, getUserKey } from './config';
import * as storageClient from './storage-client';

export interface ExerciseTargetPatch {
  targetRepetitions?: string | null;
  targetRepetitionsInReserve?: string | null;
  notes?: string | null;
}

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

/**
 * Patch target fields on a TrainingExercise within a stored program.
 * Only updates targetRepetitions, targetRepetitionsInReserve, and notes.
 * Does not affect completed session data.
 */
export async function updateExerciseTargets(
  userId: string,
  programId: string,
  trainingDayId: string,
  exerciseId: string,
  patch: ExerciseTargetPatch,
): Promise<void> {
  const item = await programStorage.getById(userId, programId);
  if (!item) throw new Error('Program not found');

  const program = item.data;
  let updated = false;

  const applyPatch = (exercises: any[] | undefined) => {
    if (!exercises) return;
    for (let i = 0; i < exercises.length; i++) {
      if (exercises[i].id === exerciseId) {
        exercises[i] = { ...exercises[i], ...patch };
        updated = true;
        return;
      }
    }
  };

  if (program.type === 'simple' && program.trainingDays) {
    for (const td of program.trainingDays) {
      if (td.id === trainingDayId) { applyPatch(td.exercises); break; }
    }
  } else if (program.type === 'periodized' && program.mesocycles) {
    outer: for (const meso of program.mesocycles) {
      for (const micro of meso.microcycles ?? []) {
        for (const td of micro.trainingDays ?? []) {
          if (td.id === trainingDayId) { applyPatch(td.exercises); break outer; }
        }
      }
    }
  }

  if (!updated) throw new Error('Exercise not found in training day');
  await programStorage.save(userId, program, programId);
}
