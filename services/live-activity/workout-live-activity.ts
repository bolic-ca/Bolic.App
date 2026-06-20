/**
 * Workout Live Activity Service
 * Thin wrapper around expo-live-activity for the active workout.
 * iOS-only; all functions no-op on other platforms or older iOS.
 */

import { Platform } from 'react-native';
import * as LiveActivity from 'expo-live-activity';

/**
 * Domain-level state for the workout Live Activity.
 * Mapped onto the fixed expo-live-activity layout (title / subtitle / progress bar).
 */
export interface WorkoutActivityState {
  title: string;
  subtitle: string;
  /** 0..1 progress for the current exercise, or undefined to hide the bar. */
  progress?: number;
}

export interface WorkoutActivityConfig {
  /** Accent color for the progress bar (hex). */
  accentColor?: string;
  /** Deep link path opened when the activity is tapped. */
  deepLinkUrl?: string;
}

let activityId: string | undefined;
let lastSignature: string | undefined;
let warned = false;

function isSupported(): boolean {
  return Platform.OS === 'ios';
}

function warnOnce(err: unknown): void {
  if (warned) return;
  warned = true;
  console.warn(
    '[live-activity] Native module unavailable — rebuild the dev client/app after adding the expo-live-activity plugin.',
    err,
  );
}

function toNativeState(state: WorkoutActivityState): LiveActivity.LiveActivityState {
  return {
    title: state.title,
    subtitle: state.subtitle,
    progressBar:
      state.progress !== undefined ? { progress: clampProgress(state.progress) } : undefined,
  };
}

function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function signatureOf(state: WorkoutActivityState): string {
  return `${state.title}|${state.subtitle}|${state.progress ?? ''}`;
}

/**
 * Start a Live Activity for the workout. No-op if one is already running.
 * Returns the activity id, or undefined if it could not be created.
 */
export function startWorkoutActivity(
  state: WorkoutActivityState,
  config?: WorkoutActivityConfig,
): string | undefined {
  if (!isSupported() || activityId) return activityId;

  const nativeConfig: LiveActivity.LiveActivityConfig = {
    deepLinkUrl: config?.deepLinkUrl,
    progressViewTint: config?.accentColor,
  };

  try {
    activityId = LiveActivity.startActivity(toNativeState(state), nativeConfig) ?? undefined;
    lastSignature = activityId ? signatureOf(state) : undefined;
  } catch (err) {
    // Native module missing (e.g. dev build predates the plugin) — fail quietly.
    warnOnce(err);
    activityId = undefined;
    lastSignature = undefined;
  }
  return activityId;
}

/**
 * Update the running Live Activity. Skips redundant updates when nothing changed.
 */
export function updateWorkoutActivity(state: WorkoutActivityState): void {
  if (!isSupported() || !activityId) return;

  const signature = signatureOf(state);
  if (signature === lastSignature) return;

  try {
    LiveActivity.updateActivity(activityId, toNativeState(state));
    lastSignature = signature;
  } catch (err) {
    warnOnce(err);
  }
}

/**
 * End the running Live Activity, optionally showing a final state.
 */
export function stopWorkoutActivity(finalState?: WorkoutActivityState): void {
  if (!isSupported() || !activityId) return;

  const state = finalState ?? { title: 'Workout complete', subtitle: '' };
  try {
    LiveActivity.stopActivity(activityId, toNativeState(state));
  } catch (err) {
    warnOnce(err);
  }
  activityId = undefined;
  lastSignature = undefined;
}

export function hasWorkoutActivity(): boolean {
  return activityId !== undefined;
}
