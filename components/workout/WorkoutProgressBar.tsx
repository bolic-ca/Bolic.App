/**
 * WorkoutProgressBar Component
 * Displays workout progress statistics
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface WorkoutProgressBarProps {
  completedExercises: number;
  totalExercises: number;
  totalSets: number;
}

export default function WorkoutProgressBar({
  completedExercises,
  totalExercises,
  totalSets,
}: WorkoutProgressBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const progressText = `${completedExercises}/${totalExercises} exercises • ${totalSets} sets completed`;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.progressText, { color: theme.text }]}>
        {progressText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
