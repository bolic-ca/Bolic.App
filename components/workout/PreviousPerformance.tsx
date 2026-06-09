/**
 * PreviousPerformance Component
 * Displays previous performance data for an exercise
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useThemeCustomization } from '@/contexts/ThemeContext';
import type { PreviousPerformance as PreviousPerformanceData } from '@/utils/workout-helpers';
import { formatRirShort } from '@/services/storage/session-storage';
import { displayWeight } from '@/utils/weight';

interface PreviousPerformanceProps {
  data: PreviousPerformanceData | null;
}

export default function PreviousPerformance({ data }: PreviousPerformanceProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { preferences } = useThemeCustomization();

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
      <View style={styles.headerRow}>
        <Ionicons name="arrow-undo-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Previous</Text>
      </View>
      <View style={styles.setsContainer}>
        {data.sets.map((set, idx) => (
          <View key={idx} style={styles.setRow}>
            <Text style={[styles.setIndex, { color: theme.textSecondary }]}>{idx + 1}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {displayWeight(set.weight, preferences.weightUnit)}{preferences.weightUnit} × {set.reps}
            </Text>
            {set.numberOfPartials !== undefined ? (
              <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                +{set.numberOfPartials}P
              </Text>
            ) : set.rir !== undefined && (
              <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                {set.rir === 'F' ? 'F' : `${formatRirShort(set.rir)}RIR`}
              </Text>
            )}
            {set.rpe !== undefined && (
              <Text style={[styles.setMeta, { color: theme.textSecondary }]}>
                RPE{set.rpe}
              </Text>
            )}
            {set.notes && (
              <Text style={[styles.setNotes, { color: theme.textSecondary }]} numberOfLines={1}>
                {set.notes.length > 3 ? `${set.notes.slice(0, 3)}…` : set.notes}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  setsContainer: {
    gap: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setIndex: {
    fontSize: 11,
    fontWeight: '600',
    width: 14,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  setMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  setNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
});
