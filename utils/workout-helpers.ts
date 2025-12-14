/**
 * Workout Helper Utilities
 * Helper functions for workout session management
 */

import type { WorkoutSession, SessionExercise } from '@/services/storage/session-storage';
import type { TrainingDay } from '@/types/training';

/**
 * Previous performance data for an exercise
 */
export interface PreviousPerformance {
  weight: number;
  reps: number;
  rir?: number;
  rpe?: number;
}

/**
 * Get previous performance for an exercise from session history
 * @param exerciseId - The ID of the exercise
 * @param sessionHistory - Array of past workout sessions
 * @returns Previous performance data or null if not found
 */
export function getPreviousPerformance(
  exerciseId: string,
  sessionHistory: WorkoutSession[]
): PreviousPerformance | null {
  for (const session of sessionHistory) {
    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      return {
        weight: lastSet.weight,
        reps: lastSet.reps,
        rir: lastSet.rir,
        rpe: lastSet.rpe,
      };
    }
  }
  return null;
}

/**
 * Check if an exercise has reached its target number of sets
 * @param sessionExercise - Exercise from the active session
 * @param targetSets - Target number of sets from the training day template
 * @returns True if exercise is complete
 */
export function isExerciseComplete(
  sessionExercise: SessionExercise | undefined,
  targetSets: number | null | undefined
): boolean {
  if (!targetSets || !sessionExercise) return false;
  return sessionExercise.sets.length >= targetSets;
}

/**
 * Calculate workout duration in seconds
 * @param startedAt - ISO timestamp when workout started
 * @returns Duration in seconds
 */
export function calculateWorkoutDuration(startedAt: string): number {
  try {
    const start = new Date(startedAt).getTime();
    if (isNaN(start)) {
      return 0;
    }
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  } catch {
    return 0;
  }
}

/**
 * Format duration as MM:SS or HH:MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Workout progress statistics
 */
export interface WorkoutProgress {
  completedExercises: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
}

/**
 * Get workout progress statistics
 * @param session - Active workout session
 * @param trainingDay - Training day template
 * @returns Progress statistics
 */
export function getWorkoutProgress(
  session: WorkoutSession,
  trainingDay: TrainingDay | null
): WorkoutProgress {
  let totalSets = 0;
  let totalVolume = 0;

  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      totalSets++;
      totalVolume += set.weight * set.reps;
    }
  }

  let completedExercises = 0;
  if (trainingDay?.exercises) {
    for (const templateExercise of trainingDay.exercises) {
      const sessionExercise = session.exercises.find(ex => ex.exerciseId === templateExercise.id);
      if (isExerciseComplete(sessionExercise, templateExercise.targetNumberOfSets)) {
        completedExercises++;
      }
    }
  }

  return {
    completedExercises,
    totalExercises: trainingDay?.exercises?.length || 0,
    totalSets,
    totalVolume,
  };
}
