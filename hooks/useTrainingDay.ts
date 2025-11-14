/**
 * useTrainingDay Hook
 * React hook for fetching and managing training day data
 */

import { useState, useEffect } from 'react';
import { getTrainingDay } from '@/services/api';
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

  const [data, setData] = useState<TrainingDay | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrainingDay = async () => {
    if (!trainingDayId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTrainingDay({ id: trainingDayId });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch training day'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingDay();
  }, [trainingDayId, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchTrainingDay,
  };
}
