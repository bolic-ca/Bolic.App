/**
 * WorkoutInterface Component
 * Main container for the active workout session
 */

import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import type { WorkoutSession, SessionSet } from '@/services/storage/session-storage';
import type { TrainingDay, TrainingExercise } from '@/types/training';
import { getWorkoutProgress } from '@/utils/workout-helpers';
import WorkoutHeader from './WorkoutHeader';
import WorkoutProgressBar from './WorkoutProgressBar';
import ExerciseList from './ExerciseList';
import CompletionModal from './CompletionModal';

interface WorkoutInterfaceProps {
  session: WorkoutSession;
  trainingDay: TrainingDay | null;
  programName?: string;
  loading: boolean;
  onComplete: (notes?: string) => void;
  onCancel: () => void;
  onMinimize?: () => void;
  onUpdateExerciseTargets?: (exerciseId: string, patch: { targetRepetitions?: string | null; targetRepetitionsInReserve?: string | null; notes?: string | null }) => Promise<void>;
}

export default function WorkoutInterface({
  session,
  trainingDay,
  programName,
  loading,
  onComplete,
  onCancel,
  onMinimize,
  onUpdateExerciseTargets,
}: WorkoutInterfaceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();
  const { addSet, updateSet, deleteSet, swapExercise, sessionHistory } = useWorkoutSession();
  const [completionModalVisible, setCompletionModalVisible] = useState(false);

  // Calculate workout progress
  const progress = getWorkoutProgress(session, trainingDay);

  // Handle adding a set
  const handleAddSet = async (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>) => {
    try {
      await addSet(exerciseId, exerciseName, set);
    } catch (err) {
      console.error('Error adding set:', err);
    }
  };

  // Handle updating a set
  const handleUpdateSet = async (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>) => {
    try {
      await updateSet(exerciseId, setIndex, set);
    } catch (err) {
      console.error('Error updating set:', err);
    }
  };

  // Handle deleting a set
  const handleDeleteSet = async (exerciseId: string, setIndex: number) => {
    try {
      await deleteSet(exerciseId, setIndex);
    } catch (err) {
      console.error('Error deleting set:', err);
    }
  };

  // Handle swapping an exercise
  const handleSwapExercise = async (originalExerciseId: string, newExercise: TrainingExercise) => {
    try {
      await swapExercise(originalExerciseId, newExercise.id!, newExercise.name!);
    } catch (err) {
      console.error('Error swapping exercise:', err);
    }
  };

  // Handle completion modal
  const handleFinish = () => {
    setCompletionModalVisible(true);
  };

  const handleCompleteWorkout = (notes?: string) => {
    setCompletionModalVisible(false);
    onComplete(notes);
  };

  const handleCancelCompletion = () => {
    setCompletionModalVisible(false);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primaryButton} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading workout...
          </Text>
        </View>
      </View>
    );
  }

  // Error state - Training day not found
  if (!trainingDay) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#ff6b6b" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Training day not found
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            This workout&apos;s training day may have been deleted.
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={onCancel}
          >
            <Text style={[styles.errorButtonText, { color: theme.text }]}>
              Cancel Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Timer and Actions */}
      <WorkoutHeader
        startedAt={session.startedAt}
        trainingDayName={trainingDay.name ?? undefined}
        programName={programName}
        onCancel={onCancel}
        onFinish={handleFinish}
        onMinimize={onMinimize}
      />

      {/* Progress Bar */}
      <WorkoutProgressBar
        completedExercises={progress.completedExercises}
        totalExercises={progress.totalExercises}
        totalSets={progress.totalSets}
        totalVolume={progress.totalVolume}
      />

      {/* Exercise List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        delayContentTouches={false}
        keyboardShouldPersistTaps="handled"
      >
        <ExerciseList
          trainingDay={trainingDay}
          session={session}
          sessionHistory={sessionHistory}
          onAddSet={handleAddSet}
          onUpdateSet={handleUpdateSet}
          onDeleteSet={handleDeleteSet}
          onSwapExercise={handleSwapExercise}
          onUpdateExerciseTargets={onUpdateExerciseTargets}
        />
      </ScrollView>

      {/* Completion Modal */}
      <CompletionModal
        visible={completionModalVisible}
        onComplete={handleCompleteWorkout}
        onCancel={handleCancelCompletion}
        session={session}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
