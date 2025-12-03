/**
 * usePrograms Hook
 * React hook for managing training programs
 */

import { useState, useEffect } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { programStorage } from '@/services/storage/program-storage';

export function usePrograms() {
  const { userId, isInitialized } = useStorage();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchPrograms() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await programStorage.getAll(userId);
      console.log('Programs loaded:', items.length);
      setPrograms(items.map(item => ({ ...item.data, id: item.id })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load programs';
      const error = err instanceof Error ? err : new Error('Failed to load programs');
      setError(error);
      console.error('Error fetching programs:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isInitialized && userId) {
      fetchPrograms();
    }
  }, [userId, isInitialized]);

  async function createProgram(program: any): Promise<any> {
    try {
      const item = await programStorage.save(userId, program);
      await fetchPrograms();
      return { ...item.data, id: item.id };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create program');
      setError(error);
      throw error;
    }
  }

  async function updateProgram(program: any): Promise<void> {
    try {
      await programStorage.save(userId, program, program.id);
      await fetchPrograms();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update program');
      setError(error);
      throw error;
    }
  }

  async function deleteProgram(id: string): Promise<void> {
    try {
      await programStorage.delete(userId, id);
      await fetchPrograms();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete program');
      setError(error);
      throw error;
    }
  }

  return {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
    refetch: fetchPrograms,
  };
}
