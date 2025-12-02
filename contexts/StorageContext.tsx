/**
 * Storage Context
 * Manages app-level storage initialization and provides userId to components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/services/storage/config';
import * as storageClient from '@/services/storage/storage-client';
import { StorageConfig } from '@/types/storage';
import { generateId } from '@/utils/storage-helpers';

interface StorageContextType {
  userId: string;
  isInitialized: boolean;
  needsOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    initializeStorage();
  }, []);

  async function initializeStorage() {
    try {
      // Get or create config
      let config = await storageClient.get<StorageConfig>(STORAGE_KEYS.CONFIG);

      if (!config) {
        // First time - create anonymous user ID
        const anonymousUserId = generateId();
        config = {
          version: 1,
          userId: anonymousUserId,
          onboardingCompleted: false,
        };
        await storageClient.set(STORAGE_KEYS.CONFIG, config);
        console.log('Created new anonymous user:', anonymousUserId);
      }

      setUserId(config.userId);
      setNeedsOnboarding(!config.onboardingCompleted);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      // Still mark as initialized to prevent infinite loading
      setIsInitialized(true);
    }
  }

  async function completeOnboarding() {
    try {
      const config = await storageClient.get<StorageConfig>(STORAGE_KEYS.CONFIG);
      if (config) {
        config.onboardingCompleted = true;
        await storageClient.set(STORAGE_KEYS.CONFIG, config);
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }

  return (
    <StorageContext.Provider
      value={{
        userId,
        isInitialized,
        needsOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
