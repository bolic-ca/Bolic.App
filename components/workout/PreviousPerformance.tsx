/**
 * PreviousPerformance Component
 * Displays previous performance data for an exercise
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';
import { formatRirShort } from '@/services/storage/session-storage';

interface PreviousPerformanceProps {
  data: PreviousPerformanceData | null;
}

export default function PreviousPerformance({ data }: PreviousPerformanceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
        <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          First time doing this exercise
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.cardBorder }]}>
      <Ionicons name="arrow-undo-outline" size={14} color={theme.textSecondary} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>Last:</Text>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>{data.weight}</Text>
          <Text style={[styles.statUnit, { color: theme.textSecondary }]}>kg</Text>
        </View>
        <Text style={[styles.separator, { color: theme.textSecondary }]}>×</Text>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.text }]}>{data.reps}</Text>
          <Text style={[styles.statUnit, { color: theme.textSecondary }]}>reps</Text>
        </View>
        {data.rir !== undefined && (
          <>
            <Text style={[styles.separator, { color: theme.textSecondary }]}>·</Text>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatRirShort(data.rir)}</Text>
              <Text style={[styles.statUnit, { color: theme.textSecondary }]}>
                {data.rir === 'F' || data.rir === 'P' ? '' : 'RIR'}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    fontWeight: '500',
  },
});
