/**
 * useExercises Hook
 * React hook for managing training exercises
 */

import { useState, useEffect, useMemo } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { exerciseStorage } from '@/services/storage/exercise-storage';
import type { TrainingExercise } from '@/types/training';

export interface UseExercisesOptions {
  trainingDayId?: string; // Optional filter by training day
  enabled?: boolean; // Control when fetching occurs (default: true)
}

export interface UseExercisesResult {
  exercises: TrainingExercise[]; // Filtered if trainingDayId provided
  allExercises: TrainingExercise[]; // Always all exercises
  loading: boolean;
  error: Error | null;
  createExercise: (exercise: Omit<TrainingExercise, 'id'>) => Promise<TrainingExercise>;
  updateExercise: (exercise: TrainingExercise & { id: string }) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getExerciseById: (id: string) => TrainingExercise | null;
  refetch: () => Promise<void>;
}

export function useExercises(options?: UseExercisesOptions): UseExercisesResult {
  const { trainingDayId, enabled = true } = options || {};
  const { userId, isInitialized } = useStorage();

  const [allExercises, setAllExercises] = useState<TrainingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoized filtered exercises
  const exercises = useMemo(() => {
    if (!trainingDayId) return allExercises;
    return allExercises.filter(ex => ex.trainingDayIds?.includes(trainingDayId));
  }, [allExercises, trainingDayId]);

  async function fetchExercises() {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await exerciseStorage.getAll(userId);
      console.log('Exercises loaded:', items.length);
      const transformedExercises = items.map(item => ({
        ...item.data,
        id: item.id,
      }));
      setAllExercises(transformedExercises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load exercises';
      const error = err instanceof Error ? err : new Error('Failed to load exercises');
      setError(error);
      console.error('Error fetching exercises:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialized && userId && enabled) {
      fetchExercises();
    }
  }, [userId, isInitialized, enabled]);

  async function createExercise(
    exercise: Omit<TrainingExercise, 'id'>
  ): Promise<TrainingExercise> {
    if (!userId) {
      throw new Error('User ID is required to create exercise');
    }

    try {
      const item = await exerciseStorage.save(userId, exercise as TrainingExercise);
      await fetchExercises();
      return { ...item.data, id: item.id };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create exercise');
      setError(error);
      throw error;
    }
  }

  async function updateExercise(
    exercise: TrainingExercise & { id: string }
  ): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to update exercise');
    }

    try {
      await exerciseStorage.save(userId, exercise, exercise.id);
      await fetchExercises();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update exercise');
      setError(error);
      throw error;
    }
  }

  async function deleteExercise(id: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required to delete exercise');
    }

    try {
      await exerciseStorage.delete(userId, id);
      await fetchExercises();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete exercise');
      setError(error);
      throw error;
    }
  }

  function getExerciseById(id: string): TrainingExercise | null {
    return allExercises.find(ex => ex.id === id) || null;
  }

  return {
    exercises,
    allExercises,
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    refetch: fetchExercises,
  };
}
