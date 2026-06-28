/**
 * WorkoutProgressBar Component
 * Displays workout progress statistics with visual progress bar
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';

interface WorkoutProgressBarProps {
  completedExercises: number;
  totalExercises: number;
  totalSets: number;
  totalVolume?: number; // weight × reps sum
}

function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k`;
  }
  return volume.toLocaleString();
}

export default function WorkoutProgressBar({
  completedExercises,
  totalExercises,
  totalSets,
  totalVolume = 0,
}: WorkoutProgressBarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { customColors } = useThemeCustomization();

  const progress = totalExercises > 0 ? completedExercises / totalExercises : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: customColors.primaryButton, width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressPercent, { color: theme.text }]}>
          {progressPercent}%
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {completedExercises}/{totalExercises}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>exercises</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{totalSets}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>sets</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />

        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatVolume(totalVolume)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>kg volume</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
  },
});
