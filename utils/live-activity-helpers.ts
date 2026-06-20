/**
 * Live Activity Helpers
 * Pure functions that turn an active workout session into the text/progress
 * shown in the iOS Live Activity. No native imports so it stays testable.
 */

import type { WorkoutSession, SessionSet } from '@/services/storage/session-storage';
import { formatRirShort } from '@/services/storage/session-storage';
import type { TrainingDay } from '@/types/training';
import type { WeightUnit } from '@/utils/weight';
import { displayWeight } from '@/utils/weight';
import {
  getAllPreviousPerformances,
  calculateWorkoutDuration,
  formatDuration,
} from '@/utils/workout-helpers';
import type { WorkoutActivityState } from '@/services/live-activity/workout-live-activity';

export interface LiveActivityPreferences {
  weightUnit: WeightUnit;
  showRir: boolean;
  showRpe: boolean;
}

interface CurrentExercise {
  exerciseId: string;
  exerciseName: string;
  setsLogged: number;
  targetSets?: number;
}

/**
 * Pick the exercise the user is currently on: the first one in the training-day
 * order that has not yet reached its target number of sets. Honors mid-workout
 * swaps via session.exerciseOverrides. Falls back to the last exercise when all
 * are complete.
 */
function resolveCurrentExercise(
  session: WorkoutSession,
  trainingDay: TrainingDay,
): CurrentExercise | null {
  const exercises = trainingDay.exercises ?? [];
  if (exercises.length === 0) return null;

  let fallback: CurrentExercise | null = null;

  for (const template of exercises) {
    const templateId = template.id;
    if (!templateId) continue;

    const override = session.exerciseOverrides?.[templateId];
    const exerciseId = override ? override.exerciseId : templateId;
    const exerciseName = override ? override.exerciseName : template.name ?? 'Exercise';

    const sessionExercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    const setsLogged = sessionExercise?.sets.length ?? 0;
    const targetSets = template.targetNumberOfSets ?? undefined;

    const current: CurrentExercise = { exerciseId, exerciseName, setsLogged, targetSets };
    fallback = current;

    const incomplete = !targetSets || setsLogged < targetSets;
    if (incomplete) return current;
  }

  // All exercises complete — show the last one.
  return fallback;
}

/**
 * Format a previous set respecting the user's RIR/RPE preferences.
 * e.g. "50lbs × 8 · 6 RIR"
 */
function formatPreviousSet(set: SessionSet, prefs: LiveActivityPreferences): string {
  const parts: string[] = [
    `${displayWeight(set.weight, prefs.weightUnit)}${prefs.weightUnit} × ${set.reps}`,
  ];

  if (prefs.showRir) {
    if (set.numberOfPartials !== undefined) {
      parts.push(`+${set.numberOfPartials}P`);
    } else if (set.rir !== undefined) {
      if (set.rir === 'F') parts.push('F');
      else if (set.rir === 'P') parts.push('P');
      else parts.push(`${formatRirShort(set.rir)} RIR`);
    }
  }

  if (prefs.showRpe && set.rpe !== undefined) {
    parts.push(`RPE ${set.rpe}`);
  }

  return parts.join(' · ');
}

/**
 * Build the previous-set line for the current set index.
 * Pulls from the most recent completed session that contains this exercise and
 * matches the set by index (set 1 vs set 1, set 2 vs set 2, ...).
 */
function buildPreviousLine(
  exerciseId: string,
  setIndex: number,
  sessionHistory: WorkoutSession[],
  prefs: LiveActivityPreferences,
): string {
  const history = getAllPreviousPerformances(exerciseId, sessionHistory);
  if (history.length === 0) return 'First time';

  const previousSets = history[0].performance.sets;
  if (setIndex >= previousSets.length) {
    return `No set ${setIndex + 1} last time`;
  }

  return `Prev: ${formatPreviousSet(previousSets[setIndex], prefs)}`;
}

/**
 * Build the full Live Activity state from the active session.
 * Returns null when there is nothing meaningful to show.
 */
export function buildWorkoutActivityState(
  session: WorkoutSession,
  trainingDay: TrainingDay | null,
  sessionHistory: WorkoutSession[],
  prefs: LiveActivityPreferences,
): WorkoutActivityState | null {
  if (!trainingDay) return null;

  const current = resolveCurrentExercise(session, trainingDay);
  if (!current) return null;

  const setNumber = current.setsLogged + 1;
  const targetSuffix = current.targetSets ? `/${current.targetSets}` : '';

  const title = `${current.exerciseName} · Set ${setNumber}${targetSuffix}`;

  const elapsed = formatDuration(calculateWorkoutDuration(session.startedAt));
  const previousLine = buildPreviousLine(
    current.exerciseId,
    current.setsLogged,
    sessionHistory,
    prefs,
  );
  const subtitle = `${previousLine} · ${elapsed}`;

  const progress =
    current.targetSets && current.targetSets > 0
      ? current.setsLogged / current.targetSets
      : undefined;

  return { title, subtitle, progress };
}
