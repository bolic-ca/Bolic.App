/**
 * PreviousPerformance Component
 * Displays previous performance data for an exercise
 */

import React from 'react';
import { Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';

interface PreviousPerformanceProps {
  data: PreviousPerformanceData | null;
}

export default function PreviousPerformance({ data }: PreviousPerformanceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (!data) {
    return (
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        No previous data
      </Text>
    );
  }

  // Build performance string
  let performanceText = `Last time: ${data.weight} kg × ${data.reps} reps`;

  if (data.rir !== undefined || data.rpe !== undefined) {
    const extras = [];
    if (data.rir !== undefined) extras.push(`RIR ${data.rir}`);
    if (data.rpe !== undefined) extras.push(`RPE ${data.rpe}`);
    performanceText += ` (${extras.join(', ')})`;
  }

  return (
    <Text style={[styles.text, { color: theme.textSecondary }]}>
      {performanceText}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
