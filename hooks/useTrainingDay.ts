/**
 * useTrainingDay Hook
 * React hook for fetching and managing training day data
 */

import { useState, useEffect } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { trainingDayStorage } from '@/services/storage/training-day-storage';
import type { TrainingDay } from '@/types/training';

interface UseTrainingDayOptions {
  trainingDayId?: string;
  enabled?: boolean;
}

interface UseTrainingDayResult {
  data: TrainingDay | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTrainingDay(
  options: UseTrainingDayOptions
): UseTrainingDayResult {
  const { trainingDayId, enabled = true } = options;
  const { userId, isInitialized } = useStorage();

  const [data, setData] = useState<TrainingDay | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrainingDay = async () => {
    if (!trainingDayId || !enabled || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const item = await trainingDayStorage.getById(userId, trainingDayId);
      if (item) {
        setData(item.data);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch training day'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      fetchTrainingDay();
    }
  }, [trainingDayId, enabled, userId, isInitialized]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrainingDay,
  };
}
