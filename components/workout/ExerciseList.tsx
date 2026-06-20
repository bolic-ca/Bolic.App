/**
 * ExerciseList Component
 * Renders list of exercises for the active workout
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { TrainingDay, TrainingExercise } from '@/types/training';
import type { WorkoutSession, SessionSet } from '@/services/storage/session-storage';
import { getPreviousPerformance } from '@/utils/workout-helpers';
import { useExercises } from '@/hooks/useExercises';
import ExerciseCard from './ExerciseCard';

interface ExerciseListProps {
  trainingDay: TrainingDay;
  session: WorkoutSession;
  sessionHistory: WorkoutSession[];
  onAddSet: (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>) => void;
  onUpdateSet?: (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
  onSwapExercise?: (originalExerciseId: string, newExercise: TrainingExercise) => void;
}

export default function ExerciseList({
  trainingDay,
  session,
  sessionHistory,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onSwapExercise,
}: ExerciseListProps) {
  const { allExercises, refetch } = useExercises();

  // Refresh exercise library when the screen regains focus (e.g. after editing
  // an exercise in the exercise-form modal) so edits apply without reopening
  // the session. Ref keeps the focus effect stable to avoid refetch loops.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  useFocusEffect(
    useCallback(() => {
      refetchRef.current();
    }, [])
  );

  if (!trainingDay.exercises || trainingDay.exercises.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {trainingDay.exercises.map((exercise) => {
        const originalExerciseId = exercise.id!;
        const override = session.exerciseOverrides?.[originalExerciseId];

        // Resolve all fields from the library exercise (including targets).
        // Falls back to the embedded data for old programs whose IDs predate
        // the library-reference model (timestamp-based IDs won't match).
        const libraryExercise = allExercises.find(ex => ex.id === exercise.id);
        const resolvedExercise: TrainingExercise = libraryExercise ?? exercise;

        // If the exercise was swapped, resolve the replacement from the library
        let displayExercise = resolvedExercise;
        if (override) {
          const found = allExercises.find(ex => ex.id === override.exerciseId);
          // Fallback: keep template fields but update id/name if not found in library
          displayExercise = found ?? { ...resolvedExercise, id: override.exerciseId, name: override.exerciseName };
        }

        // Find logged sets using the effective exerciseId
        const sessionExercise = session.exercises.find(
          (ex) => ex.exerciseId === displayExercise.id
        );

        // Previous performance for the effective exercise
        const previousPerformance = getPreviousPerformance(
          displayExercise.id!,
          sessionHistory
        );

        return (
          <ExerciseCard
            key={originalExerciseId}
            exercise={displayExercise}
            sessionExercise={sessionExercise}
            previousPerformance={previousPerformance}
            originalExerciseId={originalExerciseId}
            onAddSet={onAddSet}
            onUpdateSet={onUpdateSet}
            onDeleteSet={onDeleteSet}
            onSwapExercise={onSwapExercise}
            canEditExercise={!!libraryExercise}
            sessionHistory={sessionHistory}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
});
