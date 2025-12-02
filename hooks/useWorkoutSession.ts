/**
 * useWorkoutSession Hook
 * React hook for managing workout sessions
 */

import { useState, useEffect } from 'react';
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

export function useWorkoutSession() {
  const { userId, isInitialized } = useStorage();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchActiveSession() {
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
  }

  async function fetchSessionHistory() {
    if (!userId) return;

    try {
      const history = await getSessionHistory(userId, 20);
      setSessionHistory(history.map(item => item.data));
    } catch (err) {
      console.error('Error fetching session history:', err);
    }
  }

  useEffect(() => {
    if (isInitialized && userId) {
      fetchActiveSession();
      fetchSessionHistory();
    }
  }, [userId, isInitialized]);

  async function startSession(programId: string, trainingDayId: string): Promise<void> {
    try {
      const newSession: WorkoutSession = {
        id: generateId(),
        programId,
        trainingDayId,
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
  }

  async function addSet(exerciseId: string, exerciseName: string, set: SessionSet): Promise<void> {
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const updatedSession = { ...session };

      // Find or create exercise in session
      let exercise = updatedSession.exercises.find(ex => ex.exerciseId === exerciseId);
      if (!exercise) {
        exercise = {
          exerciseId,
          exerciseName,
          sets: [],
        };
        updatedSession.exercises.push(exercise);
      }

      // Add set
      exercise.sets.push({
        ...set,
        completedAt: getCurrentTimestamp(),
      });

      updatedSession.completedAt = null; // Still in progress

      const sessionItem: StorageItem<WorkoutSession> = {
        id: session.id,
        userId,
        data: updatedSession,
        createdAt: getCurrentTimestamp(), // Will be preserved by saveSession
        updatedAt: getCurrentTimestamp(),
      };

      await setActiveSession(userId, sessionItem);
      setSession(updatedSession);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add set');
      setError(error);
      throw error;
    }
  }

  async function completeSession(notes?: string): Promise<void> {
    if (!session) {
      throw new Error('No active session');
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
  }

  async function cancelSession(): Promise<void> {
    try {
      await clearActiveSession(userId);
      setSession(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel session');
      setError(error);
      throw error;
    }
  }

  return {
    session,
    sessionHistory,
    loading,
    error,
    startSession,
    addSet,
    completeSession,
    cancelSession,
    refetch: fetchActiveSession,
  };
}
