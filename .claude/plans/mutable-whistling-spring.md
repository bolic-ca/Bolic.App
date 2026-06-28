# Hybrid Local Storage + Subscription Architecture Plan

## Overview

Two-phase implementation that combines the best of both approaches:
- **Phase A (Days 1-7)**: Local-first storage foundation - users can use app offline immediately without auth
- **Phase B (Days 8-15)**: Layer in authentication + subscription system with automatic data migration

### Key Benefits of Hybrid Approach
✅ Working app faster (offline functionality in 1 week)
✅ Test storage layer independently before adding auth complexity
✅ Users can start using immediately, then claim their data later
✅ Clean migration path from anonymous → authenticated users
✅ Less risk (validate storage works before building on it)

## Phase A: Local Storage Foundation (Days 1-7)

Build offline-first functionality without requiring authentication. Generate anonymous user IDs for storage namespacing.

### A1: Foundation Setup (Day 1)

#### Install Dependencies
```bash
npm install @react-native-async-storage/async-storage
```

#### Create Core Types

**`types/storage.ts`** - Storage-specific types
```typescript
export interface StorageItem<T> {
  id: string;
  userId: string;
  data: T;
  createdAt: string;
  updatedAt: string;
}

export interface StorageConfig {
  version: number;
  userId: string;
  onboardingCompleted: boolean;
}
```

#### Storage Configuration

**`services/storage/config.ts`** - Storage keys namespace
```typescript
export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  // App Config
  CONFIG: '@bolic:config',

  // User Data (prefixed with userId)
  USER_DATA_PREFIX: '@bolic:user:',

  // Settings
  ONBOARDING_COMPLETED: '@bolic:onboarding_completed',
} as const;

// Helper to create user-specific keys
export function getUserKey(userId: string, key: string): string {
  return `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}:${key}`;
}

// Data keys for each user
export const USER_DATA_KEYS = {
  PROGRAMS_INDEX: 'programs_index',
  PROGRAMS_PREFIX: 'programs:',      // + programId
  ACTIVE_PROGRAM_ID: 'active_program_id',
  SESSIONS_PREFIX: 'sessions:',      // + YYYY-MM
  ACTIVE_SESSION: 'active_session',
  STATS: 'stats',
  PERSONAL_RECORDS: 'prs',
} as const;
```

**`utils/storage-helpers.ts`** - Utilities
```typescript
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
```

### A2: Storage Client (Day 2)

**`services/storage/storage-client.ts`** - AsyncStorage wrapper
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Storage error getting key "${key}":`, error);
    return null;
  }
}

export async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage error setting key "${key}":`, error);
    if (error instanceof Error && error.message.includes('QuotaExceededError')) {
      throw new Error('Storage quota exceeded. Please free up space.');
    }
    throw error;
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage error removing key "${key}":`, error);
    throw error;
  }
}

export async function multiGet(keys: string[]): Promise<Record<string, any>> {
  try {
    const results = await AsyncStorage.multiGet(keys);
    const parsed: Record<string, any> = {};
    for (const [key, value] of results) {
      if (value !== null) {
        try {
          parsed[key] = JSON.parse(value);
        } catch {
          parsed[key] = null;
        }
      }
    }
    return parsed;
  } catch (error) {
    console.error('Storage error in multiGet:', error);
    return {};
  }
}

export async function multiSet(keyValuePairs: [string, any][]): Promise<void> {
  try {
    const jsonPairs: [string, string][] = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(jsonPairs);
  } catch (error) {
    console.error('Storage error in multiSet:', error);
    throw error;
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Storage error getting all keys:', error);
    return [];
  }
}

export async function getKeysWithPrefix(prefix: string): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith(prefix));
  } catch (error) {
    console.error(`Storage error getting keys with prefix "${prefix}":`, error);
    return [];
  }
}
```

**`services/storage/base-storage.ts`** - Generic CRUD
```typescript
import { StorageItem } from '@/types/storage';
import { getUserKey } from './config';
import { generateId, getCurrentTimestamp } from '@/utils/storage-helpers';
import * as storageClient from './storage-client';

export class BaseStorage<T> {
  constructor(private readonly storageKey: string) {}

  async getAll(userId: string): Promise<StorageItem<T>[]> {
    const key = getUserKey(userId, this.storageKey);
    return await storageClient.get<StorageItem<T>[]>(key) || [];
  }

  async getById(userId: string, id: string): Promise<StorageItem<T> | null> {
    const items = await this.getAll(userId);
    return items.find(item => item.id === id) || null;
  }

  async save(userId: string, data: T, existingId?: string): Promise<StorageItem<T>> {
    const items = await this.getAll(userId);
    const timestamp = getCurrentTimestamp();

    const storageItem: StorageItem<T> = {
      id: existingId || generateId(),
      userId,
      data,
      createdAt: existingId ? (items.find(i => i.id === existingId)?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
    };

    if (existingId) {
      const index = items.findIndex(i => i.id === existingId);
      if (index >= 0) {
        items[index] = storageItem;
      } else {
        items.push(storageItem);
      }
    } else {
      items.push(storageItem);
    }

    await this.saveAll(userId, items);
    return storageItem;
  }

  async delete(userId: string, id: string): Promise<void> {
    const items = await this.getAll(userId);
    const filtered = items.filter(item => item.id !== id);
    await this.saveAll(userId, filtered);
  }

  async clear(userId: string): Promise<void> {
    const key = getUserKey(userId, this.storageKey);
    await storageClient.remove(key);
  }

  private async saveAll(userId: string, items: StorageItem<T>[]): Promise<void> {
    const key = getUserKey(userId, this.storageKey);
    await storageClient.set(key, items);
  }
}
```

### A3: Entity Storage Services (Days 3-4)

**`services/storage/training-day-storage.ts`**
```typescript
import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS } from './config';
import { TrainingDay } from '@/types/training';

export const trainingDayStorage = new BaseStorage<TrainingDay>(USER_DATA_KEYS.PROGRAMS_PREFIX);
```

**`services/storage/program-storage.ts`**
```typescript
import { BaseStorage } from './base-storage';
import { USER_DATA_KEYS, getUserKey } from './config';
import { Program } from '@/types/training';
import * as storageClient from './storage-client';

export const programStorage = new BaseStorage<Program>(USER_DATA_KEYS.PROGRAMS_INDEX);

// Additional helper for active program
export async function getActiveProgramId(userId: string): Promise<string | null> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_PROGRAM_ID);
  return await storageClient.get<string>(key);
}

export async function setActiveProgramId(userId: string, programId: string): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_PROGRAM_ID);
  await storageClient.set(key, programId);
}
```

**Create similar files:**
- `services/storage/exercise-storage.ts`
- `services/storage/stats-storage.ts`
- `services/storage/personal-records-storage.ts`
- `services/storage/session-storage.ts` (with month partitioning)

**`services/storage/index.ts`** - Exports
```typescript
export * from './storage-client';
export * from './base-storage';
export * from './config';
export * from './training-day-storage';
export * from './program-storage';
export * from './exercise-storage';
export * from './stats-storage';
export * from './personal-records-storage';
export * from './session-storage';
```

### A4: Storage Context (Day 5)

**`contexts/StorageContext.tsx`** - App initialization
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/services/storage/config';
import * as storageClient from '@/services/storage/storage-client';
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
      let config = await storageClient.get<any>(STORAGE_KEYS.CONFIG);

      if (!config) {
        // First time - create anonymous user ID
        config = {
          version: 1,
          userId: generateId(),
          onboardingCompleted: false,
        };
        await storageClient.set(STORAGE_KEYS.CONFIG, config);
      }

      setUserId(config.userId);
      setNeedsOnboarding(!config.onboardingCompleted);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  async function completeOnboarding() {
    const config = await storageClient.get<any>(STORAGE_KEYS.CONFIG);
    if (config) {
      config.onboardingCompleted = true;
      await storageClient.set(STORAGE_KEYS.CONFIG, config);
      setNeedsOnboarding(false);
    }
  }

  return (
    <StorageContext.Provider value={{ userId, isInitialized, needsOnboarding, completeOnboarding }}>
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
```

### A5: React Hooks (Days 6-7)

**`hooks/usePrograms.ts`**
```typescript
import { useState, useEffect } from 'react';
import { Program } from '@/types/training';
import { useStorage } from '@/contexts/StorageContext';
import { programStorage } from '@/services/storage/program-storage';

export function usePrograms() {
  const { userId } = useStorage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchPrograms() {
    try {
      setLoading(true);
      const items = await programStorage.getAll(userId);
      setPrograms(items.map(item => item.data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load programs'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      fetchPrograms();
    }
  }, [userId]);

  async function createProgram(program: Omit<Program, 'id'>): Promise<Program> {
    const item = await programStorage.save(userId, program as Program);
    await fetchPrograms();
    return item.data;
  }

  async function updateProgram(program: Program): Promise<void> {
    await programStorage.save(userId, program, program.id);
    await fetchPrograms();
  }

  async function deleteProgram(id: string): Promise<void> {
    await programStorage.delete(userId, id);
    await fetchPrograms();
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
```

**Create similar hooks:**
- `hooks/useActiveProgram.ts`
- `hooks/useTrainingDays.ts`
- `hooks/useWorkoutSession.ts`
- `hooks/useStats.ts`

**Update existing `hooks/useTrainingDay.ts`** to use storage instead of data-source

### A6: UI Integration

**Update `app/_layout.tsx`** - Add StorageProvider
```typescript
import { StorageProvider } from '@/contexts/StorageContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StorageProvider>
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* ... other screens */}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CustomThemeProvider>
    </StorageProvider>
  );
}
```

**Update `app/index.tsx`** - Route guard with onboarding
```typescript
import { useStorage } from '@/contexts/StorageContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isInitialized, needsOnboarding } = useStorage();

  if (!isInitialized) {
    return null; // Loading
  }

  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
```

**Create `app/onboarding.tsx`** - Simple onboarding
```typescript
import { View, Text, Button } from 'react-native';
import { useStorage } from '@/contexts/StorageContext';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const { completeOnboarding } = useStorage();

  async function handleComplete() {
    await completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <View>
      <Text>Welcome to Bolic!</Text>
      <Text>Track your workouts offline, anytime.</Text>
      <Button title="Get Started" onPress={handleComplete} />
    </View>
  );
}
```

**Update `app/(tabs)/programs.tsx`** - Use hooks instead of mock data
```typescript
import { usePrograms } from '@/hooks/usePrograms';

export default function ProgramsScreen() {
  const { programs, loading, error, createProgram } = usePrograms();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {programs.map(program => (
        <Text key={program.id}>{program.name}</Text>
      ))}
    </View>
  );
}
```

**✅ END OF PHASE A - Working offline app in 7 days**

---

## Phase B: Authentication + Subscription Layer (Days 8-15)

Layer authentication and subscription on top of existing local storage. Migrate anonymous users to authenticated accounts.

### B1: Auth Types & Services (Day 8)

**`types/auth.ts`**
```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  subscription: SubscriptionStatus;
  anonymousUserId?: string; // For data migration
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  tier: 'free' | 'premium';
  expiresAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
  anonymousUserId?: string; // Pass to claim existing data
}
```

**`services/auth/auth-service.ts`**
```typescript
import { apiRequest } from '../api/client';
import { User, LoginCredentials, SignupCredentials, AuthTokens } from '@/types/auth';

export async function login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
  return apiRequest({
    method: 'POST',
    endpoint: '/auth/login',
    body: credentials,
  });
}

export async function signup(credentials: SignupCredentials): Promise<{ user: User; tokens: AuthTokens }> {
  return apiRequest({
    method: 'POST',
    endpoint: '/auth/signup',
    body: credentials,
  });
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  return apiRequest({
    method: 'POST',
    endpoint: '/auth/refresh',
    body: { refreshToken },
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest({
    method: 'GET',
    endpoint: '/auth/me',
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await apiRequest({
    method: 'POST',
    endpoint: '/auth/logout',
    body: { refreshToken },
  });
}
```

**`services/storage/token-storage.ts`**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '@/types/auth';

const TOKEN_KEY = '@bolic:auth:tokens';

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function getTokens(): Promise<AuthTokens | null> {
  const json = await AsyncStorage.getItem(TOKEN_KEY);
  return json ? JSON.parse(json) : null;
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function isTokenExpired(tokens: AuthTokens): boolean {
  return new Date(tokens.expiresAt) <= new Date();
}
```

### B2: Auth Context (Day 9)

**`contexts/AuthContext.tsx`**
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import * as authService from '@/services/auth/auth-service';
import * as tokenStorage from '@/services/storage/token-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = '@bolic:auth:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const tokens = await tokenStorage.getTokens();
      if (tokens && !tokenStorage.isTokenExpired(tokens)) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      await tokenStorage.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { user: userData, tokens } = await authService.login({ email, password });
    await tokenStorage.saveTokens(tokens);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function signup(email: string, password: string, name?: string) {
    // Get anonymous userId from StorageContext
    const config = await AsyncStorage.getItem('@bolic:config');
    const anonymousUserId = config ? JSON.parse(config).userId : undefined;

    const { user: userData, tokens } = await authService.signup({
      email,
      password,
      name,
      anonymousUserId, // Pass to backend to claim existing data
    });

    await tokenStorage.saveTokens(tokens);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setUser(userData);

    // Update config with real user ID
    if (config) {
      const configObj = JSON.parse(config);
      configObj.userId = userData.id;
      await AsyncStorage.setItem('@bolic:config', JSON.stringify(configObj));
    }
  }

  async function logout() {
    const tokens = await tokenStorage.getTokens();
    if (tokens) {
      try {
        await authService.logout(tokens.refreshToken);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    await tokenStorage.clearTokens();
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  }

  async function refreshUser() {
    const tokens = await tokenStorage.getTokens();
    if (tokens) {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### B3: Auth Screens (Day 10)

**`app/(auth)/_layout.tsx`**
```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
```

**`app/(auth)/login.tsx`**
```typescript
import { View, TextInput, Button, Text } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleLogin() {
    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <View>
      <Text>Login to Bolic</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      {error && <Text>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <Button title="Create Account" onPress={() => router.push('/(auth)/signup')} />
      <Button title="Continue Without Account" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}
```

**`app/(auth)/signup.tsx`** - Similar structure, calls `signup()`

**Update `app/index.tsx`**
```typescript
import { useStorage } from '@/contexts/StorageContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isInitialized, needsOnboarding } = useStorage();

  if (!isInitialized) return null;
  if (needsOnboarding) return <Redirect href="/onboarding" />;

  // Let users choose to login or continue anonymously
  return <Redirect href="/(auth)/login" />;
}
```

### B4: Subscription Management (Day 11)

**`services/subscription/subscription-service.ts`**
```typescript
import { apiRequest } from '../api/client';
import { SubscriptionStatus } from '@/types/auth';

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  return apiRequest({
    method: 'GET',
    endpoint: `/subscription/status/${userId}`,
  });
}

export async function activateSubscription(userId: string): Promise<SubscriptionStatus> {
  return apiRequest({
    method: 'POST',
    endpoint: '/subscription/activate',
    body: { userId },
  });
}

export async function deactivateSubscription(userId: string): Promise<SubscriptionStatus> {
  return apiRequest({
    method: 'POST',
    endpoint: '/subscription/deactivate',
    body: { userId },
  });
}
```

**Update `contexts/AuthContext.tsx`** - Add subscription methods
```typescript
// Add to interface
interface AuthContextType {
  // ... existing
  upgradeToSubscription: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
}

// Add to provider
async function upgradeToSubscription() {
  if (!user) return;

  const newStatus = await subscriptionService.activateSubscription(user.id);

  // Upload all local data to cloud (implemented in Phase B5)
  await uploadAllLocalData(user.id);

  const updatedUser = { ...user, subscription: newStatus };
  setUser(updatedUser);
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
}

async function downgradeToFree() {
  if (!user) return;

  await downloadAllCloudData(user.id);

  const newStatus = await subscriptionService.deactivateSubscription(user.id);
  const updatedUser = { ...user, subscription: newStatus };
  setUser(updatedUser);
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
}
```

### B5: Cloud Sync Layer (Days 12-13)

**`types/storage.ts`** - Add sync types
```typescript
export interface SyncQueueItem {
  id: string;
  userId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'training_day' | 'program' | 'exercise' | 'stats' | 'pr';
  entityId: string;
  payload: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
}
```

**`services/sync/sync-queue.ts`**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueueItem } from '@/types/storage';
import { generateId, getCurrentTimestamp } from '@/utils/storage-helpers';

const SYNC_QUEUE_KEY = '@bolic:sync:queue';

export async function enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<void> {
  const queue = await getQueue();
  const queueItem: SyncQueueItem = {
    ...item,
    id: generateId(),
    createdAt: getCurrentTimestamp(),
  };
  queue.push(queueItem);
  await saveQueue(queue);
}

export async function getPending(userId: string): Promise<SyncQueueItem[]> {
  const queue = await getQueue();
  return queue.filter(
    item => item.userId === userId && (item.status === 'pending' || item.status === 'failed')
  );
}

export async function updateStatus(
  id: string,
  status: SyncQueueItem['status'],
  retryCount?: number
): Promise<void> {
  const queue = await getQueue();
  const item = queue.find(i => i.id === id);
  if (item) {
    item.status = status;
    if (retryCount !== undefined) item.retryCount = retryCount;
    await saveQueue(queue);
  }
}

export async function clearCompleted(): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter(item => item.status !== 'completed');
  await saveQueue(filtered);
}

async function getQueue(): Promise<SyncQueueItem[]> {
  const json = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  return json ? JSON.parse(json) : [];
}

async function saveQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}
```

**`services/sync/sync-service.ts`**
```typescript
import * as syncQueue from './sync-queue';
import * as trainingDaysApi from '../api/training-days';
import { apiRequest } from '../api/client';
import { trainingDayStorage, programStorage } from '../storage';

let syncInterval: NodeJS.Timeout | null = null;

export async function startSync(userId: string): Promise<void> {
  if (syncInterval) return;

  await processSyncQueue(userId);

  syncInterval = setInterval(() => {
    processSyncQueue(userId).catch(console.error);
  }, 30000); // Every 30 seconds
}

export function stopSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export async function processSyncQueue(userId: string): Promise<void> {
  const pending = await syncQueue.getPending(userId);

  for (const item of pending) {
    if (item.retryCount >= 3) {
      await syncQueue.updateStatus(item.id, 'failed');
      continue;
    }

    try {
      await syncQueue.updateStatus(item.id, 'in_progress');
      await processQueueItem(item);
      await syncQueue.updateStatus(item.id, 'completed');
    } catch (error) {
      console.error('Sync failed:', item.id, error);
      await syncQueue.updateStatus(item.id, 'failed', item.retryCount + 1);
    }
  }

  await syncQueue.clearCompleted();
}

async function processQueueItem(item: SyncQueueItem): Promise<void> {
  switch (item.entityType) {
    case 'training_day':
      if (item.operation === 'CREATE' || item.operation === 'UPDATE') {
        await trainingDaysApi.createTrainingDay(item.payload);
      } else if (item.operation === 'DELETE') {
        await trainingDaysApi.deleteTrainingDay({ id: item.entityId });
      }
      break;
    // Handle other entity types
  }
}

export async function uploadAllLocalData(userId: string): Promise<void> {
  const trainingDays = await trainingDayStorage.getAll(userId);
  const programs = await programStorage.getAll(userId);

  await apiRequest({
    method: 'POST',
    endpoint: '/sync/batch',
    body: {
      trainingDays: trainingDays.map(item => item.data),
      programs: programs.map(item => item.data),
    },
  });
}

export async function downloadAllCloudData(userId: string): Promise<void> {
  const response = await apiRequest({
    method: 'GET',
    endpoint: `/sync/all?userId=${userId}`,
  });

  for (const trainingDay of response.trainingDays) {
    await trainingDayStorage.save(userId, trainingDay, trainingDay.id);
  }

  for (const program of response.programs) {
    await programStorage.save(userId, program, program.id);
  }
}
```

### B6: Update Storage Services for Sync (Day 14)

**Update `services/storage/base-storage.ts`** - Add sync queue
```typescript
import * as syncQueue from '../sync/sync-queue';

export class BaseStorage<T> {
  constructor(
    private readonly storageKey: string,
    private readonly entityType: 'training_day' | 'program' | 'exercise' | 'stats' | 'pr'
  ) {}

  async save(
    userId: string,
    data: T,
    existingId?: string,
    shouldSync: boolean = false
  ): Promise<StorageItem<T>> {
    const items = await this.getAll(userId);
    // ... existing save logic ...

    await this.saveAll(userId, items);

    // Queue for sync if enabled
    if (shouldSync) {
      await syncQueue.enqueue({
        userId,
        operation: existingId ? 'UPDATE' : 'CREATE',
        entityType: this.entityType,
        entityId: storageItem.id,
        payload: data,
        status: 'pending',
        retryCount: 0,
      });
    }

    return storageItem;
  }

  async delete(userId: string, id: string, shouldSync: boolean = false): Promise<void> {
    // ... existing delete logic ...

    if (shouldSync) {
      await syncQueue.enqueue({
        userId,
        operation: 'DELETE',
        entityType: this.entityType,
        entityId: id,
        payload: null,
        status: 'pending',
        retryCount: 0,
      });
    }
  }
}
```

**Update storage instances** to pass entityType:
```typescript
export const trainingDayStorage = new BaseStorage<TrainingDay>(
  USER_DATA_KEYS.PROGRAMS_PREFIX,
  'training_day'
);
export const programStorage = new BaseStorage<Program>(
  USER_DATA_KEYS.PROGRAMS_INDEX,
  'program'
);
```

**Update hooks to pass sync flag** - Example `usePrograms.ts`:
```typescript
import { useAuth } from '@/contexts/AuthContext';

export function usePrograms() {
  const { userId } = useStorage();
  const { user } = useAuth();
  const shouldSync = user?.subscription.isSubscribed || false;

  async function createProgram(program: Omit<Program, 'id'>): Promise<Program> {
    const item = await programStorage.save(userId, program as Program, undefined, shouldSync);
    await fetchPrograms();
    return item.data;
  }

  // Similar for update/delete
}
```

### B7: Update Layout & API Client (Day 15)

**Update `app/_layout.tsx`** - Add AuthProvider
```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <StorageProvider>
        <CustomThemeProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* ... screens */}
          </ThemeProvider>
        </CustomThemeProvider>
      </StorageProvider>
    </AuthProvider>
  );
}
```

**Update `services/api/client.ts`** - Add auth interceptors
```typescript
import { getTokens, saveTokens, clearTokens, isTokenExpired } from '../storage/token-storage';
import { refreshToken } from '../auth/auth-service';

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const { method, endpoint, body, params } = options;

  let url = `${API_CONFIG.baseURL}${endpoint}`;
  if (params && method === 'GET') {
    const queryString = new URLSearchParams(params).toString();
    url = `${url}?${queryString}`;
  }

  // Inject auth token
  const tokens = await getTokens();
  const headers = { ...API_CONFIG.headers };
  if (tokens && !isTokenExpired(tokens)) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    // Handle 401 - refresh token
    if (response.status === 401 && tokens) {
      try {
        const newTokens = await refreshToken(tokens.refreshToken);
        await saveTokens(newTokens);
        // Retry with new token
        headers.Authorization = `Bearer ${newTokens.accessToken}`;
        const retryResponse = await fetch(url, { ...config, headers });
        return await retryResponse.json();
      } catch {
        await clearTokens();
        throw new APIError('Session expired', 401);
      }
    }

    if (!response.ok) {
      throw new APIError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error instanceof Error ? error.message : 'Unknown error');
  }
}
```

**Add subscription toggle to profile** - `app/(tabs)/profile.tsx`
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, isAuthenticated, upgradeToSubscription, downgradeToFree, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <View>
        <Text>Using app anonymously</Text>
        <Button title="Create Account" onPress={() => router.push('/(auth)/signup')} />
      </View>
    );
  }

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Text>Subscription: {user?.subscription.isSubscribed ? 'Premium' : 'Free'}</Text>

      {!user?.subscription.isSubscribed && (
        <Button title="Upgrade to Premium (Test)" onPress={upgradeToSubscription} />
      )}

      {user?.subscription.isSubscribed && (
        <Button title="Downgrade to Free (Test)" onPress={downgradeToFree} />
      )}

      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

**✅ END OF PHASE B - Full auth + subscription system**

---

## File Structure Summary

### New Files (Phase A)
- `types/storage.ts`
- `services/storage/` (9 files: config, storage-client, base-storage, token-storage, training-day-storage, program-storage, exercise-storage, stats-storage, session-storage, index)
- `utils/storage-helpers.ts`
- `contexts/StorageContext.tsx`
- `hooks/usePrograms.ts`, `hooks/useActiveProgram.ts`, `hooks/useWorkoutSession.ts`, `hooks/useStats.ts`
- `app/onboarding.tsx`

### New Files (Phase B)
- `types/auth.ts`
- `services/auth/auth-service.ts`
- `services/subscription/subscription-service.ts`
- `services/sync/sync-queue.ts`, `services/sync/sync-service.ts`
- `contexts/AuthContext.tsx`
- `app/(auth)/_layout.tsx`, `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`

### Modified Files
- `app/_layout.tsx` - Add providers
- `app/index.tsx` - Update routing logic
- `app/(tabs)/profile.tsx` - Add auth UI
- `app/(tabs)/programs.tsx` - Use hooks
- `services/api/client.ts` - Add auth interceptors
- `hooks/useTrainingDay.ts` - Use storage
- `package.json` - Add AsyncStorage

## Backend API Requirements

### Phase A
None (fully offline)

### Phase B
- **Auth**: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- **Subscription**: `/subscription/status/:userId`, `/subscription/activate`, `/subscription/deactivate`
- **Sync**: `/sync/batch` (POST), `/sync/all` (GET with userId query)

## Key Migration Strategy

When anonymous user signs up:
1. Pass `anonymousUserId` in signup request
2. Backend associates anonymous local data with new user account
3. Frontend updates config with real user ID
4. All future operations use authenticated user ID
5. Existing local storage keys remain valid (same userId in keys)

## Testing Checklist

**Phase A:**
- [ ] Generate anonymous user ID on first launch
- [ ] Save/load programs offline
- [ ] Data persists after app restart
- [ ] Onboarding shows once

**Phase B:**
- [ ] Signup claims anonymous data
- [ ] Login restores session
- [ ] Token refresh on 401
- [ ] Upgrade uploads local data
- [ ] Downgrade downloads final snapshot
- [ ] Sync queue processes in background
- [ ] Offline writes sync when online

## Timeline

- **Phase A**: Days 1-7 (offline foundation)
- **Phase B**: Days 8-15 (auth + subscription)
- **Total**: 15 days

## Success Criteria

✅ Users can use app offline without account
✅ Users can create account to claim their data
✅ Free users: local storage only
✅ Premium users: automatic cloud sync
✅ Seamless upgrade/downgrade flows
✅ No data loss during transitions
