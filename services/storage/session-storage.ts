/**
 * Session Storage
 * Storage service for workout sessions with month-based partitioning
 */

import { USER_DATA_KEYS, getUserKey } from './config';
import { getMonthKey, generateId, getCurrentTimestamp } from '@/utils/storage-helpers';
import * as storageClient from './storage-client';
import { StorageItem } from '@/types/storage';

/**
 * Workout session
 */
export interface WorkoutSession {
  id: string;
  programId: string;
  trainingDayId: string;
  name?: string;
  startedAt: string;
  completedAt: string | null;
  exercises: SessionExercise[];
  /**
   * Maps originalExerciseId (from training day template) -> replacement exercise.
   * Recorded when user swaps an exercise mid-workout.
   * NOTE: Flagged for addition to OpenAPI spec in Phase B.
   */
  exerciseOverrides?: Record<string, { exerciseId: string; exerciseName: string }>;
  notes?: string;
}

/**
 * Exercise within a session
 */
export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
}

/**
 * RIR (Reps In Reserve) value
 * - number: standard RIR (0-5+)
 * - 'F': Failure (went to absolute failure)
 * - 'P': Partials (went beyond failure with partial reps)
 */
export type RirValue = number | 'F' | 'P';

/**
 * Set within a session
 */
export interface SessionSet {
  weight: number;
  reps: number;
  rir?: RirValue;
  rpe?: number;
  notes?: string;
  completedAt: string;
}

/**
 * Format RIR value for display
 */
export function formatRir(rir: RirValue): string {
  if (rir === 'F') return 'Failure';
  if (rir === 'P') return 'Partials';
  return String(rir);
}

/**
 * Format RIR value for short display
 */
export function formatRirShort(rir: RirValue): string {
  if (rir === 'F') return 'F';
  if (rir === 'P') return 'P';
  return String(rir);
}

/**
 * Get sessions for a specific month
 * @param userId - User ID
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of sessions for that month
 */
export async function getSessionsByMonth(
  userId: string,
  year: number,
  month: number
): Promise<StorageItem<WorkoutSession>[]> {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const key = getUserKey(userId, `${USER_DATA_KEYS.SESSIONS_PREFIX}${monthKey}`);
  return await storageClient.get<StorageItem<WorkoutSession>[]>(key) || [];
}

/**
 * Get sessions for current month
 * @param userId - User ID
 * @returns Array of sessions for current month
 */
export async function getCurrentMonthSessions(userId: string): Promise<StorageItem<WorkoutSession>[]> {
  const now = new Date();
  return getSessionsByMonth(userId, now.getFullYear(), now.getMonth() + 1);
}

/**
 * Save a session (automatically partitions by month)
 * @param userId - User ID
 * @param session - Session data
 * @param existingId - Optional ID for updates
 * @returns Saved storage item
 */
export async function saveSession(
  userId: string,
  session: WorkoutSession,
  existingId?: string
): Promise<StorageItem<WorkoutSession>> {
  const sessionDate = new Date(session.startedAt);
  const year = sessionDate.getFullYear();
  const month = sessionDate.getMonth() + 1;

  const sessions = await getSessionsByMonth(userId, year, month);
  const timestamp = getCurrentTimestamp();

  const storageItem: StorageItem<WorkoutSession> = {
    id: existingId || generateId(),
    userId,
    data: session,
    createdAt: existingId ? (sessions.find(s => s.id === existingId)?.createdAt || timestamp) : timestamp,
    updatedAt: timestamp,
  };

  if (existingId) {
    const index = sessions.findIndex(s => s.id === existingId);
    if (index >= 0) {
      sessions[index] = storageItem;
    } else {
      sessions.push(storageItem);
    }
  } else {
    sessions.push(storageItem);
  }

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const key = getUserKey(userId, `${USER_DATA_KEYS.SESSIONS_PREFIX}${monthKey}`);
  await storageClient.set(key, sessions);

  return storageItem;
}

/**
 * Get active workout session
 * @param userId - User ID
 * @returns Active session or null
 */
export async function getActiveSession(userId: string): Promise<StorageItem<WorkoutSession> | null> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_SESSION);
  return await storageClient.get<StorageItem<WorkoutSession>>(key);
}

/**
 * Set active workout session
 * @param userId - User ID
 * @param session - Session storage item
 */
export async function setActiveSession(
  userId: string,
  session: StorageItem<WorkoutSession>
): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_SESSION);
  await storageClient.set(key, session);
}

/**
 * Clear active workout session
 * @param userId - User ID
 */
export async function clearActiveSession(userId: string): Promise<void> {
  const key = getUserKey(userId, USER_DATA_KEYS.ACTIVE_SESSION);
  await storageClient.remove(key);
}

/**
 * Get session history (recent sessions across months)
 * @param userId - User ID
 * @param limit - Maximum number of sessions to return
 * @returns Array of recent sessions
 */
export async function getSessionHistory(
  userId: string,
  limit: number = 20
): Promise<StorageItem<WorkoutSession>[]> {
  const now = new Date();
  const sessions: StorageItem<WorkoutSession>[] = [];

  // Look back up to 3 months
  for (let i = 0; i < 3 && sessions.length < limit; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthSessions = await getSessionsByMonth(userId, date.getFullYear(), date.getMonth() + 1);
    sessions.push(...monthSessions);
  }

  // Sort by date descending and limit
  return sessions
    .sort((a, b) => new Date(b.data.startedAt).getTime() - new Date(a.data.startedAt).getTime())
    .slice(0, limit);
}

/**
 * Delete a session
 * @param userId - User ID
 * @param sessionId - Session ID
 * @param sessionDate - Date string of the session (to locate month partition)
 */
export async function deleteSession(
  userId: string,
  sessionId: string,
  sessionDate: string
): Promise<void> {
  const date = new Date(sessionDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const sessions = await getSessionsByMonth(userId, year, month);
  const updatedSessions = sessions.filter(s => s.id !== sessionId);

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const key = getUserKey(userId, `${USER_DATA_KEYS.SESSIONS_PREFIX}${monthKey}`);
  
  await storageClient.set(key, updatedSessions);
}
