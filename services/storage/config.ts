/**
 * Storage Configuration
 * Defines storage keys namespace and version for AsyncStorage
 */

// Current storage schema version for migrations
export const STORAGE_VERSION = 1;

// Namespaced storage keys to avoid conflicts
export const STORAGE_KEYS = {
  // App Config
  CONFIG: '@bolic:config',

  // User Data (prefixed with userId)
  USER_DATA_PREFIX: '@bolic:user:',

  // Settings
  ONBOARDING_COMPLETED: '@bolic:onboarding_completed',
} as const;

/**
 * Helper to create user-specific keys
 * @param userId - User ID for namespacing
 * @param key - Data key to access
 * @returns Namespaced storage key
 */
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
