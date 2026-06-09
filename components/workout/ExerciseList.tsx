/**
 * ExerciseList Component
 * Renders list of exercises for the active workout
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
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
  const { allExercises } = useExercises();

  if (!trainingDay.exercises || trainingDay.exercises.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {trainingDay.exercises.map((exercise) => {
        const originalExerciseId = exercise.id!;
        const override = session.exerciseOverrides?.[originalExerciseId];

        // If the exercise was swapped, resolve the replacement from the library
        let displayExercise = exercise;
        if (override) {
          const found = allExercises.find(ex => ex.id === override.exerciseId);
          // Fallback: keep template fields but update id/name if not found in library
          displayExercise = found ?? { ...exercise, id: override.exerciseId, name: override.exerciseName };
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
