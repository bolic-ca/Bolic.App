/**
 * WorkoutSessionContext
 * Provides shared workout session state across all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import {
  WorkoutSession,
  SessionSet,
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  saveSession,
  getSessionHistory,
} from '@/services/storage/session-storage';
import { StorageItem } from '@/types/storage';
import { generateId, getCurrentTimestamp } from '@/utils/storage-helpers';

interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  sessionHistory: WorkoutSession[];
  loading: boolean;
  error: Error | null;
  startSession: (programId: string, trainingDayId: string, name?: string) => Promise<void>;
  addSet: (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>) => Promise<void>;
  updateSet: (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>) => Promise<void>;
  deleteSet: (exerciseId: string, setIndex: number) => Promise<void>;
  swapExercise: (originalExerciseId: string, newExerciseId: string, newExerciseName: string) => Promise<void>;
  completeSession: (notes?: string) => Promise<void>;
  cancelSession: () => Promise<void>;
  refetch: () => Promise<void>;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const { userId, isInitialized } = useStorage();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveSession = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const activeSessionItem = await getActiveSession(userId);
      if (activeSessionItem) {
        setSession(activeSessionItem.data);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load active session'));
      console.error('Error fetching active session:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchSessionHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const history = await getSessionHistory(userId, 20);
      setSessionHistory(history.map(item => item.data));
    } catch (err) {
      console.error('Error fetching session history:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (isInitialized && userId) {
      fetchActiveSession();
      fetchSessionHistory();
    }
  }, [userId, isInitialized, fetchActiveSession, fetchSessionHistory]);

  const startSession = useCallback(async (programId: string, trainingDayId: string, name?: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      const newSession: WorkoutSession = {
        id: generateId(),
        programId,
        trainingDayId,
        name,
        startedAt: getCurrentTimestamp(),
        completedAt: null,
        exercises: [],
      };

      const sessionItem: StorageItem<WorkoutSession> = {
        id: newSession.id,
        userId,
        data: newSession,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(newSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start session');
      setError(error);
      throw error;
    }
  }, [userId]);

  const addSet = useCallback(async (exerciseId: string, exerciseName: string, set: Omit<SessionSet, 'completedAt'>): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }

    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      // Deep copy exercises array to ensure React detects changes
      const updatedExercises = session.exercises.map(ex => ({
        ...ex,
        sets: [...ex.sets],
      }));

      // Find or create exercise in session
      let exerciseIndex = updatedExercises.findIndex(ex => ex.exerciseId === exerciseId);
      if (exerciseIndex === -1) {
        updatedExercises.push({
          exerciseId,
          exerciseName,
          sets: [],
        });
        exerciseIndex = updatedExercises.length - 1;
      }

      // Add set to the exercise
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: [
          ...updatedExercises[exerciseIndex].sets,
          {
            ...set,
            completedAt: getCurrentTimestamp(),
          },
        ],
      };

      const updatedSession: WorkoutSession = {
        ...session,
        exercises: updatedExercises,
        completedAt: null, // Still in progress
      };

      const sessionItem: StorageItem<WorkoutSession> = {
        id: session.id,
        userId,
        data: updatedSession,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(updatedSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add set');
      setError(error);
      throw error;
    }
  }, [session, userId]);

  const updateSet = useCallback(async (exerciseId: string, setIndex: number, set: Omit<SessionSet, 'completedAt'>): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }

    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      const exerciseIndex = session.exercises.findIndex(ex => ex.exerciseId === exerciseId);
      if (exerciseIndex === -1) {
        throw new Error('Exercise not found in session');
      }

      const exercise = session.exercises[exerciseIndex];
      if (setIndex < 0 || setIndex >= exercise.sets.length) {
        throw new Error('Invalid set index');
      }

      // Deep copy exercises array and update the specific set
      const updatedExercises = session.exercises.map((ex, idx) => {
        if (idx !== exerciseIndex) {
          return { ...ex, sets: [...ex.sets] };
        }
        return {
          ...ex,
          sets: ex.sets.map((s, sIdx) =>
            sIdx === setIndex
              ? { ...set, completedAt: s.completedAt }
              : { ...s }
          ),
        };
      });

      const updatedSession: WorkoutSession = {
        ...session,
        exercises: updatedExercises,
      };

      const sessionItem: StorageItem<WorkoutSession> = {
        id: session.id,
        userId,
        data: updatedSession,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(updatedSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update set');
      setError(error);
      throw error;
    }
  }, [session, userId]);

  const deleteSet = useCallback(async (exerciseId: string, setIndex: number): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }

    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      const exerciseIndex = session.exercises.findIndex(ex => ex.exerciseId === exerciseId);
      if (exerciseIndex === -1) {
        throw new Error('Exercise not found in session');
      }

      const exercise = session.exercises[exerciseIndex];
      if (setIndex < 0 || setIndex >= exercise.sets.length) {
        throw new Error('Invalid set index');
      }

      // Deep copy exercises array and remove the specific set
      let updatedExercises = session.exercises.map((ex, idx) => {
        if (idx !== exerciseIndex) {
          return { ...ex, sets: [...ex.sets] };
        }
        return {
          ...ex,
          sets: ex.sets.filter((_, sIdx) => sIdx !== setIndex),
        };
      });

      // If exercise has no more sets, remove it from the session
      if (updatedExercises[exerciseIndex].sets.length === 0) {
        updatedExercises = updatedExercises.filter((_, idx) => idx !== exerciseIndex);
      }

      const updatedSession: WorkoutSession = {
        ...session,
        exercises: updatedExercises,
      };

      const sessionItem: StorageItem<WorkoutSession> = {
        id: session.id,
        userId,
        data: updatedSession,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(updatedSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete set');
      setError(error);
      throw error;
    }
  }, [session, userId]);

  const swapExercise = useCallback(async (
    originalExerciseId: string,
    newExerciseId: string,
    newExerciseName: string,
  ): Promise<void> => {
    if (!session) throw new Error('No active session');
    if (!userId) throw new Error('User not initialized');

    try {
      // Migrate any already-logged sets to the new exercise
      const updatedExercises = session.exercises.map(ex => {
        if (ex.exerciseId === originalExerciseId) {
          return { ...ex, exerciseId: newExerciseId, exerciseName: newExerciseName };
        }
        return { ...ex, sets: [...ex.sets] };
      });

      const updatedOverrides: Record<string, { exerciseId: string; exerciseName: string }> = {
        ...(session.exerciseOverrides || {}),
        [originalExerciseId]: { exerciseId: newExerciseId, exerciseName: newExerciseName },
      };

      const updatedSession: WorkoutSession = {
        ...session,
        exercises: updatedExercises,
        exerciseOverrides: updatedOverrides,
      };

      const sessionItem: StorageItem<WorkoutSession> = {
        id: session.id,
        userId,
        data: updatedSession,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(updatedSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to swap exercise');
      setError(error);
      throw error;
    }
  }, [session, userId]);

  const completeSession = useCallback(async (notes?: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }

    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      const completedSession: WorkoutSession = {
        ...session,
        completedAt: getCurrentTimestamp(),
        notes,
      };

      // Save to month partition
      await saveSession(userId, completedSession, session.id);

      // Clear active session
      await clearActiveSession(userId);

      setSession(null);

      // Refresh history
      await fetchSessionHistory();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to complete session');
      setError(error);
      throw error;
    }
  }, [session, userId, fetchSessionHistory]);

  const cancelSession = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error('User not initialized');
    }

    try {
      await clearActiveSession(userId);
      setSession(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel session');
      setError(error);
      throw error;
    }
  }, [userId]);

  return (
    <WorkoutSessionContext.Provider
      value={{
        session,
        sessionHistory,
        loading,
        error,
        startSession,
        addSet,
        updateSet,
        deleteSet,
        swapExercise,
        completeSession,
        cancelSession,
        refetch: fetchActiveSession,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
}
