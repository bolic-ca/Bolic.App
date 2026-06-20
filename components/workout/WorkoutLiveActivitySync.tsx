/**
 * WorkoutLiveActivitySync
 * Headless component that mirrors the active workout session into an iOS
 * Live Activity (Lock Screen + Dynamic Island). Renders nothing.
 */

import { useEffect, useRef, useState } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import { trainingDayStorage } from '@/services/storage/training-day-storage';
import type { TrainingDay } from '@/types/training';
import { buildWorkoutActivityState } from '@/utils/live-activity-helpers';
import {
  startWorkoutActivity,
  updateWorkoutActivity,
  stopWorkoutActivity,
  hasWorkoutActivity,
} from '@/services/live-activity/workout-live-activity';

// How often to refresh the elapsed-time text while a workout is active.
const TIME_REFRESH_MS = 30_000;

export default function WorkoutLiveActivitySync() {
  const { userId, isInitialized } = useStorage();
  const { session, sessionHistory } = useWorkoutSession();
  const { preferences, customColors } = useThemeCustomization();

  const [trainingDay, setTrainingDay] = useState<TrainingDay | null>(null);

  // Load the training day template for the active session.
  useEffect(() => {
    let cancelled = false;
    const trainingDayId = session?.trainingDayId;

    if (!isInitialized || !userId || !trainingDayId) {
      setTrainingDay(null);
      return;
    }

    trainingDayStorage
      .getById(userId, trainingDayId)
      .then(item => {
        if (!cancelled) setTrainingDay(item?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setTrainingDay(null);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, isInitialized, session?.trainingDayId]);

  // Keep a ref to the latest sync routine so the interval always runs fresh data.
  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    if (!session) return;

    const state = buildWorkoutActivityState(session, trainingDay, sessionHistory, {
      weightUnit: preferences.weightUnit,
      showRir: preferences.showRir,
      showRpe: preferences.showRpe,
    });
    if (!state) return;

    if (hasWorkoutActivity()) {
      updateWorkoutActivity(state);
    } else {
      startWorkoutActivity(state, {
        accentColor: customColors.primaryButton,
        deepLinkUrl: '/',
      });
    }
  };

  // Start / update on any session, history, training day, or preference change.
  useEffect(() => {
    if (!session) {
      stopWorkoutActivity();
      return;
    }
    syncRef.current();
  }, [session, sessionHistory, trainingDay, preferences, customColors.primaryButton]);

  // Periodically refresh so the elapsed-time text stays current.
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => syncRef.current(), TIME_REFRESH_MS);
    return () => clearInterval(interval);
  }, [session]);

  return null;
}
