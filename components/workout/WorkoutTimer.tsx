/**
 * WorkoutTimer Component
 * Displays elapsed time for an active workout session
 */

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

interface WorkoutTimerProps {
  startedAt: string;
  color?: string;
}

export default function WorkoutTimer({ startedAt, color = '#000' }: WorkoutTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const calculateElapsed = () => {
      try {
        const start = new Date(startedAt).getTime();
        if (isNaN(start)) {
          return 0;
        }
        const now = Date.now();
        return Math.floor((now - start) / 1000); // seconds
      } catch {
        return 0;
      }
    };

    setElapsedTime(calculateElapsed());

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsed());
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [startedAt]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Text style={[styles.timer, { color }]}>
      {formatTime(elapsedTime)}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'], // Monospace numbers for stable layout
  },
});
