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

interface ExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  targetNumberOfSets?: number | null;
}

interface NextSet {
  exerciseId: string;
  exerciseName: string;
  setsLogged: number;
  setNumber: number;
  setIndex: number;
  targetSets?: number;
}

/**
 * Ordered exercise list for the session. Uses exercisePlan when present,
 * otherwise falls back to the training-day template + swap overrides.
 */
function getOrderedExerciseEntries(
  session: WorkoutSession,
  trainingDay: TrainingDay,
): ExerciseEntry[] {
  const templateMap = new Map(
    (trainingDay.exercises ?? []).filter(ex => ex.id).map(ex => [ex.id!, ex]),
  );

  if (session.exercisePlan) {
    return session.exercisePlan.map(entry => {
      const template = templateMap.get(entry.exerciseId);
      return {
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        targetNumberOfSets: template?.targetNumberOfSets,
      };
    });
  }

  return (trainingDay.exercises ?? [])
    .filter(template => template.id)
    .map(template => {
      const templateId = template.id!;
      const override = session.exerciseOverrides?.[templateId];
      return {
        exerciseId: override ? override.exerciseId : templateId,
        exerciseName: override ? override.exerciseName : template.name ?? 'Exercise',
        targetNumberOfSets: template.targetNumberOfSets,
      };
    });
}

/**
 * History sets for an exercise, preferring the last completed session on the
 * same training day (e.g. last week's Push day) before any session with it.
 */
function getHistorySetsForExercise(
  exerciseId: string,
  trainingDayId: string,
  sessionHistory: WorkoutSession[],
): SessionSet[] | null {
  for (const past of sessionHistory) {
    if (!past.completedAt || past.trainingDayId !== trainingDayId) continue;
    const exercise = past.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise && exercise.sets.length > 0) return exercise.sets;
  }

  const any = getAllPreviousPerformances(exerciseId, sessionHistory);
  return any.length > 0 ? any[0].performance.sets : null;
}

/** Template target, or history set count when no target is configured. */
function resolveTargetSets(
  templateTarget: number | null | undefined,
  historySets: SessionSet[] | null,
): number | undefined {
  if (templateTarget) return templateTarget;
  if (historySets && historySets.length > 0) return historySets.length;
  return undefined;
}

/** Mirrors workout progress: no target means done after one logged set. */
function isExerciseIncomplete(setsLogged: number, targetSets: number | undefined): boolean {
  if (targetSets) return setsLogged < targetSets;
  return setsLogged === 0;
}

/**
 * First set in workout order that hasn't been logged yet. Uses history set
 * count as the per-exercise target when the template has no targetNumberOfSets.
 */
function resolveNextSet(
  session: WorkoutSession,
  trainingDay: TrainingDay,
  sessionHistory: WorkoutSession[],
): NextSet | null {
  const entries = getOrderedExerciseEntries(session, trainingDay);
  if (entries.length === 0) return null;

  let fallback: NextSet | null = null;

  for (const entry of entries) {
    const sessionExercise = session.exercises.find(ex => ex.exerciseId === entry.exerciseId);
    const setsLogged = sessionExercise?.sets.length ?? 0;
    const historySets = getHistorySetsForExercise(
      entry.exerciseId,
      session.trainingDayId,
      sessionHistory,
    );
    const targetSets = resolveTargetSets(entry.targetNumberOfSets, historySets);

    const next: NextSet = {
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      setsLogged,
      setNumber: setsLogged + 1,
      setIndex: setsLogged,
      targetSets,
    };
    fallback = next;

    if (isExerciseIncomplete(setsLogged, targetSets)) return next;
  }

  // All exercises complete — show the last one.
  return fallback;
}

/**
 * Format a set line respecting the user's RIR/RPE preferences.
 * e.g. "50lbs × 8 · 5 RIR"
 */
function formatSetLine(set: SessionSet, prefs: LiveActivityPreferences): string {
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
 * History filler for the next set to perform — same index as last time
 * (set 1 vs set 1, set 2 vs set 2, …).
 */
function buildHistorySetLine(
  exerciseId: string,
  trainingDayId: string,
  setIndex: number,
  sessionHistory: WorkoutSession[],
  prefs: LiveActivityPreferences,
): string {
  const historySets = getHistorySetsForExercise(exerciseId, trainingDayId, sessionHistory);
  if (!historySets) return 'First time';

  if (setIndex >= historySets.length) {
    return `No set ${setIndex + 1} last time`;
  }

  return formatSetLine(historySets[setIndex], prefs);
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

  const next = resolveNextSet(session, trainingDay, sessionHistory);
  if (!next) return null;

  const targetSuffix = next.targetSets ? `/${next.targetSets}` : '';
  const title = `${next.exerciseName} · Set ${next.setNumber}${targetSuffix}`;

  const elapsed = formatDuration(calculateWorkoutDuration(session.startedAt));
  const historyLine = buildHistorySetLine(
    next.exerciseId,
    session.trainingDayId,
    next.setIndex,
    sessionHistory,
    prefs,
  );
  const subtitle = `${historyLine} · ${elapsed}`;

  const progress =
    next.targetSets && next.targetSets > 0
      ? next.setsLogged / next.targetSets
      : undefined;

  return { title, subtitle, progress };
}
