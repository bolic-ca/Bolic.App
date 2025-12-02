/**
 * useActiveProgram Hook
 * React hook for managing the active training program
 */

import { useState, useEffect } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import {
  programStorage,
  getActiveProgramId,
  setActiveProgramId,
  clearActiveProgramId
} from '@/services/storage/program-storage';

export function useActiveProgram() {
  const { userId, isInitialized } = useStorage();
  const [program, setProgram] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchActiveProgram() {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const activeProgramId = await getActiveProgramId(userId);

      if (activeProgramId) {
        const item = await programStorage.getById(userId, activeProgramId);
        if (item) {
          setProgram({ ...item.data, id: item.id });
        } else {
          // Active program ID exists but program not found - clear it
          await clearActiveProgramId(userId);
          setProgram(null);
        }
      } else {
        setProgram(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load active program'));
      console.error('Error fetching active program:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialized && userId) {
      fetchActiveProgram();
    }
  }, [userId, isInitialized]);

  async function setActive(programId: string): Promise<void> {
    try {
      // Verify program exists
      const item = await programStorage.getById(userId, programId);
      if (!item) {
        throw new Error('Program not found');
      }

      await setActiveProgramId(userId, programId);
      setProgram({ ...item.data, id: item.id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set active program');
      setError(error);
      throw error;
    }
  }

  async function clearActive(): Promise<void> {
    try {
      await clearActiveProgramId(userId);
      setProgram(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear active program');
      setError(error);
      throw error;
    }
  }

  return {
    program,
    loading,
    error,
    setActive,
    clearActive,
    refetch: fetchActiveProgram,
  };
}
