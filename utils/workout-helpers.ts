/**
 * Workout Helper Utilities
 * Helper functions for workout session management
 */

import type { WorkoutSession, SessionExercise, SessionSet, RirValue } from '@/services/storage/session-storage';
import type { TrainingDay } from '@/types/training';

/**
 * Previous performance data for an exercise — all sets from last session
 */
export interface PreviousPerformance {
  sets: SessionSet[];
  // Convenience: last set values (used in collapsed header hint)
  weight: number;
  reps: number;
  rir?: RirValue;
  rpe?: number;
  quality?: number;
}

/**
 * Get previous performance for an exercise from session history
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
        sets: exercise.sets,
        weight: lastSet.weight,
        reps: lastSet.reps,
        rir: lastSet.rir,
        rpe: lastSet.rpe,
        quality: lastSet.quality,
      };
    }
  }
  return null;
}

export interface HistoricalSession {
  sessionId: string;
  sessionName?: string;
  date: string;
  performance: PreviousPerformance;
}

/**
 * Get all past performances for an exercise across all sessions, newest first
 */
export function getAllPreviousPerformances(
  exerciseId: string,
  sessionHistory: WorkoutSession[]
): HistoricalSession[] {
  const results: HistoricalSession[] = [];

  for (const session of sessionHistory) {
    // Skip active (incomplete) sessions
    if (!session.completedAt) continue;

    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      results.push({
        sessionId: session.id,
        sessionName: session.name,
        date: session.startedAt,
        performance: {
          sets: exercise.sets,
          weight: lastSet.weight,
          reps: lastSet.reps,
          rir: lastSet.rir,
          rpe: lastSet.rpe,
        },
      });
    }
  }

  return results;
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

  // exercisePlan is source of truth for new sessions; legacy sessions fall back to template
  const hasPlan = session.exercisePlan != null;
  const totalExercises = hasPlan
    ? session.exercisePlan!.length
    : (trainingDay?.exercises?.length || 0);

  let completedExercises = 0;

  if (hasPlan) {
    // Build a targetNumberOfSets lookup from the template (keyed by exercise ID)
    const targetMap = new Map<string, number | null | undefined>(
      (trainingDay?.exercises ?? []).map(ex => [ex.id!, ex.targetNumberOfSets])
    );

    for (const planEntry of session.exercisePlan!) {
      const sessionExercise = session.exercises.find(ex => ex.exerciseId === planEntry.exerciseId);
      const targetSets = targetMap.get(planEntry.exerciseId);

      if (targetSets) {
        // Has a target — complete when sets logged >= target
        if (isExerciseComplete(sessionExercise, targetSets)) {
          completedExercises++;
        }
      } else {
        // No target set — count as done once at least one set is logged
        if (sessionExercise && sessionExercise.sets.length > 0) {
          completedExercises++;
        }
      }
    }
  } else {
    // Legacy sessions: iterate template exercises + respect swap overrides
    if (trainingDay?.exercises) {
      for (const templateExercise of trainingDay.exercises) {
        const override = session.exerciseOverrides?.[templateExercise.id!];
        const effectiveId = override ? override.exerciseId : templateExercise.id;
        const sessionExercise = session.exercises.find(ex => ex.exerciseId === effectiveId);
        if (isExerciseComplete(sessionExercise, templateExercise.targetNumberOfSets)) {
          completedExercises++;
        }
      }
    }
  }

  return {
    completedExercises,
    totalExercises,
    totalSets,
    totalVolume,
  };
}
