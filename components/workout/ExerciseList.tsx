/**
 * ExerciseList Component
 * Renders list of exercises for the active workout
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { TrainingDay } from '@/types/training';
import type { WorkoutSession, SessionSet } from '@/services/storage/session-storage';
import { getPreviousPerformance } from '@/utils/workout-helpers';
import ExerciseCard from './ExerciseCard';

interface ExerciseListProps {
  trainingDay: TrainingDay;
  session: WorkoutSession;
  sessionHistory: WorkoutSession[];
  onAddSet: (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>) => void;
  onUpdateSet?: (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
}

export default function ExerciseList({
  trainingDay,
  session,
  sessionHistory,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}: ExerciseListProps) {
  if (!trainingDay.exercises || trainingDay.exercises.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {trainingDay.exercises.map((exercise) => {
        // Find session exercise (if any sets logged)
        const sessionExercise = session.exercises.find(
          (ex) => ex.exerciseId === exercise.id
        );

        // Get previous performance for this exercise
        const previousPerformance = getPreviousPerformance(
          exercise.id!,
          sessionHistory
        );

        return (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            sessionExercise={sessionExercise}
            previousPerformance={previousPerformance}
            onAddSet={onAddSet}
            onUpdateSet={onUpdateSet}
            onDeleteSet={onDeleteSet}
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
